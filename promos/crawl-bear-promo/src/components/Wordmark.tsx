import React from "react";
import { COLORS, FONTS } from "../theme";
import { COPY } from "../lib/copy";
import { BearMark } from "./Mascot";

type WordmarkProps = {
  size?: number;
  align?: "row" | "column";
  color?: string;
  showEn?: boolean;
  style?: React.CSSProperties;
};

/** App wordmark: rounded bear icon + 超级爬爬熊 + CRAWLBear. */
export const Wordmark: React.FC<WordmarkProps> = ({
  size = 1,
  align = "row",
  color = COLORS.ink,
  showEn = true,
  style,
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: align === "row" ? "row" : "column",
      alignItems: "center",
      gap: 18 * size,
      ...style,
    }}
  >
    <BearMark size={86 * size} />
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: align === "row" ? "flex-start" : "center",
        gap: 2,
      }}
    >
      <span
        style={{
          fontFamily: FONTS.display,
          fontWeight: 700,
          fontSize: 52 * size,
          lineHeight: 1.05,
          letterSpacing: 1,
          color,
        }}
      >
        {COPY.brand.zh}
      </span>
      {showEn ? (
        <span
          style={{
            fontFamily: FONTS.latin,
            fontSize: 20 * size,
            letterSpacing: 7 * size,
            color: COLORS.inkSoft,
            marginLeft: align === "row" ? 3 : 0,
          }}
        >
          {COPY.brand.en}
        </span>
      ) : null}
    </div>
  </div>
);
