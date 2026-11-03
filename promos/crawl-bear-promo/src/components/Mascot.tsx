import React from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import { COLORS } from "../theme";
import { float, springAt, SPRINGS } from "../lib/anim";

export type Mood = "hero" | "crawl" | "happy" | "empty" | "error" | "login" | "logo";

type MascotProps = {
  mood?: Mood;
  /** Override the image (e.g. a generated art file). Defaults to assets/brand/bear-<mood>.webp */
  src?: string;
  height?: number;
  style?: React.CSSProperties;
  /** Slow idle bob. Set 0 to freeze. */
  bob?: number;
  bobPeriod?: number;
  /** Gentle sway in degrees. */
  sway?: number;
  /** Spring entrance; omit to render immediately. */
  enterAt?: number;
  enterFrom?: "bottom" | "right" | "left" | "scale";
  opacity?: number;
  dropShadow?: boolean;
};

const ENTER_FROM = {
  bottom: (p: number) => ({ x: 0, y: (1 - p) * 120 }),
  right: (p: number) => ({ x: (1 - p) * 200, y: 0 }),
  left: (p: number) => ({ x: -(1 - p) * 200, y: 0 }),
  scale: () => ({ x: 0, y: 0 }),
};

/**
 * Papa the bear. Generated art lives in /public/assets/brand; the component
 * also accepts a custom src so higher-resolution art can drop in later.
 */
export const Mascot: React.FC<MascotProps> = ({
  mood = "hero",
  src,
  height = 520,
  style,
  bob = 9,
  bobPeriod = 110,
  sway = 1.6,
  enterAt,
  enterFrom = "bottom",
  opacity = 1,
  dropShadow = false,
}) => {
  const frame = useCurrentFrame();
  const file = src ?? `assets/brand/bear-${mood}.webp`;

  const p = enterAt === undefined ? 1 : springAt(frame, enterAt, SPRINGS.heavy);
  const delta = ENTER_FROM[enterFrom](Math.min(1.15, p));
  const enterOpacity = enterAt === undefined ? 1 : Math.min(1, Math.max(0, (frame - enterAt) / 8));

  const bobbing = bob ? float(frame, bob, bobPeriod) : 0;
  const swaying = sway ? float(frame + 17, sway, bobPeriod * 1.7) : 0;

  return (
    <Img
      src={staticFile(file)}
      style={{
        height,
        width: "auto",
        objectFit: "contain",
        display: "block",
        opacity: opacity * enterOpacity,
        transform: `translate(${delta.x}px, ${delta.y + bobbing}px) rotate(${swaying}deg) scale(${0.92 + 0.08 * Math.min(1, p)})`,
        filter: dropShadow ? `drop-shadow(0 14px 0 rgba(51,38,29,0.12))` : undefined,
        ...style,
      }}
    />
  );
};

/** App icon mark (rounded bear icon), for the wordmark and end card. */
export const BearMark: React.FC<{ size?: number; style?: React.CSSProperties; src?: string }> = ({
  size = 120,
  style,
  src,
}) => (
  <Img
    src={staticFile(src ?? "assets/brand/bear-logo.webp")}
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.24,
      display: "block",
      objectFit: "cover",
      border: `3px solid ${COLORS.ink}`,
      background: COLORS.honey,
      ...style,
    }}
  />
);
