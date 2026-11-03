import React from "react";
import { COLORS, FONTS, INK } from "../theme";

type BubbleProps = {
  children?: React.ReactNode;
  text?: string;
  style?: React.CSSProperties;
  rotate?: number;
  tail?: "down" | "down-left" | "down-right" | "none";
  tailOffset?: number;
  tone?: "card" | "honey" | "ink";
  fontSize?: number;
  padding?: string;
};

/**
 * Speech bubble for the bear (design.md §6.8): white card, ink outline,
 * small triangular tail pointing at the bear's head.
 */
export const Bubble: React.FC<BubbleProps> = ({
  children,
  text,
  style,
  rotate = -1.5,
  tail = "down",
  tailOffset = 50,
  tone = "card",
  fontSize = 34,
  padding = "18px 30px",
}) => {
  const bg = tone === "honey" ? COLORS.honey : tone === "ink" ? COLORS.ink : COLORS.card;
  const fg = tone === "ink" ? COLORS.paper : COLORS.ink;

  const tailLeft =
    tail === "down-left" ? tailOffset : tail === "down-right" ? `calc(100% - ${tailOffset}px)` : "50%";

  return (
    <div style={{ position: "relative", display: "inline-block", transform: `rotate(${rotate}deg)`, ...style }}>
      <div
        style={{
          background: bg,
          border: `${INK.regular}px solid ${COLORS.ink}`,
          borderRadius: 24,
          padding,
          color: fg,
          fontFamily: FONTS.display,
          fontWeight: 700,
          fontSize,
          lineHeight: 1.3,
          whiteSpace: "nowrap",
          letterSpacing: 0.5,
        }}
      >
        {text ?? children}
      </div>
      {tail !== "none" ? (
        <div
          style={{
            position: "absolute",
            bottom: -13,
            left: tailLeft,
            width: 24,
            height: 24,
            marginLeft: tail === "down" ? -12 : -12,
            background: bg,
            borderRight: `${INK.regular}px solid ${COLORS.ink}`,
            borderBottom: `${INK.regular}px solid ${COLORS.ink}`,
            transform: "rotate(45deg)",
            borderRadius: "0 0 8px 0",
          }}
        />
      ) : null}
    </div>
  );
};
