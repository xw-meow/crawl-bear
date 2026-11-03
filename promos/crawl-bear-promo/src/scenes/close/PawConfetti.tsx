import React from "react";
import { COLORS } from "../../theme";
import { clamp, seededRange } from "../../lib/anim";
import { PawPrint } from "../../components/Doodles";

type PawConfettiProps = {
  /** Local scene frame. */
  frame: number;
  /** First piece leaves the bag. */
  startFrame?: number;
  count?: number;
  /** Bag mouth: centre x / top y the paws fall from. */
  originX?: number;
  originY?: number;
  /** Horizontal spread around originX, in px. */
  spread?: number;
  /** Fall distance over the lifetime, in px. */
  fall?: number;
  /** Lifetime of one piece, in frames. */
  duration?: number;
  seed?: number;
  colors?: readonly string[];
  opacity?: number;
};

const DEFAULT_COLORS = [COLORS.fur, COLORS.honeyDeep, COLORS.leaf] as const;

/**
 * "下载完成" paw-print confetti (design.md §7): nine paws tumble out of the bag
 * mouth, accelerating downwards, each with its own deterministic delay / x / spin.
 * Pure function of `frame` — safe for Remotion renders (no Math.random).
 */
export const PawConfetti: React.FC<PawConfettiProps> = ({
  frame,
  startFrame = 0,
  count = 9,
  originX = 960,
  originY = 860,
  spread = 300,
  fall = 210,
  duration = 52,
  seed = 11,
  colors = DEFAULT_COLORS,
  opacity = 1,
}) => {
  const pieces: React.ReactNode[] = [];

  for (let i = 0; i < count; i += 1) {
    const s = seed + i * 17;
    const delay = seededRange(s, 0, 20);
    const t = clamp((frame - startFrame - delay) / duration);
    if (t <= 0 || t >= 1) continue;

    const startX = originX + seededRange(s + 1, -spread, spread);
    const travel = fall * seededRange(s + 2, 0.82, 1.22);
    const drift = seededRange(s + 3, -38, 38);
    const rotateStart = seededRange(s + 4, -46, 46);
    const spin = seededRange(s + 5, -240, 240);
    const size = seededRange(s + 6, 17, 31);
    const colorIndex = Math.floor(seededRange(s + 7, 0, colors.length - 0.0001));
    const color = colors[colorIndex];

    // gravity: y grows quadratically, x drifts sideways a little
    const x = startX + drift * t;
    const y = originY + travel * t * t;

    // fade in fast, hold, then dissolve before the scene cut
    const fade = clamp(t * 9) * (1 - clamp((t - 0.7) / 0.3));

    pieces.push(
      <div
        key={i}
        style={{
          position: "absolute",
          left: x - size / 2,
          top: y - size / 2,
          opacity: fade * opacity,
          transform: `rotate(${rotateStart + spin * t}deg)`,
        }}
      >
        <PawPrint size={size} color={color} />
      </div>,
    );
  }

  return <>{pieces}</>;
};
