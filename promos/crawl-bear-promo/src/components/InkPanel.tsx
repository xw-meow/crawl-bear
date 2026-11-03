import React from "react";
import { COLORS, HAND_DRAWN_RADIUS, INK, RADIUS, shadow } from "../theme";

type InkPanelProps = {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  padding?: number | string;
  radius?: number | string;
  border?: number;
  shadowSize?: number;
  rotate?: number;
  background?: string;
  handDrawn?: boolean;
};

/** A card "stuck onto the paper": ink outline + hard offset shadow (design.md §4.3). */
export const InkPanel: React.FC<InkPanelProps> = ({
  children,
  style,
  padding = 32,
  radius = RADIUS.md,
  border = INK.regular,
  shadowSize = 8,
  rotate = 0,
  background = COLORS.card,
  handDrawn = false,
}) => {
  return (
    <div
      style={{
        position: "relative",
        background,
        border: `${border}px solid ${COLORS.ink}`,
        borderRadius: handDrawn ? HAND_DRAWN_RADIUS : radius,
        boxShadow: shadow(shadowSize),
        padding,
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Paper strip / label background — no shadow, thin dashed edge. */
export const PaperStrip: React.FC<{
  children?: React.ReactNode;
  style?: React.CSSProperties;
  rotate?: number;
  background?: string;
}> = ({ children, style, rotate = -1, background = COLORS.paperDeep }) => (
  <div
    style={{
      background,
      border: `${INK.hairline}px dashed ${COLORS.ink}`,
      borderRadius: 10,
      padding: "10px 22px",
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      transform: `rotate(${rotate}deg)`,
      ...style,
    }}
  >
    {children}
  </div>
);
