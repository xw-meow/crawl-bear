import React from "react";
import { COLORS, FONTS, INK, RADIUS, shadow } from "../theme";
import { SITE_MARKS, type SiteKey } from "./Icons";

type SiteBadgeProps = {
  site: SiteKey;
  name: string;
  note?: string;
  width?: number;
  height?: number;
  active?: number;
  style?: React.CSSProperties;
  compact?: boolean;
};

/** Dedicated-parser site card used in the "sites" scene. */
export const SiteBadge: React.FC<SiteBadgeProps> = ({
  site,
  name,
  note,
  width = 380,
  height = 132,
  active = 0,
  style,
  compact = false,
}) => {
  const Mark = SITE_MARKS[site];
  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "0 24px",
        background: COLORS.card,
        border: `${INK.regular}px solid ${active > 0.5 ? COLORS.berry : COLORS.ink}`,
        borderRadius: RADIUS.md,
        boxShadow: shadow(7),
        transform: `translateY(${-4 * active}px)`,
        ...style,
      }}
    >
      <Mark size={compact ? 54 : 66} rotate={-2} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontFamily: FONTS.display,
            fontWeight: 700,
            fontSize: compact ? 30 : 34,
            color: COLORS.ink,
            lineHeight: 1.2,
            letterSpacing: 0.5,
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </div>
        {note ? (
          <div
            style={{
              marginTop: 5,
              fontFamily: FONTS.body,
              fontSize: compact ? 20 : 22,
              color: COLORS.muted,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {note}
          </div>
        ) : null}
      </div>
    </div>
  );
};
