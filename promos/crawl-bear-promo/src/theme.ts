/**
 * CrawlBear promo film — design tokens.
 * Source of truth: ../../docs/design.md §4 (colors / type / shapes).
 * Video-specific scale notes: everything in design.md is built for a ~1080px wide
 * window; the film is 1920×1080, so strokes and radii are multiplied by roughly 1.6.
 */

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

/** Margin of the safe area, in px. */
export const SAFE = 120;

export const COLORS = {
  paper: "#FFF7E8",
  paperDeep: "#FBE8C8",
  card: "#FFFCF3",
  ink: "#33261D",
  inkSoft: "#5E4936",
  muted: "#8E7A63",
  fur: "#B97B43",
  furLight: "#F0D3A7",
  honey: "#F9C74F",
  honeyDeep: "#E3A82B",
  berry: "#E2553C",
  berryDeep: "#B93A24",
  leaf: "#5E9C68",
  leafSoft: "#DDEBD6",
  sky: "#7FB6C9",
  skySoft: "#DCEEF4",
  lineSoft: "#E8D3B4",
} as const;

/**
 * Font stacks.
 * Hannotate SC (手札体) ships with macOS and is the display face in design.md.
 * ZCOOL KuaiLe is bundled in /public/fonts as a cross-machine fallback.
 */
export const FONTS = {
  display: `"Hannotate SC", "HanziPen SC", "ZCOOL KuaiLe", "Yuanti SC", "PingFang SC", sans-serif`,
  body: `"PingFang SC", "Hiragino Sans GB", "Noto Sans SC", -apple-system, sans-serif`,
  latin: `"Chalkboard SE", "Comic Sans MS", "ZCOOL KuaiLe", cursive`,
  mono: `"SF Mono", Menlo, "Courier New", monospace`,
} as const;

/** Ink stroke widths for a 1920×1080 frame. */
export const INK = {
  hairline: 2,
  regular: 3,
  bold: 4,
  heavy: 6,
} as const;

export const RADIUS = {
  sm: 14,
  md: 24,
  lg: 36,
  pill: 999,
} as const;

/** Hard drop shadow (never blurred — design.md §4.3). */
export const shadow = (offset = 8, color: string = COLORS.ink) => `${offset}px ${offset}px 0 ${color}`;

/** Hand-drawn border radius (design.md §4.3). */
export const HAND_DRAWN_RADIUS = "36px 26px 40px 24px / 26px 38px 24px 40px";

export const TYPE = {
  hero: 132,
  h1: 104,
  h2: 82,
  h3: 52,
  body: 36,
  bodySmall: 30,
  caption: 24,
  badge: 22,
  mono: 34,
} as const;

/**
 * Timeline. Every scene is a top-level <Sequence> in Promo.tsx and receives a
 * local frame starting at 0. Sum of durations = composition duration.
 */
export const SCENES = [
  { id: "hook", duration: 150 },
  { id: "problem", duration: 150 },
  { id: "paste", duration: 150 },
  { id: "crawl", duration: 240 },
  { id: "results", duration: 240 },
  { id: "collect", duration: 210 },
  { id: "sites", duration: 165 },
  { id: "privacy", duration: 120 },
  { id: "outro", duration: 195 },
] as const;

export type SceneId = (typeof SCENES)[number]["id"];

export const DURATION = SCENES.reduce((sum, scene) => sum + scene.duration, 0);

/** Absolute start frame of a scene (for the chapter markers). */
export const sceneStart = (id: SceneId): number => {
  let cursor = 0;
  for (const scene of SCENES) {
    if (scene.id === id) return cursor;
    cursor += scene.duration;
  }
  throw new Error(`Unknown scene: ${id}`);
};
