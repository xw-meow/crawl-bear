import React from "react";
import { COLORS, FONTS, INK, shadow } from "../theme";

type ButtonProps = {
  children?: React.ReactNode;
  label?: string;
  icon?: React.ReactNode;
  tone?: "berry" | "honey" | "card" | "ink";
  size?: "sm" | "md" | "lg";
  press?: number;
  disabled?: boolean;
  style?: React.CSSProperties;
};

const TONES = {
  berry: { bg: COLORS.berry, fg: "#FFFFFF" },
  honey: { bg: COLORS.honey, fg: COLORS.ink },
  card: { bg: COLORS.card, fg: COLORS.ink },
  ink: { bg: COLORS.ink, fg: COLORS.paper },
} as const;

const SIZES = {
  sm: { font: 26, padY: 12, padX: 24, radius: 999, border: INK.regular, shadow: 4 },
  md: { font: 34, padY: 16, padX: 36, radius: 999, border: INK.bold, shadow: 6 },
  lg: { font: 44, padY: 22, padX: 52, radius: 999, border: INK.bold, shadow: 8 },
} as const;

/** Primary / secondary button, 2.5px ink outline + hard shadow (design.md §6.1). */
export const Button: React.FC<ButtonProps> = ({
  children,
  label,
  icon,
  tone = "berry",
  size = "md",
  press = 0,
  disabled = false,
  style,
}) => {
  const t = TONES[tone];
  const s = SIZES[size];
  const pushed = disabled ? 0 : press;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        background: t.bg,
        color: t.fg,
        border: `${s.border}px solid ${COLORS.ink}`,
        borderRadius: s.radius,
        padding: `${s.padY}px ${s.padX}px`,
        boxShadow: shadow(Math.max(1, s.shadow - pushed * 4)),
        fontFamily: FONTS.display,
        fontWeight: 700,
        fontSize: s.font,
        lineHeight: 1,
        letterSpacing: 1,
        whiteSpace: "nowrap",
        transform: `translateY(${pushed * 5}px) scale(${1 - pushed * 0.03})`,
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      {icon}
      {label ?? children}
    </div>
  );
};
