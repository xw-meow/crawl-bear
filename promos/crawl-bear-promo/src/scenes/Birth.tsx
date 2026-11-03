import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS, FONTS, SCENES } from "../theme";
import { COPY } from "../lib/copy";
import {
  clamp,
  drift,
  easeOut,
  float,
  ramp,
  springAt,
  SPRINGS,
  stickerSlam,
} from "../lib/anim";
import { Mascot } from "../components/Mascot";
import { Bubble } from "../components/Bubble";
import { Sticker } from "../components/Sticker";
import { Wordmark } from "../components/Wordmark";
import { MarkerUnderline, Sparkle } from "../components/Doodles";
import { FontIcon, ImageIcon, MusicIcon, VideoIcon } from "../components/Icons";

const DURATION = SCENES.find((scene) => scene.id === "birth")!.duration;

const DISC = { cx: 1410, cy: 520, size: 760 };
const BURST_AT = 34;
const BEAR_AT = 36;

/** Floating media-icon sticker around the newborn bear. */
const FloatChip: React.FC<{
  icon: React.ReactNode;
  frame: number;
  at: number;
  style: React.CSSProperties;
  phase: number;
  rotate: number;
}> = ({ icon, frame, at, style, phase, rotate }) => {
  const p = springAt(frame, at, SPRINGS.bouncy);
  return (
    <div
      style={{
        position: "absolute",
        transform: `translateY(${float(frame, 10, 120, phase)}px) rotate(${rotate + float(frame + 30, 3, 150, phase)}deg) scale(${p})`,
        opacity: clamp((frame - at) / 6),
        ...style,
      }}
    >
      <Sticker tone="card" size="lg" shadowSize={7} icon={icon} style={{ padding: 22, borderRadius: 999 }}>
        {null}
      </Sticker>
    </div>
  );
};

/**
 * Scene 3 · Birth — 故事转折：麻烦太多，干脆自己写一个，于是爬爬熊诞生了。
 * 品牌名和 slogan 在这里作为剧情出现，而不是一张产品标题卡。
 */
export const Birth: React.FC = () => {
  const frame = useCurrentFrame();

  const burst = springAt(frame, BURST_AT, SPRINGS.bouncy);
  const bearPop = springAt(frame, BEAR_AT, { stiffness: 240, damping: 13, mass: 1 });
  const bearOpacity = clamp((frame - BEAR_AT) / 5);

  const setupP = easeOut(ramp(frame, 14, 16));
  const revealP = easeOut(ramp(frame, 46, 14));
  const wordmarkP = springAt(frame, 72, SPRINGS.smooth);
  const taglineP = easeOut(ramp(frame, 96, 14));
  const underlineP = easeOut(ramp(frame, 104, 20));

  const exit = easeOut(ramp(frame, DURATION - 16, 16));
  const ringP = clamp((frame - BURST_AT) / 26);

  return (
    <AbsoluteFill style={{ opacity: 1 - exit, transform: `translateY(${-64 * exit}px)` }}>
      {/* 诞生光圈 */}
      <div
        style={{
          position: "absolute",
          left: DISC.cx - DISC.size / 2,
          top: DISC.cy - DISC.size / 2,
          width: DISC.size,
          height: DISC.size,
          borderRadius: "50%",
          background: COLORS.paperDeep,
          transform: `scale(${0.55 + 0.45 * burst})`,
          opacity: clamp(burst * 1.6),
        }}
      />

      {/* 放射线 */}
      <div
        style={{
          position: "absolute",
          left: DISC.cx,
          top: DISC.cy,
          opacity: clamp((frame - BURST_AT) / 4) * (1 - clamp((frame - (BURST_AT + 30)) / 14)),
          transform: `scale(${0.7 + 0.35 * burst}) rotate(${drift(frame, 2, 120)}deg)`,
        }}
      >
        {Array.from({ length: 14 }).map((_, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              left: -3,
              top: -178,
              width: 6,
              height: 118,
              borderRadius: 3,
              background: COLORS.honey,
              transform: `rotate(${(index * 360) / 14}deg) translateY(${18 + (index % 3) * 10}px)`,
              transformOrigin: "3px 178px",
              opacity: 0.9,
            }}
          />
        ))}
      </div>

      {/* 落地冲环 + 尘土 */}
      <div
        style={{
          position: "absolute",
          left: DISC.cx - 360,
          top: DISC.cy + 250,
          width: 720,
          height: 720 * 0.36,
          borderRadius: "50%",
          border: `6px solid ${COLORS.honeyDeep}`,
          opacity: (1 - ringP) * 0.55,
          transform: `scale(${0.35 + ringP * 1.1})`,
        }}
      />
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: DISC.cx - 220 + index * 210,
            top: DISC.cy + 300 - index * 16,
            width: 90,
            height: 90,
            borderRadius: "50%",
            background: COLORS.lineSoft,
            opacity: clamp((frame - (BURST_AT + index * 4)) / 6) * 0.5 * (1 - clamp((frame - (BURST_AT + 18)) / 18)),
            transform: `scale(${0.4 + clamp((frame - BURST_AT) / 20) * 1.6})`,
          }}
        />
      ))}

      {/* 小熊登场 */}
      <div
        style={{
          position: "absolute",
          right: 210,
          bottom: 44,
          transformOrigin: "50% 92%",
          transform: `scale(${0.32 + 0.68 * bearPop}) translateY(${(1 - clamp(bearPop)) * 90}px) rotate(${float(frame, 1.3, 110)}deg)`,
          opacity: bearOpacity,
        }}
      >
        <Mascot mood="hero" height={680} bob={9} bobPeriod={118} sway={1.5} />
      </div>

      {/* 气泡 */}
      <div style={{ ...stickerSlam(frame, 62, -1.5), position: "absolute", right: 452, top: 168 }}>
        <Bubble text={COPY.birth.bubble} fontSize={36} tail="down-right" tailOffset={96} />
      </div>

      {/* 四类媒体贴纸 */}
      <FloatChip
        icon={<ImageIcon size={44} color={COLORS.leaf} strokeWidth={3.2} />}
        frame={frame}
        at={80}
        phase={0}
        rotate={-9}
        style={{ right: 812, top: 236 }}
      />
      <FloatChip
        icon={<VideoIcon size={44} color="#4E93AA" strokeWidth={3.2} />}
        frame={frame}
        at={86}
        phase={1.6}
        rotate={7}
        style={{ right: 62, top: 352 }}
      />
      <FloatChip
        icon={<MusicIcon size={44} color={COLORS.berry} strokeWidth={3.2} />}
        frame={frame}
        at={92}
        phase={3.1}
        rotate={-6}
        style={{ right: 742, top: 792 }}
      />
      <FloatChip
        icon={<FontIcon size={44} color={COLORS.ink} strokeWidth={3.2} />}
        frame={frame}
        at={98}
        phase={4.4}
        rotate={8}
        style={{ right: 128, top: 742 }}
      />

      {/* 左侧文字列 */}
      <div style={{ position: "absolute", left: 120, top: 236, width: 860 }}>
        <div style={{ ...stickerSlam(frame, 8, -2), marginBottom: 22 }}>
          <Sticker tone="honey" size="sm" rotate={-2}>
            {COPY.birth.eyebrow}
          </Sticker>
        </div>

        <div
          style={{
            fontFamily: FONTS.display,
            fontWeight: 700,
            fontSize: 88,
            lineHeight: 1.16,
            letterSpacing: -1.5,
            color: COLORS.ink,
            transform: `translateY(${(1 - setupP) * 26}px)`,
            clipPath: `inset(-12% ${(1 - setupP) * 100}% -18% 0)`,
            whiteSpace: "nowrap",
          }}
        >
          {COPY.birth.setup}
        </div>

        <div
          style={{
            marginTop: 28,
            fontFamily: FONTS.display,
            fontWeight: 700,
            fontSize: 52,
            lineHeight: 1.2,
            letterSpacing: 0.5,
            color: COLORS.inkSoft,
            opacity: revealP,
            transform: `translateY(${(1 - revealP) * 16}px)`,
          }}
        >
          {COPY.birth.reveal}
        </div>

        <div
          style={{
            marginTop: 46,
            transform: `scale(${0.92 + 0.08 * wordmarkP})`,
            transformOrigin: "left center",
            opacity: clamp(wordmarkP * 1.4),
          }}
        >
          <Wordmark size={1} align="row" />
        </div>

        <div style={{ marginTop: 56, opacity: taglineP, transform: `translateY(${(1 - taglineP) * 14}px)` }}>
          <div
            style={{
              fontFamily: FONTS.display,
              fontWeight: 700,
              fontSize: 44,
              lineHeight: 1.2,
              letterSpacing: 0.5,
              color: COLORS.ink,
              whiteSpace: "nowrap",
            }}
          >
            {COPY.birth.tagline}
          </div>
          <MarkerUnderline width={640} progress={underlineP} thickness={14} style={{ marginTop: 2 }} />
        </div>
      </div>

      {/* 装饰 */}
      <Sparkle
        size={44}
        color={COLORS.honey}
        style={{
          position: "absolute",
          left: 1010,
          top: 168,
          opacity: clamp((frame - 50) / 10),
          transform: `scale(${0.85 + drift(frame, 0.12, 90)})`,
        }}
      />
      <Sparkle
        size={28}
        color={COLORS.berry}
        style={{ position: "absolute", left: 1762, top: 296, opacity: clamp((frame - 96) / 10) }}
      />
      <Sparkle
        size={24}
        color={COLORS.honey}
        style={{ position: "absolute", left: 980, top: 828, opacity: clamp((frame - 108) / 10) }}
      />
    </AbsoluteFill>
  );
};

export const BIRTH_DURATION = DURATION;
