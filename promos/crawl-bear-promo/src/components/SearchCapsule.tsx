import React from "react";
import { COLORS, FONTS, INK, shadow } from "../theme";
import { GlobeIcon } from "./Icons";
import { Button } from "./Button";

type SearchCapsuleProps = {
  width?: number;
  height?: number;
  text?: string;
  placeholder?: string;
  cta?: string;
  focused?: number;
  press?: number;
  caret?: boolean;
  style?: React.CSSProperties;
};

/**
 * The one-piece search capsule from design.md §6.2:
 * ink outline + hard shadow, no internal dividers, focus adds a honey halo.
 */
export const SearchCapsule: React.FC<SearchCapsuleProps> = ({
  width = 1240,
  height = 148,
  text = "",
  placeholder = "粘贴网页地址或分享文字",
  cta = "开始翻找",
  focused = 0,
  press = 0,
  caret = true,
  style,
}) => {
  const scale = height / 148;
  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        alignItems: "center",
        gap: 22 * scale,
        padding: `0 ${18 * scale}px 0 ${34 * scale}px`,
        background: COLORS.card,
        border: `${INK.bold}px solid ${COLORS.ink}`,
        borderRadius: 999,
        boxShadow: `${shadow(12)}${focused ? `, 0 0 0 ${10 * scale}px rgba(249,199,79,${0.42 * focused})` : ""}`,
        transform: `translateY(${press * 4}px)`,
        ...style,
      }}
    >
      <GlobeIcon size={46 * scale} color={COLORS.inkSoft} strokeWidth={2.6} />
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          minWidth: 0,
          fontFamily: FONTS.body,
          fontSize: 40 * scale,
          fontWeight: 500,
          color: text ? COLORS.ink : COLORS.muted,
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{text || placeholder}</span>
        {caret ? (
          <span
            style={{
              display: "inline-block",
              width: 3 * scale,
              height: 44 * scale,
              marginLeft: 6,
              background: COLORS.berry,
              borderRadius: 2,
            }}
          />
        ) : null}
      </div>
      <Button label={cta} size="md" press={press} style={{ fontSize: 38 * scale, padding: `${22 * scale}px ${40 * scale}px` }} />
    </div>
  );
};
