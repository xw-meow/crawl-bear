#!/usr/bin/env python3
"""Turn the generated art in `promos/crawl-bear-promo/public/assets/generated/` into film-ready WebP.

Workflow (see `promos/crawl-bear-promo/ASSETS.md` for the prompt):

    1. Generate the PNG with the prompt in `promos/crawl-bear-promo/ASSETS.md`.
    2. Drop it into `promos/crawl-bear-promo/public/assets/generated/` using the exact filename
       (`dafeiyu@2k.png`).
    3. Run this script from `promos/crawl-bear-promo/`:

           python3 scripts/apply_art.py             # process + write
           python3 scripts/apply_art.py --dry-run   # show what would change

What it does:
    * trim the transparent margin, downscale so the long side is <= 2048 px,
      convert to WebP and write `public/assets/generated/dafeiyu.webp`, which the
      prologue's `<OptionalArt>` picks up automatically — no code changes needed.
    * any other PNG / non-PNG file: skipped with a hint.

The script never fails because a file is missing: an empty or absent
`generated/` folder just prints a friendly "nothing to do" message. It is safe
to re-run as often as you like; outputs are overwritten deterministically.

If the image generator produces an opaque cream background instead of
transparency, the script flood-fills the background to alpha before trimming,
so the art composites cleanly over the film's paper backdrop.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, UnidentifiedImageError

PROMO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_SOURCE = PROMO_ROOT / "public" / "assets" / "generated"
DEFAULT_PUBLIC = PROMO_ROOT / "public"

MAX_LONG_SIDE = 2048
# Bear art keeps alpha; the paper sheet and other textures use a slightly
# lower quality because they are flat and invisible at that bitrate anyway.
WEBP_QUALITY_CHARACTER = 92
WEBP_QUALITY_SHEET = 88
SENTINEL = (255, 0, 255)


# ---------------------------------------------------------------------------
# Filename -> output mapping. Keep this in sync with promos/crawl-bear-promo/ASSETS.md.
# ---------------------------------------------------------------------------

# kind: "character" = trim alpha + resize + keep transparency
#       "sheet"     = no trimming, resize, opaque background is fine
TARGETS: dict[str, tuple[str, str, str]] = {
    # 引子拍立得里的大肥鱼（OptionalArt 探测，缺图回退手绘占位）
    "dafeiyu@2k.png": ("character", "assets/generated/dafeiyu.webp", "ART"),
}


# ---------------------------------------------------------------------------
# Image helpers
# ---------------------------------------------------------------------------


def has_usable_alpha(image: Image.Image) -> bool:
    """True when the PNG really carries transparent pixels (not just an alpha
    channel that is fully opaque)."""
    if image.mode not in ("RGBA", "LA") and "transparency" not in image.info:
        return False
    alpha = image.convert("RGBA").getchannel("A")
    low, _high = alpha.getextrema()
    return low < 250


def strip_opaque_background(image: Image.Image, threshold: int = 34) -> Image.Image:
    """Flood-fill the solid paper background from the corners to transparent.

    gpt-image-2 usually returns either true transparency (preferred) or the
    character on a flat cream sheet. For the flat-sheet case we knock the
    connected background out from all four corners so the bear can composite
    over the film's paper texture. Only the connected outer region is cleared,
    so cream-coloured fur/belly areas inside the character stay opaque.
    """
    rgb = image.convert("RGB")
    width, height = rgb.size
    corners = ((0, 0), (width - 1, 0), (0, height - 1), (width - 1, height - 1))
    for seed in corners:
        try:
            ImageDraw.floodfill(rgb, seed, SENTINEL, thresh=threshold)
        except (ValueError, OSError):  # degenerate 1 px images etc.
            continue

    background = np.all(np.asarray(rgb) == SENTINEL, axis=2)
    rgba = np.array(image.convert("RGBA"))
    rgba[background, 3] = 0
    return Image.fromarray(rgba, mode="RGBA")


def trim_transparent_border(image: Image.Image) -> Image.Image:
    """Crop away fully transparent margins so the character sits tightly."""
    alpha = image.getchannel("A")
    bbox = alpha.getbbox()
    if bbox:
        return image.crop(bbox)
    return image


def downscale(image: Image.Image, max_long_side: int = MAX_LONG_SIDE) -> Image.Image:
    """Downscale only — never upscale a 1024 px generation into a blurry 2048."""
    width, height = image.size
    if max(width, height) <= max_long_side:
        return image
    scale = max_long_side / float(max(width, height))
    target = (max(1, round(width * scale)), max(1, round(height * scale)))
    return image.resize(target, Image.LANCZOS)


def describe_size(image: Image.Image) -> str:
    return f"{image.width}x{image.height}"


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Process gpt-image-2 art in promos/crawl-bear-promo/public/assets/generated/ into WebP.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="process the images but do not write any file",
    )
    parser.add_argument(
        "--source",
        type=Path,
        default=None,
        help=f"folder with generated PNGs (default: {DEFAULT_SOURCE})",
    )
    parser.add_argument(
        "--public",
        type=Path,
        default=None,
        help=f"promo public root the webp files are written under (default: {DEFAULT_PUBLIC})",
    )
    return parser


def resolve_inputs(source_dir: Path) -> tuple[list[tuple[str, Path]], list[Path]]:
    """Return (recognised filename -> source path, unrecognised files)."""
    recognised: dict[str, Path] = {}
    unknown: list[Path] = []

    if not source_dir.is_dir():
        return [], []

    for path in sorted(source_dir.iterdir()):
        if not path.is_file() or path.name.startswith("."):
            continue
        if path.suffix.lower() != ".png":
            # Processed webp files from an earlier run live in the same folder —
            # ignore them silently instead of calling them "unknown".
            if path.suffix.lower() in (".webp", ".md", ".txt", ".json", ".ds_store"):
                continue
            unknown.append(path)
            continue

        if path.name in TARGETS:
            recognised[path.name] = path
            continue

        # Friendly fallback: accept `dafeiyu.png` for `dafeiyu@2k.png`.
        alias = f"{path.stem}@2k.png"
        if alias in TARGETS:
            print(f"  note: found {path.name}, treating it as {alias} (rename it to drop this note)")
            recognised[alias] = path
            continue

        unknown.append(path)

    return list(recognised.items()), unknown


def process_one(
    source_name: str,
    source_path: Path,
    dest_public: Path,
    dry_run: bool,
) -> dict[str, object] | None:
    kind, relative_out, tier = TARGETS[source_name]
    try:
        image = Image.open(source_path)
        image.load()
    except (UnidentifiedImageError, OSError) as error:
        print(f"  ! {source_name}: cannot read PNG ({error}) — skipped")
        return None

    original_size = describe_size(image)
    note = ""

    if kind == "character":
        if has_usable_alpha(image):
            image = image.convert("RGBA")
        else:
            note = "no alpha -> background knocked out"
            image = strip_opaque_background(image)
        image = trim_transparent_border(image)
        image = downscale(image)
    else:  # "sheet"
        image = image.convert("RGB")
        image = downscale(image)

    destination = dest_public / relative_out
    tier_label = tier
    print(
        f"  {tier_label:<3} {source_name:<28} {original_size:>9} -> {describe_size(image):<9}"
        f" {relative_out}" + (f"   ({note})" if note else "")
    )
    if not dry_run:
        destination.parent.mkdir(parents=True, exist_ok=True)
        quality = WEBP_QUALITY_CHARACTER if kind == "character" else WEBP_QUALITY_SHEET
        image.save(destination, "WEBP", quality=quality, method=6)
        print(f"       wrote {destination.relative_to(dest_public.parent)} "
              f"({destination.stat().st_size / 1024:.0f} KB)")

    return {
        "tier": tier,
        "name": source_name,
        "out": relative_out,
        "size": describe_size(image),
        "dry_run": dry_run,
    }


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    source_public = (args.public or DEFAULT_PUBLIC).resolve()
    dest_public = source_public
    source_dir = (args.source or (source_public / "assets" / "generated")).resolve()

    print("CrawlBear promo — processing generated art")
    print(f"  source: {source_dir}")
    print(f"  output: {dest_public}/assets/…")
    if args.dry_run:
        print("  mode:   dry run (no files written)")
    print()

    recognised, unknown = resolve_inputs(source_dir)

    if not recognised:
        print("Nothing to process: no recognised PNG in the generated folder.")
        print("  → Generate the image with the prompt in promos/crawl-bear-promo/ASSETS.md, then drop")
        print("    it here using the exact filename (e.g. dafeiyu@2k.png).")
        print("  → Missing art is fine: the prologue falls back to its hand-drawn whale placeholder.")
        if unknown:
            print("\n  Unrecognised files (skipped):")
            for path in unknown:
                print(f"    - {path.name}")
        return 0

    processed: list[dict[str, object]] = []
    for source_name, source_path in recognised:
        result = process_one(source_name, source_path, dest_public, args.dry_run)
        if result:
            processed.append(result)

    if unknown:
        print("\nSkipped — filename not in the mapping table:")
        for path in unknown:
            print(f"  - {path.name}")
        print("  → expected names are listed in promos/crawl-bear-promo/ASSETS.md; rename and re-run.")

    counts: dict[str, int] = {}
    for item in processed:
        tier = str(item["tier"])
        counts[tier] = counts.get(tier, 0) + 1
    summary = ", ".join(f"{tier} {count}" for tier, count in sorted(counts.items()))
    verb = "would process" if args.dry_run else "processed"
    print(f"\nDone — {verb} {len(processed)} file(s) ({summary}).")
    if args.dry_run:
        print("Re-run without --dry-run to write the WebP files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
