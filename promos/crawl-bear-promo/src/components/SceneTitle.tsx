import React from "react";
import { useCurrentFrame } from "remotion";
import { COLORS, FONTS, TYPE } from "../theme";
import { clamp, easeOut, stickerSlam } from "../lib/anim";
import { MarkerUnderline } from "./Doodles";
import { Sticker, type StickerTone } from "./Sticker";

type SceneTitleProps = {
  eyebrow?: string;
  eyebrowTone?: StickerTone;
  lines: readonly string[];
  sub?: string;
  startFrame?: number;
  titleSize?: number;
  subSize?: number;
  width?: number;
  align?: "left" | "center";
  /** Draw a honey marker underline beneath the last title line. */
  highlightLast?: boolean;
  lineGap?: number;
  style?: React.CSSProperties;
  subWidth?: number;
};

/**
 * The standard scene heading: sticker eyebrow, per-line "written on" wipe,
 * optional marker underline, then the sub-line. Scenes only supply copy+timing.
 */
export const SceneTitle: React.FC<SceneTitleProps> = ({
  eyebrow,
  eyebrowTone = "card",
  lines,
  sub,
  startFrame = 0,
  titleSize = TYPE.h1,
  subSize = TYPE.body,
  width = 900,
  align = "left",
  highlightLast = false,
  lineGap = 6,
  style,
  subWidth,
}) => {
  const frame = useCurrentFrame();
  const eyebrowAt = startFrame;
  const linesAt = startFrame + 8;
  const subAt = linesAt + lines.length * 7 + 10;

  return (
    <div
      style={{
        width,
        display: "flex",
        flexDirection: "column",
        alignItems: align === "center" ? "center" : "flex-start",
        textAlign: align,
        ...style,
      }}
    >
      {eyebrow ? (
        <div style={{ ...stickerSlam(frame, eyebrowAt, -2), marginBottom: 26 }}>
          <Sticker tone={eyebrowTone} size="sm" rotate={-2}>
            {eyebrow}
          </Sticker>
        </div>
      ) : null}

      {lines.map((line, index) => {
        const at = linesAt + index * 7;
        const p = easeOut(clamp((frame - at) / 18));
        const isLast = index === lines.length - 1;
        return (
          <div key={line} style={{ position: "relative", marginBottom: lineGap, width: "100%" }}>
            <div
              style={{
                fontFamily: FONTS.display,
                fontWeight: 700,
                fontSize: titleSize,
                lineHeight: 1.16,
                letterSpacing: -1.5,
                color: COLORS.ink,
                transform: `translateY(${(1 - p) * 28}px)`,
                clipPath: `inset(-12% ${(1 - p) * 100}% -18% 0)`,
                whiteSpace: "nowrap",
              }}
            >
              {line}
            </div>
            {highlightLast && isLast ? (
              <MarkerUnderline
                width={Math.min(width, line.length * titleSize * 0.94)}
                progress={clamp((frame - (at + 14)) / 20)}
                style={{ position: "absolute", left: -6, bottom: -titleSize * 0.28 }}
              />
            ) : null}
          </div>
        );
      })}

      {sub ? (
        <div
          style={{
            marginTop: 20,
            maxWidth: subWidth ?? width,
            fontFamily: FONTS.body,
            fontSize: subSize,
            lineHeight: 1.6,
            color: COLORS.inkSoft,
            opacity: clamp((frame - subAt) / 14),
            transform: `translateY(${(1 - clamp((frame - subAt) / 16)) * 14}px)`,
          }}
        >
          {sub}
        </div>
      ) : null}
    </div>
  );
};
