import React from "react";
import { COLORS } from "../theme";
import { clamp } from "../lib/anim";

type DoodleProps = {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
  strokeWidth?: number;
};

/** Chubby paw print — the film's punctuation mark. */
export const PawPrint: React.FC<DoodleProps & { rotate?: number }> = ({
  size = 48,
  color = COLORS.ink,
  style,
  rotate = 0,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    style={{ transform: `rotate(${rotate}deg)`, ...style }}
    aria-hidden
  >
    <ellipse cx="32" cy="42" rx="15" ry="12.5" fill={color} transform="rotate(-4 32 42)" />
    <ellipse cx="15.5" cy="25" rx="6.4" ry="7.6" fill={color} transform="rotate(-20 15.5 25)" />
    <ellipse cx="26" cy="15.5" rx="6" ry="7.6" fill={color} transform="rotate(-7 26 15.5)" />
    <ellipse cx="38.5" cy="15.5" rx="6" ry="7.6" fill={color} transform="rotate(7 38.5 15.5)" />
    <ellipse cx="48.5" cy="25.5" rx="6.2" ry="7.4" fill={color} transform="rotate(20 48.5 25.5)" />
  </svg>
);

/** Four point sparkle. */
export const Sparkle: React.FC<DoodleProps> = ({
  size = 40,
  color = COLORS.honey,
  style,
  strokeWidth = 0,
}) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={style} aria-hidden>
    <path
      d="M20 2 C21.6 12.4 27.6 18.4 38 20 C27.6 21.6 21.6 27.6 20 38 C18.4 27.6 12.4 21.6 2 20 C12.4 18.4 18.4 12.4 20 2 Z"
      fill={color}
      stroke={strokeWidth ? COLORS.ink : "none"}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
  </svg>
);

/** Hand-drawn marker underline. `progress` 0→1 draws it on. */
export const MarkerUnderline: React.FC<{
  width: number;
  progress?: number;
  color?: string;
  thickness?: number;
  style?: React.CSSProperties;
}> = ({ width, progress = 1, color = COLORS.honey, thickness = 16, style }) => {
  const height = thickness * 1.9;
  const d = `M4 ${height * 0.55} C ${width * 0.24} ${height * 0.16}, ${width * 0.52} ${height * 0.2}, ${width * 0.78} ${height * 0.42} S ${width * 0.94} ${height * 0.78}, ${width - 6} ${height * 0.6}`;
  const length = width * 1.08;
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: "block", ...style }}
      aria-hidden
    >
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={thickness}
        strokeLinecap="round"
        strokeDasharray={length}
        strokeDashoffset={length * (1 - clamp(progress))}
        opacity={0.92}
      />
    </svg>
  );
};

/** Loose curved arrow, useful for pointing at UI details. */
export const ArrowDoodle: React.FC<
  DoodleProps & { flipX?: boolean; progress?: number; width?: number }
> = ({ size = 64, color = COLORS.ink, style, progress = 1, width = 2.2 }) => {
  const p = clamp(progress);
  const d = "M4 60 C 6 30, 26 8, 58 10";
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={style} aria-hidden>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width * 1.6}
        strokeLinecap="round"
        strokeDasharray={90}
        strokeDashoffset={90 * (1 - p)}
        opacity={0.85}
      />
      <path
        d="M46 4 L58 10 L50 22"
        fill="none"
        stroke={color}
        strokeWidth={width * 1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={p > 0.8 ? (p - 0.8) / 0.2 : 0}
      />
    </svg>
  );
};

/** Wobbly hand-drawn circle scribble. */
export const CircleScribble: React.FC<{
  width?: number;
  height?: number;
  color?: string;
  progress?: number;
  style?: React.CSSProperties;
}> = ({ width = 220, height = 120, color = COLORS.berry, progress = 1, style }) => {
  const p = clamp(progress);
  const d = `M ${width * 0.5} 6 C ${width * 0.93} 4, ${width - 4} ${height * 0.34}, ${width - 8} ${height * 0.56} C ${width - 12} ${height * 0.96}, ${width * 0.4} ${height - 2}, ${width * 0.16} ${height * 0.78} C ${1} ${height * 0.55}, ${width * 0.1} 8, ${width * 0.52} 10`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={style} aria-hidden>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={width * 2.6}
        strokeDashoffset={width * 2.6 * (1 - p)}
        opacity={0.9}
      />
    </svg>
  );
};

/** Short marker tick for lists. */
export const TickMark: React.FC<{ size?: number; color?: string; style?: React.CSSProperties }> = ({
  size = 34,
  color = COLORS.leaf,
  style,
}) => (
  <svg width={size} height={size} viewBox="0 0 34 34" style={style} aria-hidden>
    <path
      d="M6 18.5 L13.5 26 L28 7.5"
      fill="none"
      stroke={color}
      strokeWidth={4.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Crossed-out mark for the "old way" pain points. */
export const CrossMark: React.FC<{ size?: number; color?: string; style?: React.CSSProperties }> = ({
  size = 30,
  color = COLORS.berry,
  style,
}) => (
  <svg width={size} height={size} viewBox="0 0 30 30" style={style} aria-hidden>
    <path
      d="M6 6 L24 24 M24 6 L6 24"
      fill="none"
      stroke={color}
      strokeWidth={4.2}
      strokeLinecap="round"
    />
  </svg>
);

/** Little hand-drawn "stamp" ring used for 已收 marks. */
export const StampRing: React.FC<{
  label: string;
  size?: number;
  color?: string;
  rotate?: number;
  opacity?: number;
}> = ({ label, size = 120, color = COLORS.leaf, rotate = -12, opacity = 1 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50% 46% 52% 48%",
      border: `4.5px solid ${color}`,
      color,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transform: `rotate(${rotate}deg)`,
      fontFamily: '"Hannotate SC", sans-serif',
      fontWeight: 700,
      fontSize: size * 0.32,
      letterSpacing: 2,
      opacity,
      background: "rgba(255,252,243,0.55)",
    }}
  >
    {label}
  </div>
);
