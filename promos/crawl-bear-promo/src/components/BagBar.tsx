import React from "react";
import { COLORS, FONTS, INK, shadow } from "../theme";
import { COPY } from "../lib/copy";
import { BagIcon, CheckIcon, DownloadIcon, FolderIcon } from "./Icons";
import { PawPrint } from "./Doodles";
import { Button } from "./Button";
import { HAND_DRAWN_RADIUS } from "../theme";

type BagBarProps = {
  selected: number;
  press?: number;
  path?: string;
  cta?: string;
  done?: boolean;
  scale?: number;
  style?: React.CSSProperties;
  width?: number;
};

/**
 * The sticky "collection bag" bar (design.md §6.5).
 * While downloading it shows a filename; when done it shows the Finder path.
 */
export const BagBar: React.FC<BagBarProps> = ({
  selected,
  press = 0,
  path = COPY.collect.path,
  cta = COPY.collect.cta,
  done = false,
  scale = 1,
  style,
  width = 760,
}) => {
  const active = selected > 0;
  return (
    <div
      style={{
        width: width * scale,
        display: "flex",
        alignItems: "center",
        gap: 22 * scale,
        padding: `${16 * scale}px ${20 * scale}px ${16 * scale}px ${18 * scale}px`,
        background: COLORS.card,
        border: `${INK.regular}px solid ${COLORS.ink}`,
        borderRadius: HAND_DRAWN_RADIUS,
        boxShadow: shadow(10 * scale),
        ...style,
      }}
    >
      <div
        style={{
          width: 78 * scale,
          height: 78 * scale,
          borderRadius: 22 * scale,
          background: COLORS.honey,
          border: `${INK.regular}px solid ${COLORS.ink}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          flexShrink: 0,
        }}
      >
        <PawPrint size={44 * scale} color={COLORS.ink} />
        <span
          style={{
            position: "absolute",
            right: -10 * scale,
            top: -10 * scale,
            minWidth: 34 * scale,
            height: 34 * scale,
            padding: `0 ${6 * scale}px`,
            borderRadius: 999,
            background: active ? COLORS.berry : COLORS.card,
            color: active ? "#fff" : COLORS.muted,
            border: `2.5px solid ${COLORS.ink}`,
            fontFamily: FONTS.mono,
            fontWeight: 700,
            fontSize: 19 * scale,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {selected}
        </span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: FONTS.display,
            fontWeight: 700,
            fontSize: 34 * scale,
            color: COLORS.ink,
            letterSpacing: 0.5,
            whiteSpace: "nowrap",
          }}
        >
          {done ? COPY.collect.toast : `${COPY.collect.bagLabel} ${selected} ${COPY.collect.bagUnit}`}
        </div>
        <div
          style={{
            marginTop: 4,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: FONTS.mono,
            fontSize: 18 * scale,
            color: COLORS.muted,
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          {done ? <FolderIcon size={20 * scale} color={COLORS.muted} strokeWidth={3} /> : <BagIcon size={20 * scale} color={COLORS.muted} strokeWidth={3} />}
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{path}</span>
        </div>
      </div>

      <Button
        label={done ? COPY.collect.finding : cta}
        tone={done ? "card" : "berry"}
        size="md"
        press={press}
        icon={done ? <CheckIcon size={30} color={COLORS.leaf} strokeWidth={5} /> : <DownloadIcon size={30} color="#fff" strokeWidth={4} />}
        style={{ fontSize: 30 * scale, padding: `${18 * scale}px ${28 * scale}px`, opacity: active ? 1 : 0.5 }}
      />
    </div>
  );
};
