import { Easing, interpolate, spring } from "remotion";
import { FPS } from "../theme";

/* ------------------------------------------------------------------ *
 * Timing helpers
 * ------------------------------------------------------------------ */

export const clamp = (value: number, min = 0, max = 1): number =>
  Math.min(max, Math.max(min, value));

export const lerp = (from: number, to: number, t: number): number => from + (to - from) * t;

export const easeOut = (t: number): number => 1 - Math.pow(1 - clamp(t), 3);
export const easeInOut = (t: number): number => {
  const x = clamp(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
/** Slight overshoot, use for stickers and stamps. */
export const easeOutBack = (t: number, overshoot = 1.7): number => {
  const x = clamp(t) - 1;
  return 1 + (overshoot + 1) * x * x * x + overshoot * x * x;
};

/** 0 → 1 linear ramp between two absolute local frames. */
export const ramp = (frame: number, start: number, duration: number): number =>
  clamp((frame - start) / Math.max(1, duration));

/** 0 → 1 eased ramp. */
export const fadeIn = (frame: number, start: number, duration = 14): number =>
  easeOut(ramp(frame, start, duration));

/** 1 → 0 fade that ends exactly at the scene end. */
export const fadeOut = (frame: number, sceneDuration: number, length = 14, offset = 0): number =>
  1 - easeOut(ramp(frame, sceneDuration - length - offset, length));

/** Opacity for entering at `start` and leaving at `sceneDuration - length`. */
export const inOut = (frame: number, sceneDuration: number, inAt = 0, inLen = 14, outLen = 14): number =>
  Math.min(fadeIn(frame, inAt, inLen), fadeOut(frame, sceneDuration, outLen));

export const delay = (frame: number, frames: number): number => Math.max(0, frame - frames);

/* ------------------------------------------------------------------ *
 * Springs — the film uses one family of spring configurations
 * ------------------------------------------------------------------ */

export type SpringConfig = {
  stiffness?: number;
  damping?: number;
  mass?: number;
  overshootClamping?: boolean;
};

export const SPRINGS = {
  /** Big entrances: panels, bears. */
  heavy: { stiffness: 120, damping: 18, mass: 1.2 },
  /** Default UI entrance. */
  smooth: { stiffness: 180, damping: 20, mass: 1 },
  /** Text lines, chips. */
  soft: { stiffness: 140, damping: 22, mass: 1 },
  /** Bouncy: checkmarks, stamps, paw prints. */
  bouncy: { stiffness: 420, damping: 16, mass: 0.9 },
  /** Quick pop. */
  quick: { stiffness: 500, damping: 20, mass: 0.8 },
} satisfies Record<string, SpringConfig>;

export const springAt = (frame: number, startFrame = 0, config: SpringConfig = {}): number =>
  spring({
    frame: Math.max(0, frame - startFrame),
    fps: FPS,
    config: { stiffness: 180, damping: 20, mass: 1, ...config },
  });

/** Spring that runs for a fixed number of frames and clamps to 1. */
export const springEased = (frame: number, startFrame = 0, frames = 20, config: SpringConfig = {}): number =>
  springAt(Math.min(frame, startFrame + frames), startFrame, {
    overshootClamping: true,
    ...config,
  });

/** Standard entrance: fade + rise + scale pop. */
export const entrance = (
  frame: number,
  startFrame = 0,
  config: SpringConfig = SPRINGS.smooth,
): { opacity: number; transform: string } => {
  const sp = springAt(frame, startFrame, config);
  const opacity = clamp(ramp(frame, startFrame, 8));
  const rise = (1 - sp) * 34;
  const scale = 0.94 + 0.06 * sp;
  return {
    opacity,
    transform: `translateY(${rise}px) scale(${scale})`,
  };
};

/** Sticker slam: comes in fast, rotates flat, tiny wobble. */
export const stickerSlam = (
  frame: number,
  startFrame = 0,
  finalRotation = -2,
): { opacity: number; transform: string } => {
  const sp = springAt(frame, startFrame, SPRINGS.bouncy);
  const opacity = clamp(ramp(frame, startFrame, 5));
  const scale = 1.6 - 0.6 * sp;
  const rotation = lerp(finalRotation * 3.2, finalRotation, clamp(sp));
  return {
    opacity,
    transform: `rotate(${rotation}deg) scale(${scale})`,
  };
};

/* ------------------------------------------------------------------ *
 * Loops & organic motion
 * ------------------------------------------------------------------ */

/** Gentle vertical float, in px. */
export const float = (frame: number, amplitude = 8, periodFrames = 96, phase = 0): number =>
  Math.sin(((frame % periodFrames) / periodFrames) * Math.PI * 2 + phase) * amplitude;

/** Slow wall-clock-ish drift for idle props. */
export const drift = (frame: number, amplitude = 3, periodFrames = 180, phase = 0): number =>
  Math.sin(((frame % periodFrames) / periodFrames) * Math.PI * 2 + phase) * amplitude;

/** Deterministic pseudo-random in [0, 1) — never use Math.random in a Remotion render. */
export const seeded = (seed: number): number => {
  let t = (seed * 1831565813 + 0x6d2b79f5) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const seededRange = (seed: number, min: number, max: number): number =>
  min + seeded(seed) * (max - min);

/** Blinking caret / cursor (frames on, frames off). */
export const blink = (frame: number, onFrames = 16, offFrames = 14): boolean =>
  frame % (onFrames + offFrames) < onFrames;

/** Small count-up used for numbers that tick (counts, percentages). */
export const countUp = (frame: number, start: number, end: number, startFrame = 0, duration = 30): number => {
  const t = clamp((frame - startFrame) / duration);
  return Math.round(lerp(start, end, easeOut(t)));
};

/** Typewriter — how many characters of `text` are visible at `frame`. */
export const typed = (
  frame: number,
  text: string,
  startFrame = 0,
  charsPerFrame = 0.6,
): string => {
  const count = Math.floor(Math.max(0, frame - startFrame) * charsPerFrame);
  return text.slice(0, Math.min(text.length, Math.max(0, count)));
};

/** Interpolate a numeric range with clamped extrapolation. */
export const range = (
  frame: number,
  input: [number, number],
  output: [number, number],
  easing: (t: number) => number = (t) => t,
): number =>
  interpolate(frame, input, output, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

/** Easing presets accepted by `interpolate`. */
export const EASE = {
  out: Easing.out(Easing.cubic),
  inOut: Easing.inOut(Easing.cubic),
} as const;
