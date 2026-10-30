<div align="center">

<img src="assets/readme/banner.webp" alt="CrawlBear" width="100%" />

**Paste one URL. Pull the images, videos, music and fonts from a webpage into a local folder.**

<img alt="macOS 13+" src="https://img.shields.io/badge/macOS-13%2B-E2553C?style=flat-square&labelColor=FFF7E8" />
<img alt="Tauri 2" src="https://img.shields.io/badge/Tauri-2-F9C74F?style=flat-square&labelColor=FFF7E8" />
<img alt="Rust" src="https://img.shields.io/badge/Rust-2021-33261D?style=flat-square&labelColor=FFF7E8" />
<img alt="React" src="https://img.shields.io/badge/React-18-7FB6C9?style=flat-square&labelColor=FFF7E8" />
<img alt="Read-only · local" src="https://img.shields.io/badge/Read--only-local-5E9C68?style=flat-square&labelColor=FFF7E8" />
<img alt="MIT License" src="https://img.shields.io/badge/License-MIT-33261D?style=flat-square&labelColor=FFF7E8" />

**Website:** [https://we.miework.cn/crawl-bear/index.html](https://we.miework.cn/crawl-bear/index.html)

[中文](README.md) · English

</div>

## What is this

CrawlBear (超级爬爬熊) is a local media crawler for macOS. Paste any webpage URL: it opens an invisible browser window, scans the page for images, videos, music and fonts, then lets you filter and batch-download the results.

No cloud, no account, no telemetry. Sites that require login are opened in your own WebView, where you sign in manually; cookies never leave your Mac.

The repository is a **pnpm workspace**:

| Package | Description |
| --- | --- |
| `apps/desktop` | macOS desktop app (Tauri 2 + Rust + React) |
| `apps/website` | Marketing site (Vite + React + TypeScript), deployed at [we.miework.cn/crawl-bear](https://we.miework.cn/crawl-bear/index.html) |

## Features

- **Any website**: paste a page URL or share text; `https://` is optional and added automatically.
- **More than `<img>`**: scans `picture/srcset`, lazy-loaded `data-*` attributes, `<video>/<audio>/<source>`, posters, CSS backgrounds, `@font-face`, `<link rel=preload>`, `og:image/video`, inline styles, CSSOM and `performance` resource entries.
- **Four media types**: images, videos, music and fonts, with type filters, counts and batch selection.
- **Click to preview**: open any resource in a modal — large images, video/audio playback and live font samples.
- **Site-specific parsing**: for X/Twitter, YouTube and other supported sites, the results page shows a “Site-specific parsing enabled” badge and prefers the highest-quality source available.
- **Login reuse**: add a site in “Settings → Login sites”, sign in through the embedded window, and later crawls/downloads reuse the local cookie. The app only shows the cookie count, never the values.
- **Controlled downloads**: group files by site domain; concurrency 1–5; cancellable; HLS/DASH is remuxed to MP4 with the in-app FFmpeg extension; every item reports success or failure.
- **Native feel**: fixed top bar, single-screen home, dedicated results page, minimal macOS menu (About / Settings / Quit) plus a native Edit menu; context menu and text selection are disabled.
- **Hand-drawn bear**: “Papa” the bear accompanies the crawl with sticker-style visuals and light framer-motion animations that respect reduced motion.

## Screenshots

### Home

<img src="assets/readme/home.webp" alt="Home" width="100%" />

### Crawling

The progress bar shows a centered glowing percentage while the bear switches to a searching pose.

<img src="assets/readme/progress.webp" alt="Crawling" width="100%" />

### Results

Filter by type, select all, and batch-download into the collection bag. Results open on their own page with an independently scrolling list.

<img src="assets/readme/results.webp" alt="Results" width="100%" />

### Settings

Download folder, default types, concurrency, scrolling, item limit and login sites are all stored locally.

<img src="assets/readme/settings.webp" alt="Settings" width="100%" />

## Quick start

### Requirements

- macOS 13+
- Node.js 20+
- Rust 1.77+ (rustup) and Xcode Command Line Tools
- System `/usr/bin/curl`
- No system ffmpeg required. Before the first YouTube/HLS download, install the in-app FFmpeg extension from **Settings → Extensions**.

### Extension manager

The Extensions panel in Settings currently provides FFmpeg:

- Download a static build for your architecture; the app extracts, verifies and installs it under its private data directory.
- It never writes to `/opt/homebrew`, `/usr/local` or the system PATH, and never invokes a global ffmpeg.
- Downloads support resume/retry; after install, version, size and license are shown.
- You can remove it at any time; YouTube muxing and HLS downloads will ask you to reinstall it.

### Install dependencies

```bash
pnpm install
```

### Development

```bash
# Desktop app (the first run compiles Rust dependencies)
pnpm dev:desktop

# Website, http://localhost:5173
pnpm dev:web
```

### Build and release

```bash
# Desktop app
pnpm build:desktop

# Website
pnpm build:web

# Build both frontends
pnpm build

# Build a distributable macOS package (ad-hoc signed + install guide)
pnpm package:macos
```

Desktop bundle: `apps/desktop/src-tauri/target/release/bundle/macos/CrawlBear.app`.

`pnpm package:macos` re-applies the ad-hoc signature and writes to `dist/` (ignored by git, do not commit):

- `dist/CrawlBear-macOS.pkg`: installs to `/Applications` automatically (recommended for regular users);
- `dist/CrawlBear-macOS.zip`: portable bundle with the app and install guide.

Without an Apple Developer account, first launch is blocked by Gatekeeper. Send [docs/INSTALL-macOS.md](docs/INSTALL-macOS.md) along with the package and follow the right-click / Terminal steps there. Do not disable Gatekeeper globally.

### Website deployment (Tencent Cloud COS)

`.github/workflows/website.yml` builds the website on `main` pushes / PRs and can deploy it to Tencent Cloud COS on `main`.

Configure under **Settings → Secrets and variables → Actions**:

- Variables: `COS_BUCKET`, `COS_REGION`, `COS_PREFIX`
- Secrets: `COS_SECRET_ID`, `COS_SECRET_KEY`

Without the variables, the workflow only builds and skips deployment. `COS_PREFIX` is also used as Vite’s `base`: e.g. `crawl-bear` produces `/crawl-bear/` asset URLs and uploads to the `crawl-bear/` directory in COS.

`COS_SECRET_ID` / `COS_SECRET_KEY` may be organization-level secrets; make sure this repository is included in the secret’s Repository access list.

### GitHub Actions release pipeline

- `.github/workflows/ci.yml`: builds both frontend packages and runs Rust tests on `main` pushes / PRs.
- `.github/workflows/release.yml`: on a `v*` tag, builds a **universal (arm64 + x86_64)** macOS app, ad-hoc signs it, produces `.pkg` / `.zip` / SHA256 and publishes them to GitHub Releases.
- Manual `workflow_dispatch` builds the artifacts without creating a Release.
- No Apple certificate or private secret is required; signing remains local ad-hoc.

### Image and icon assets

```bash
# Generated art -> app WebP + website copies + rounded icon
python3 scripts/prepare_assets.py

# Regenerate Tauri icons after changing the icon source
pnpm --filter @crawl-bear/desktop exec tauri icon ../../design-assets/app-icon-rounded.png
```

## Usage

1. Paste a webpage URL on the home screen, e.g. `https://developer.mozilla.org/` (the protocol is optional).
2. Wait for the bear to finish; the results page opens automatically.
3. Filter with All / Images / Videos / Music / Fonts / Other; click a card to preview.
4. Select the assets you need (or click “Select all visible”), then click “Collect” at the bottom.
5. Files are saved under **Settings → Download folder**, by default `~/Downloads/CrawlBear/<site-domain>/`.

### Login sites

Add a site URL in **Settings → Login sites**, click “Open login” and sign in manually in the separate window. Close the window and crawl again. Login windows are reused per domain; “Clear” only removes local cookies.

### Settings

| Setting | Description |
| --- | --- |
| Download folder | Root folder for downloads; a subfolder per site domain is created |
| Default types | Media types shown by default in results |
| Concurrency | Number of parallel downloads, 1–5 |
| Auto scroll | Scroll the page first to trigger lazy loading, then extract |
| Max items | Upper limit for one crawl, 50–2000 |
| Login sites | Sites whose content requires login |

## Project structure

```text
apps/
  desktop/                        macOS desktop app
    src/                          React UI (crawler / settings / shared)
    src-tauri/                    Rust backend, Tauri config and icons
    public/assets/                In-app WebP art (bear, paper, logo)
  website/                        Marketing site
    src/                          Vite + React pages
    public/assets/                brand / shots / generated images
    ASSETS.md                     Website image prompts
assets/readme/                    README images
scripts/prepare_assets.py         Generated art -> WebP / icons / website sync
docs/
  design.md                       Design system: brand, color, type, layout, motion
  assets.md                       Image asset checklist and prompts
  ARCHITECTURE.md                 Layers, data flow, extension points
  API_CONTRACT.md                 Commands / events / error codes
  media-extraction.md             Generic extraction script and test report
pnpm-workspace.yaml               Workspace config
```

> `design-assets/`, `docs/screenshots/` and `docs/archive/` stay local and are not committed. Original generated art can be recreated from prompts in `docs/assets.md`.

## Architecture and docs

| Document | Contents |
| --- | --- |
| [docs/design.md](docs/design.md) | Design system: hand-drawn sticker style, typography, motion, copy, accessibility |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Rust / React layers, data flow, extension points |
| [docs/API_CONTRACT.md](docs/API_CONTRACT.md) | Tauri commands, events and error codes |
| [docs/media-extraction.md](docs/media-extraction.md) | Generic extraction script and dual-engine test report |
| [docs/assets.md](docs/assets.md) | Image prompts for bear art, paper and icons |
| [apps/website/ASSETS.md](apps/website/ASSETS.md) | Website hero / preview / social image prompts |

## Testing and verification

```bash
# Rust unit tests (URL, naming, classification, download paths)
pnpm test:rust

# Type-check and build both frontend packages
pnpm build
```

Completed verification:

- all 28 Rust unit tests pass;
- real WKWebView crawl of the Baidu homepage: 79 images and 6 fonts found; `.js` / `.css` and other non-media resources filtered out;
- release macOS app smoke test, embedded assets and icon checks pass;
- home, crawling, results, preview modal, download-complete and settings screens were checked screen by screen (screenshots are local validation artifacts and are not committed);
- both the website and desktop app build in production mode under the pnpm workspace.

### How YouTube downloads work (no external downloader)

YouTube’s web player uses SABR streams + PO tokens, so the page no longer exposes direct media URLs. CrawlBear uses its own extraction pipeline:

1. Request the YouTube page from inside the app and read the innertube config and visitor ID.
2. Query the player endpoint with the **visionOS innertube client** to obtain ordinary video and audio URLs.
3. Download the best H.264 video track and AAC audio track with Rust + reqwest; requests honour the macOS system proxy.
4. Mux them losslessly (`-c copy`) into MP4 with the in-app FFmpeg extension.

No `yt-dlp` or other external extractor is involved. Resolvers are pluggable: adding a new site only requires implementing a resolver; download, progress, proxy and muxing are shared. If one extraction approach stops working, a new resolver can be added at the front of the registry as a drop-in replacement.

## Known limitations

- macOS only; Windows/Linux would need platform-specific `open`, path and WebView handling.
- `blob:` / MSE streams, resources inside iframes, closed Shadow DOM and backgrounds injected by scripts after extraction are not covered.
- Some sites use anti-bot measures, login walls or CAPTCHAs. CrawlBear does not bypass CAPTCHAs; it only reuses a login you completed manually.
- YouTube page videos are extracted in-app; video pages from other sites (Vimeo, Bilibili, etc.) are not supported for in-app downloads yet.
- YouTube downloads require the FFmpeg extension from **Settings → Extensions**; proxy environments are detected from macOS system settings.
- Signed CDN URLs can expire; URLs are re-collected before each download and never cached.
- Hidden windows do not trigger display refresh; a timer fallback keeps `requestAnimationFrame` alive. Lazy-loaded images that depend on `IntersectionObserver` may be fewer than in a visible browser.
- Only download content you have the right to save. Respect each site’s terms and copyright law; do not redistribute.

## Disclaimer

CrawlBear is an open-source learning tool that reads public pages locally. It is not intended for any improper use. Respect website terms and copyright; save only content you are allowed to use.

## License

Released under the [MIT License](LICENSE).

## Acknowledgements

[Tauri](https://tauri.app/) · [React](https://react.dev/) · [Ant Design](https://ant.design/) · [framer-motion](https://www.framer.com/motion/) · [ffmpeg](https://ffmpeg.org/)
