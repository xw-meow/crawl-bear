import React from "react";
import { COLORS, FONTS, INK, RADIUS, shadow } from "../theme";
import { CheckIcon, FontIcon, ImageIcon, MusicIcon, OtherIcon, VideoIcon } from "./Icons";
import { CountBubble, Sticker, type StickerTone } from "./Sticker";
import type { MediaKind } from "../lib/copy";

export type CardTone = "sky" | "leaf" | "berry" | "paper";

const TONES: Record<CardTone, { bg: string; shape: string }> = {
  sky: { bg: COLORS.skySoft, shape: "#9AC9D8" },
  leaf: { bg: "#E6F0DE", shape: "#A8C9A0" },
  berry: { bg: "#FBE0D8", shape: "#F0A48F" },
  paper: { bg: COLORS.paperDeep, shape: COLORS.honey },
};

const KIND_META: Record<MediaKind, { label: string; Icon: React.FC<{ size?: number; color?: string }> }> = {
  image: { label: "图片", Icon: ImageIcon },
  video: { label: "视频", Icon: VideoIcon },
  music: { label: "音乐", Icon: MusicIcon },
  font: { label: "字体", Icon: FontIcon },
};

const DOTS = `radial-gradient(circle, rgba(51,38,29,0.15) 1.4px, transparent 1.5px)`;

/** Abstract "photo" content so each card reads as a real thumbnail. */
const ThumbArt: React.FC<{ tone: CardTone; kind: MediaKind; size: number }> = ({ tone, kind, size }) => {
  const { shape } = TONES[tone];
  if (kind === "video") {
    return (
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            width: size * 0.34,
            height: size * 0.34,
            borderRadius: "50%",
            background: COLORS.card,
            border: `${INK.regular}px solid ${COLORS.ink}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderTop: `${size * 0.062}px solid transparent`,
              borderBottom: `${size * 0.062}px solid transparent`,
              borderLeft: `${size * 0.104}px solid ${COLORS.ink}`,
              marginLeft: size * 0.024,
            }}
          />
        </div>
      </div>
    );
  }
  if (kind === "music" || kind === "font") {
    return (
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            width: size * 0.5,
            height: size * 0.5,
            borderRadius: "50%",
            background: COLORS.card,
            border: `${INK.regular}px solid ${COLORS.ink}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {kind === "music" ? (
            <MusicIcon size={size * 0.26} />
          ) : (
            <span
              style={{
                fontFamily: FONTS.display,
                fontSize: size * 0.26,
                fontWeight: 700,
                color: COLORS.ink,
                lineHeight: 1,
              }}
            >
              A
            </span>
          )}
        </div>
      </div>
    );
  }
  // image: a tiny flat landscape
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div
        style={{
          position: "absolute",
          left: size * 0.12,
          top: size * 0.16,
          width: size * 0.34,
          height: size * 0.34,
          borderRadius: "50%",
          background: shape,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: size * 0.08,
          top: size * 0.26,
          width: size * 0.26,
          height: size * 0.26,
          borderRadius: "50%",
          background: COLORS.furLight,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: size * 0.1,
          right: size * 0.1,
          bottom: size * 0.14,
          height: size * 0.12,
          borderRadius: 999,
          background: shape,
          opacity: 0.85,
        }}
      />
    </div>
  );
};

export type MediaCardProps = {
  kind: MediaKind;
  name: string;
  meta: string;
  tone?: CardTone;
  width?: number;
  selected?: boolean;
  stamped?: boolean;
  style?: React.CSSProperties;
  borderColor?: string;
  shadowSize?: number;
};

/**
 * Result-card mock-up, pixel-matched to the app (design.md §6.4).
 * Purely presentational — the parent scene animates it in.
 */
export const MediaCard: React.FC<MediaCardProps> = ({
  kind,
  name,
  meta,
  tone = "sky",
  width = 300,
  selected = false,
  stamped = false,
  style,
  borderColor,
  shadowSize = 8,
}) => {
  const t = TONES[tone];
  const thumbH = width * 0.72;
  const KindIcon = KIND_META[kind].Icon;
  const accent = selected ? COLORS.berry : COLORS.ink;

  return (
    <div
      style={{
        width,
        background: COLORS.card,
        border: `${INK.regular}px solid ${borderColor ?? (selected ? COLORS.berry : COLORS.ink)}`,
        borderRadius: RADIUS.sm,
        boxShadow: shadow(shadowSize),
        overflow: "hidden",
        position: "relative",
        ...style,
      }}
    >
      {/* thumbnail */}
      <div style={{ position: "relative", height: thumbH, background: t.bg, overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: DOTS,
            backgroundSize: "18px 18px",
            opacity: 0.7,
          }}
        />
        <ThumbArt tone={tone} kind={kind} size={width} />
        {/* kind sticker */}
        <Sticker
          size="sm"
          tone={selected ? "berry" : "card"}
          rotate={-1.5}
          shadowSize={4}
          icon={<KindIcon size={20} color={selected ? "#FFFFFF" : COLORS.ink} />}
          style={{ position: "absolute", left: 12, top: 12, fontSize: 18, padding: "5px 12px" }}
        >
          {KIND_META[kind].label}
        </Sticker>
        {/* checkbox */}
        <div
          style={{
            position: "absolute",
            right: 12,
            top: 12,
            width: 34,
            height: 34,
            borderRadius: 9,
            border: `${INK.regular}px solid ${COLORS.ink}`,
            background: selected ? COLORS.berry : COLORS.card,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: shadow(3),
          }}
        >
          {selected ? <CheckIcon size={22} color="#FFFFFF" strokeWidth={5} /> : null}
        </div>
      </div>

      {/* footer */}
      <div style={{ padding: "12px 14px 16px" }}>
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: 21,
            fontWeight: 600,
            color: COLORS.ink,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {name}
        </div>
        <div
          style={{
            marginTop: 6,
            display: "flex",
            justifyContent: "space-between",
            gap: 8,
            fontFamily: FONTS.mono,
            fontSize: 15,
            color: COLORS.muted,
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{meta}</span>
        </div>
      </div>

      {stamped ? (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: thumbH * 0.42,
            transform: "translate(-50%, -50%) rotate(-14deg)",
            width: width * 0.36,
            height: width * 0.36,
            borderRadius: "48% 52% 46% 54%",
            border: `4px solid ${COLORS.leaf}`,
            color: COLORS.leaf,
            background: "rgba(255,252,243,0.82)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONTS.display,
            fontSize: width * 0.098,
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          已收
        </div>
      ) : null}
      <div style={{ position: "absolute", inset: 0, border: `0 solid ${accent}`, pointerEvents: "none" }} />
    </div>
  );
};

/** Filter chip in the results header ("全部 12"). */
export const FilterChip: React.FC<{
  label: string;
  value: number;
  active?: boolean;
  icon?: React.ReactNode;
  scale?: number;
  style?: React.CSSProperties;
  disabled?: boolean;
}> = ({ label, value, active = false, icon, scale = 1, style, disabled = false }) => {
  const tone: StickerTone = active ? "honey" : "card";
  return (
    <Sticker
      tone={tone}
      size="sm"
      rotate={active ? -1.5 : 0}
      shadowSize={active ? 5 : 3}
      icon={icon}
      style={{
        transform: `scale(${scale})${active ? " rotate(-1.5deg)" : ""}`,
        opacity: disabled ? 0.42 : 1,
        fontSize: 26,
        padding: "8px 16px",
        gap: 10,
        ...style,
      }}
    >
      {label}
      <CountBubble value={value} tone={active ? "card" : "card"} size={32} />
    </Sticker>
  );
};

/** Empty round toggle used in the "select all" row. */
export const ToggleMark: React.FC<{ checked?: boolean; size?: number }> = ({ checked = false, size = 30 }) => (
  <span
    style={{
      width: size,
      height: size,
      borderRadius: 8,
      border: `${INK.regular}px solid ${COLORS.ink}`,
      background: checked ? COLORS.berry : COLORS.card,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: shadow(2),
    }}
  >
    {checked ? <CheckIcon size={size * 0.62} color="#FFFFFF" strokeWidth={5} /> : null}
  </span>
);

export const OtherKindIcon = OtherIcon;
