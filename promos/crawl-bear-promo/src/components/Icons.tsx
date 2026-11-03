import React from "react";
import { COLORS } from "../theme";

type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
  rotate?: number;
};

const base = (size: number, style?: React.CSSProperties, rotate?: number): React.CSSProperties => ({
  width: size,
  height: size,
  display: "block",
  transform: rotate ? `rotate(${rotate}deg)` : undefined,
  ...style,
});

/** Shared stroke SVG wrapper. */
const Stroke: React.FC<
  IconProps & { viewBox?: string; children: React.ReactNode; fill?: string }
> = ({ size = 40, color = COLORS.ink, strokeWidth = 3, style, rotate = 0, viewBox = "0 0 40 40", children, fill = "none" }) => (
  <svg
    width={size}
    height={size}
    viewBox={viewBox}
    style={base(size, style, rotate)}
    fill={fill}
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    {children}
  </svg>
);

/* ----------------------------- media types ----------------------------- */

export const ImageIcon: React.FC<IconProps> = (props) => (
  <Stroke {...props}>
    <rect x="5" y="7" width="30" height="26" rx="6" />
    <circle cx="15" cy="16" r="3.1" />
    <path d="M8 29.5 L16.6 21.4 L23 27 L28.2 22.6 L32.6 26.6" />
  </Stroke>
);

export const VideoIcon: React.FC<IconProps> = (props) => (
  <Stroke {...props}>
    <rect x="4.5" y="9" width="31" height="22" rx="6.5" />
    <path d="M17 15.6 L24.6 20 L17 24.4 Z" fill={COLORS.ink} stroke="none" />
  </Stroke>
);

export const MusicIcon: React.FC<IconProps> = (props) => (
  <Stroke {...props}>
    <path d="M15.5 29.5 C15.5 32 13.2 34 10.6 34 C8.2 34 6.4 32.4 6.4 30.2 C6.4 27.8 8.4 26.2 11 26.2 C12.4 26.2 13.8 26.6 15.5 27.4" />
    <path d="M15.5 29.5 L15.5 8.5 L32 5.6 L32 26" />
    <path d="M32 26 C32 28.5 29.7 30.5 27.1 30.5 C24.7 30.5 22.9 28.9 22.9 26.7 C22.9 24.3 24.9 22.7 27.5 22.7 C28.9 22.7 30.3 23.1 32 23.9" />
  </Stroke>
);

export const FontIcon: React.FC<IconProps> = (props) => (
  <Stroke {...props}>
    <path d="M9 32 L19.6 8 L30.4 32" />
    <path d="M13.4 24.2 L25.8 24.2" />
    <path d="M6 33.5 L34 33.5" strokeWidth={2} />
  </Stroke>
);

export const OtherIcon: React.FC<IconProps> = (props) => (
  <Stroke {...props}>
    <rect x="6" y="9" width="28" height="22" rx="6" strokeDasharray="5 5" />
    <path d="M14 20 L26 20 M20 14 L20 26" />
  </Stroke>
);

/* -------------------------------- UI ---------------------------------- */

export const GlobeIcon: React.FC<IconProps> = (props) => (
  <Stroke {...props}>
    <circle cx="20" cy="20" r="14.5" />
    <path d="M5.5 20 L34.5 20" />
    <path d="M20 5.5 C26.5 11 26.5 29 20 34.5 C13.5 29 13.5 11 20 5.5 Z" />
  </Stroke>
);

export const CheckIcon: React.FC<IconProps> = (props) => (
  <Stroke {...props}>
    <path d="M8 21 L16.4 29.6 L32.4 10.4" />
  </Stroke>
);

export const DownloadIcon: React.FC<IconProps> = (props) => (
  <Stroke {...props}>
    <path d="M20 7 L20 26" />
    <path d="M12.6 19 L20 26.6 L27.4 19" />
    <path d="M8 32.5 L32 32.5" />
  </Stroke>
);

export const ArrowRightIcon: React.FC<IconProps> = (props) => (
  <Stroke {...props}>
    <path d="M6 20 L33 20" />
    <path d="M24.5 11.5 L33 20 L24.5 28.5" />
  </Stroke>
);

export const ArrowLeftIcon: React.FC<IconProps> = (props) => (
  <Stroke {...props}>
    <path d="M34 20 L7 20" />
    <path d="M15.5 11.5 L7 20 L15.5 28.5" />
  </Stroke>
);

export const LockIcon: React.FC<IconProps> = (props) => (
  <Stroke {...props}>
    <rect x="9" y="18" width="22" height="17" rx="5" />
    <path d="M13.6 18 L13.6 13.4 C13.6 9.7 16.5 7 20 7 C23.5 7 26.4 9.7 26.4 13.4 L26.4 18" />
    <path d="M20 24.4 L20 28.6" />
  </Stroke>
);

export const ShieldIcon: React.FC<IconProps> = (props) => (
  <Stroke {...props}>
    <path d="M20 5.5 C25 8.6 30.4 9.6 34 10 L34 21 C34 28.4 27.6 33.4 20 35.4 C12.4 33.4 6 28.4 6 21 L6 10 C9.6 9.6 15 8.6 20 5.5 Z" />
    <path d="M13.6 20.4 L18.4 25.2 L27 15.6" />
  </Stroke>
);

export const CloudOffIcon: React.FC<IconProps> = (props) => (
  <Stroke {...props}>
    <path d="M11 29.5 C6.7 29.5 4.5 26.6 4.5 23.6 C4.5 20.4 7 18.2 9.8 18 C10.6 13.6 14.4 10.5 19 10.5 C23.4 10.5 26.8 13.2 28 17.2 C31.4 17.2 35 19.2 35 23.4 C35 26.6 32.6 29.5 29 29.5" />
    <path d="M7 33 L33 7" />
  </Stroke>
);

export const SparkIcon: React.FC<IconProps> = (props) => (
  <Stroke {...props}>
    <path d="M20 5 C21.6 13.2 26.8 18.4 35 20 C26.8 21.6 21.6 26.8 20 35 C18.4 26.8 13.2 21.6 5 20 C13.2 18.4 18.4 13.2 20 5 Z" />
  </Stroke>
);

export const BagIcon: React.FC<IconProps> = (props) => (
  <Stroke {...props}>
    <path d="M7.5 15.5 L32.5 15.5 L34.5 33 C34.7 34.6 33.5 36 31.9 36 L8.1 36 C6.5 36 5.3 34.6 5.5 33 Z" />
    <path d="M13 15.5 L13 12.4 C13 8.8 16.1 5.8 20 5.8 C23.9 5.8 27 8.8 27 12.4 L27 15.5" />
  </Stroke>
);

export const EyeIcon: React.FC<IconProps> = (props) => (
  <Stroke {...props}>
    <path d="M3.5 20 C8 12.4 13.7 8.6 20 8.6 C26.3 8.6 32 12.4 36.5 20 C32 27.6 26.3 31.4 20 31.4 C13.7 31.4 8 27.6 3.5 20 Z" />
    <circle cx="20" cy="20" r="5.6" />
  </Stroke>
);

export const FolderIcon: React.FC<IconProps> = (props) => (
  <Stroke {...props}>
    <path d="M4.5 12.5 C4.5 10.6 6 9 8 9 L15.4 9 L18.8 13 L32 13 C34 13 35.5 14.6 35.5 16.5 L35.5 29.5 C35.5 31.4 34 33 32 33 L8 33 C6 33 4.5 31.4 4.5 29.5 Z" />
  </Stroke>
);

export const CursorIcon: React.FC<IconProps> = (props) => (
  <Stroke {...props} fill={COLORS.card}>
    <path d="M9 5.5 L30 20.6 L20.2 22.4 L16.4 32.4 Z" fill={COLORS.card} />
  </Stroke>
);

export const PlusIcon: React.FC<IconProps> = (props) => (
  <Stroke {...props}>
    <path d="M20 8 L20 32 M8 20 L32 20" />
  </Stroke>
);

export const MinusIcon: React.FC<IconProps> = (props) => (
  <Stroke {...props}>
    <path d="M8 20 L32 20" />
  </Stroke>
);

/* ------------------------------ brand marks ---------------------------- */

const BrandTile: React.FC<
  IconProps & { children: React.ReactNode; tile: string; viewBox?: string; strokeWidth?: number }
> = ({ size = 64, color = COLORS.ink, style, rotate = 0, children, tile, viewBox = "0 0 40 40", strokeWidth = 3 }) => (
  <svg width={size} height={size} viewBox={viewBox} style={base(size, style, rotate)} aria-hidden>
    <rect x="1.6" y="1.6" width="36.8" height="36.8" rx="10" fill={tile} stroke={color} strokeWidth={2.6} />
    {children}
  </svg>
);

export const XMark: React.FC<IconProps> = (props) => (
  <BrandTile {...props} tile="#F6F1E6">
    <path d="M12 12 L28 28 M28 12 L12 28" stroke={COLORS.ink} strokeWidth={4} strokeLinecap="round" />
  </BrandTile>
);

export const YouTubeMark: React.FC<IconProps> = (props) => (
  <BrandTile {...props} tile="#FBD3CB">
    <rect x="8.5" y="13" width="23" height="14.5" rx="5.5" fill={COLORS.ink} stroke="none" />
    <path d="M18 17.4 L23.6 20.4 L18 23.4 Z" fill={COLORS.paper} stroke="none" />
  </BrandTile>
);

export const BilibiliMark: React.FC<IconProps> = (props) => (
  <BrandTile {...props} tile="#DCEFF4">
    <rect x="8" y="13.5" width="24" height="15" rx="4.5" fill="none" stroke={COLORS.ink} strokeWidth={2.8} />
    <path d="M13 11 L16.6 14.2 M27 11 L23.4 14.2" stroke={COLORS.ink} strokeWidth={2.8} strokeLinecap="round" />
    <path d="M15.4 19.4 L15.4 22.6 M24.6 19.4 L24.6 22.6" stroke={COLORS.ink} strokeWidth={3.2} strokeLinecap="round" />
  </BrandTile>
);

export const DouyinMark: React.FC<IconProps> = (props) => (
  <BrandTile {...props} tile="#E9E6F2">
    <path d="M19 11 L19 25.6" stroke={COLORS.ink} strokeWidth={3.4} strokeLinecap="round" />
    <path d="M19 11 C19.4 15 22.1 17.2 25.8 17.2" stroke={COLORS.ink} strokeWidth={3.4} strokeLinecap="round" fill="none" />
    <circle cx="14.6" cy="26.4" r="4.6" fill="none" stroke={COLORS.ink} strokeWidth={3} />
  </BrandTile>
);

export const SITE_MARKS = {
  x: XMark,
  youtube: YouTubeMark,
  bilibili: BilibiliMark,
  douyin: DouyinMark,
} as const;

export type SiteKey = keyof typeof SITE_MARKS;
