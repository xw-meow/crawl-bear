import React from "react";
import { COLORS, FONTS, INK, shadow } from "../theme";

export type StickerTone = "card" | "honey" | "berry" | "leaf" | "sky" | "ink";

const TONES: Record<StickerTone, { bg: string; fg: string; border: string }> = {
  card: { bg: COLORS.card, fg: COLORS.ink, border: COLORS.ink },
  honey: { bg: COLORS.honey, fg: COLORS.ink, border: COLORS.ink },
  berry: { bg: COLORS.berry, fg: "#FFFFFF", border: COLORS.ink },
  leaf: { bg: COLORS.leafSoft, fg: COLORS.ink, border: COLORS.ink },
  sky: { bg: COLORS.skySoft, fg: COLORS.ink, border: COLORS.ink },
  ink: { bg: COLORS.ink, fg: COLORS.paper, border: COLORS.ink },
};

type StickerProps = {
  children?: React.ReactNode;
  tone?: StickerTone;
  icon?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  rotate?: number;
  style?: React.CSSProperties;
  shadowSize?: number;
  dashed?: boolean;
};

const SIZES = {
  sm: { font: 24, padY: 8, padX: 18, gap: 8, radius: 999 },
  md: { font: 30, padY: 10, padX: 24, gap: 10, radius: 999 },
  lg: { font: 40, padY: 14, padX: 32, gap: 14, radius: 999 },
} as const;

/** Pill sticker chip — the film's basic UI atom (design.md §6.3). */
export const Sticker: React.FC<StickerProps> = ({
  children,
  tone = "card",
  icon,
  size = "md",
  rotate = 0,
  style,
  shadowSize = 6,
  dashed = false,
}) => {
  const s = SIZES[size];
  const t = TONES[tone];
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: s.gap,
        padding: `${s.padY}px ${s.padX}px`,
        background: t.bg,
        color: t.fg,
        border: `${dashed ? INK.hairline : INK.regular}px ${dashed ? "dashed" : "solid"} ${t.border}`,
        borderRadius: s.radius,
        boxShadow: shadowSize ? shadow(shadowSize) : undefined,
        fontFamily: FONTS.body,
        fontWeight: 600,
        fontSize: s.font,
        lineHeight: 1,
        whiteSpace: "nowrap",
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
        ...style,
      }}
    >
      {icon}
      {children}
    </div>
  );
};

/** Round count badge that sits inside filters ("全部 12"). */
export const CountBubble: React.FC<{
  value: number | string;
  tone?: StickerTone;
  size?: number;
}> = ({ value, tone = "card", size = 34 }) => {
  const t = TONES[tone];
  return (
    <span
      style={{
        minWidth: size,
        height: size,
        borderRadius: size,
        background: t.bg,
        color: t.fg,
        border: `2px solid ${t.border}`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONTS.mono,
        fontSize: size * 0.58,
        fontWeight: 700,
        padding: "0 6px",
        lineHeight: 1,
      }}
    >
      {value}
    </span>
  );
};
