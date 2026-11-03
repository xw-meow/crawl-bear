import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS, FONTS, INK, RADIUS, SCENES, shadow } from "../theme";
import { COPY } from "../lib/copy";
import {
  clamp,
  easeOut,
  float,
  ramp,
  springAt,
  SPRINGS,
  stickerSlam,
} from "../lib/anim";
import { InkPanel } from "../components/InkPanel";
import { SceneTitle } from "../components/SceneTitle";
import { Sticker } from "../components/Sticker";
import { BearMark } from "../components/Mascot";
import { PaperTape } from "../components/PaperTape";
import { OptionalArt } from "../components/OptionalArt";
import { ArrowDoodle, PawPrint, Sparkle } from "../components/Doodles";

const DURATION = SCENES.find((scene) => scene.id === "prologue")!.duration;

/** 大肥鱼（社区的鲸鱼昵称）的兜底手绘插画；生成图到位后自动替换。 */
const WhaleDoodle: React.FC<{ size?: number }> = ({ size = 380 }) => (
  <svg width={size} height={size} viewBox="0 0 200 190" aria-hidden>
    {/* body */}
    <path
      d="M38 104 C38 72 64 50 100 50 C138 50 164 72 165 104 C166 136 138 158 100 158 C62 158 38 136 38 104 Z"
      fill={COLORS.sky}
      stroke={COLORS.ink}
      strokeWidth={4}
      strokeLinejoin="round"
    />
    {/* tail flukes */}
    <path
      d="M158 110 C170 102 182 96 188 82 C193 70 180 66 176 77 C172 88 166 98 159 105 C155 96 150 84 146 74 C142 63 129 68 134 81 C140 96 150 106 158 110 Z"
      fill={COLORS.sky}
      stroke={COLORS.ink}
      strokeWidth={4}
      strokeLinejoin="round"
    />
    {/* belly */}
    <path
      d="M56 128 C72 150 106 156 134 147 C130 162 104 170 82 164 C66 159 57 145 56 128 Z"
      fill={COLORS.furLight}
      stroke="none"
    />
    {/* pectoral fin */}
    <path
      d="M70 130 C58 137 50 149 53 160 C63 158 73 149 79 138 Z"
      fill={COLORS.sky}
      stroke={COLORS.ink}
      strokeWidth={3.6}
      strokeLinejoin="round"
    />
    {/* water spout */}
    <path
      d="M76 50 C71 40 64 35 56 32 M76 50 C77 40 81 33 88 29"
      fill="none"
      stroke={COLORS.ink}
      strokeWidth={3.2}
      strokeLinecap="round"
      opacity={0.72}
    />
    {/* closed happy eye */}
    <path
      d="M60 99 Q72 86 84 99"
      fill="none"
      stroke={COLORS.ink}
      strokeWidth={4.6}
      strokeLinecap="round"
    />
    {/* smile */}
    <path
      d="M74 117 Q85 127 96 117"
      fill="none"
      stroke={COLORS.ink}
      strokeWidth={4}
      strokeLinecap="round"
    />
    {/* blush */}
    <ellipse cx="54" cy="109" rx="7.6" ry="4.4" fill={COLORS.berry} opacity={0.3} />
    {/* two little bubbles */}
    <circle cx="150" cy="46" r="4.6" fill="none" stroke={COLORS.ink} strokeWidth={2.4} opacity={0.5} />
    <circle cx="166" cy="34" r="3" fill="none" stroke={COLORS.ink} strokeWidth={2.2} opacity={0.38} />
  </svg>
);

const DOTS = "radial-gradient(circle, rgba(51,38,29,0.16) 1.5px, transparent 1.6px)";

/**
 * 引子 · Prologue — 像发一条帖子：作者请大家花一分钟看看这个 vibecoding 小工具。
 * 画面是贴在纸上的一张手写便签 + 一张拍立得（大肥鱼），最后用一个小问题交棒给 Hook。
 */
export const Prologue: React.FC = () => {
  const frame = useCurrentFrame();

  const cardIn = springAt(frame, 8, SPRINGS.heavy);
  const polaroidIn = springAt(frame, 34, SPRINGS.heavy);
  const photoDevelop = clamp((frame - 44) / 22);
  const bodyAt = [52, 66];
  const signatureAt = 82;
  const bridgeIn = easeOut(ramp(frame, 118, 18));
  const exit = easeOut(ramp(frame, DURATION - 20, 18));

  return (
    <AbsoluteFill
      style={{
        opacity: 1 - exit,
        transform: `translateY(${-56 * exit}px)`,
      }}
    >
      {/* ---------------- 手写便签 ---------------- */}
      <div
        style={{
          position: "absolute",
          left: 112,
          top: 196,
          width: 952,
          transform: `translateY(${(1 - cardIn) * 56}px) scale(${0.95 + 0.05 * cardIn})`,
          opacity: clamp(cardIn * 1.4),
        }}
      >
        <PaperTape
          width={236}
          height={54}
          rotate={-5}
          progress={clamp((frame - 4) / 10)}
          style={{ position: "absolute", left: 348, top: -22, zIndex: 3 }}
        />
        <InkPanel
          padding={54}
          radius={RADIUS.lg}
          border={INK.regular}
          shadowSize={10}
          rotate={-1.1}
        >
          <SceneTitle
            eyebrow={COPY.prologue.eyebrow}
            eyebrowTone="honey"
            lines={COPY.prologue.title}
            startFrame={16}
            titleSize={86}
            width={820}
            lineGap={0}
          />

          {/* 正文：作者口吻的两句话 */}
          <div style={{ marginTop: 34, display: "flex", flexDirection: "column", gap: 16 }}>
            {COPY.prologue.body.map((line, index) => (
              <div
                key={line}
                style={{
                  opacity: clamp((frame - bodyAt[index]) / 12),
                  transform: `translateY(${(1 - clamp((frame - bodyAt[index]) / 14)) * 12}px)`,
                  fontFamily: FONTS.body,
                  fontSize: 33,
                  lineHeight: 1.62,
                  color: COLORS.inkSoft,
                  maxWidth: 790,
                }}
              >
                {line}
              </div>
            ))}
          </div>

          {/* 署名 */}
          <div
            style={{
              marginTop: 30,
              display: "flex",
              alignItems: "center",
              gap: 12,
              opacity: clamp((frame - signatureAt) / 14),
              transform: `translateX(${(1 - clamp((frame - signatureAt) / 16)) * -14}px)`,
            }}
          >
            <BearMark size={42} />
            <span
              style={{
                fontFamily: FONTS.display,
                fontSize: 30,
                fontWeight: 700,
                color: COLORS.inkSoft,
                letterSpacing: 0.5,
              }}
            >
              {COPY.prologue.signature}
            </span>
          </div>
        </InkPanel>
      </div>

      {/* ---------------- 拍立得：大肥鱼 ---------------- */}
      <div
        style={{
          position: "absolute",
          left: 1128,
          top: 206,
          width: 540,
          transform: `translateY(${(1 - polaroidIn) * -70}px) rotate(${2.4 - (1 - polaroidIn) * 9}deg) scale(${0.94 + 0.06 * polaroidIn})`,
          opacity: clamp(polaroidIn * 1.5),
        }}
      >
        <PaperTape
          width={210}
          height={52}
          rotate={7}
          tone={COLORS.honeyDeep}
          progress={clamp((frame - 30) / 10)}
          style={{ position: "absolute", left: 158, top: -20, zIndex: 3 }}
        />
        <div
          style={{
            background: COLORS.card,
            border: `${INK.regular}px solid ${COLORS.ink}`,
            borderRadius: 12,
            boxShadow: shadow(12),
            padding: "16px 16px 10px",
          }}
        >
          {/* 照片窗口 */}
          <div
            style={{
              position: "relative",
              width: 504,
              height: 476,
              background: COLORS.paperDeep,
              border: `${INK.regular}px solid ${COLORS.ink}`,
              borderRadius: 6,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: DOTS,
                backgroundSize: "22px 22px",
                opacity: 0.55,
              }}
            />
            <div
              style={{
                position: "relative",
                opacity: photoDevelop,
                transform: `scale(${1.06 - 0.06 * photoDevelop})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <OptionalArt
                src="assets/generated/dafeiyu.webp"
                fallback={<WhaleDoodle size={448} />}
                style={{ width: 448, height: 448, objectFit: "contain", display: "block" }}
                alt="大肥鱼"
              />
            </div>
            {/* 照片角落的暖色 */}
            <div
              style={{
                position: "absolute",
                left: 18,
                top: 16,
                opacity: 0.5 * photoDevelop,
              }}
            >
              <Sparkle size={30} color={COLORS.honey} />
            </div>
          </div>

          {/* 手写说明：只留名字 */}
          <div style={{ padding: "26px 6px 30px", textAlign: "center" }}>
            <div
              style={{
                fontFamily: FONTS.display,
                fontSize: 48,
                fontWeight: 700,
                color: COLORS.ink,
                letterSpacing: 3,
                opacity: clamp((frame - 52) / 12),
              }}
            >
              {COPY.prologue.photoCaption}
            </div>
          </div>
        </div>

        {/* 贴在拍立得外的小贴纸 */}
        <div
          style={{
            position: "absolute",
            right: -34,
            bottom: 74,
            ...stickerSlam(frame, 92, 8),
          }}
        >
          <Sticker tone="honey" size="sm" rotate={8} shadowSize={5}>
            vibecoding
          </Sticker>
        </div>
      </div>

      {/* ---------------- 交棒小问题 ---------------- */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 916,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          opacity: bridgeIn,
          transform: `translateY(${(1 - bridgeIn) * 18}px)`,
        }}
      >
        <span
          style={{
            fontFamily: FONTS.display,
            fontSize: 42,
            fontWeight: 700,
            color: COLORS.ink,
            letterSpacing: 1,
          }}
        >
          {COPY.prologue.bridge}
        </span>
        <ArrowDoodle size={62} progress={bridgeIn} style={{ transform: "rotate(-12deg)" }} />
      </div>

      {/* ---------------- 装饰 ---------------- */}
      <div style={{ position: "absolute", left: 984, top: 806, opacity: clamp((frame - 100) / 16) * 0.9 }}>
        <PawPrint size={54} color={COLORS.fur} rotate={-14} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 1700,
          top: 168,
          opacity: clamp((frame - 46) / 12) * 0.7,
          transform: `scale(${0.9 + float(frame, 0.1, 100)})`,
        }}
      >
        <Sparkle size={44} color={COLORS.honey} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 1046,
          top: 640,
          opacity: clamp((frame - 112) / 14) * 0.55,
        }}
      >
        <Sparkle size={26} color={COLORS.berry} />
      </div>
    </AbsoluteFill>
  );
};

export const PROLOGUE_DURATION = DURATION;
