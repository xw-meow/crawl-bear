import React from "react";
import { useCurrentFrame } from "remotion";
import { COLORS, FONTS, INK } from "../theme";
import { clamp } from "../lib/anim";

type ProgressHoneyProps = {
  width?: number;
  height?: number;
  /** 0 → 1 */
  progress: number;
  label?: string;
  showPercent?: boolean;
  style?: React.CSSProperties;
  /** tint of the fill, defaults to honey */
  fill?: string;
  fillDeep?: string;
  labelSize?: number;
};

/**
 * Honey progress bar (design.md §6.7): ink outline, gradient honey fill,
 * centered glowing percentage, no dashes.
 */
export const ProgressHoney: React.FC<ProgressHoneyProps> = ({
  width = 900,
  height = 76,
  progress,
  label,
  showPercent = true,
  style,
  fill = COLORS.honey,
  fillDeep = COLORS.honeyDeep,
  labelSize = 32,
}) => {
  const frame = useCurrentFrame();
  const p = clamp(progress);
  const shimmer = ((frame % 90) / 90) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, ...style }}>
      {label ? (
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: labelSize,
            fontWeight: 600,
            color: COLORS.inkSoft,
            letterSpacing: 1,
          }}
        >
          {label}
        </div>
      ) : null}
      <div
        style={{
          position: "relative",
          width,
          height,
          borderRadius: 999,
          border: `${INK.bold}px solid ${COLORS.ink}`,
          background: COLORS.card,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${p * 100}%`,
            background: `linear-gradient(100deg, ${fill} 0%, ${fillDeep} 58%, ${fill} 100%)`,
            borderRadius: 999,
            transition: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(105deg, rgba(255,255,255,0) ${shimmer - 22}%, rgba(255,255,255,0.55) ${shimmer}%, rgba(255,255,255,0) ${shimmer + 22}%)`,
            }}
          />
        </div>
        {showPercent ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONTS.mono,
              fontSize: height * 0.46,
              fontWeight: 700,
              color: COLORS.ink,
              letterSpacing: 2,
              textShadow: p > 0.35 ? "0 1px 0 rgba(255,255,255,0.6)" : undefined,
            }}
          >
            {Math.round(p * 100)}%
          </div>
        ) : null}
      </div>
    </div>
  );
};
