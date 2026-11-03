import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS, SCENES, WIDTH } from "../theme";
import { COPY } from "../lib/copy";
import { clamp, drift, easeOut, float, springAt, SPRINGS, stickerSlam } from "../lib/anim";
import { SceneTitle } from "../components/SceneTitle";
import { Mascot } from "../components/Mascot";
import { Bubble } from "../components/Bubble";
import { Sticker } from "../components/Sticker";
import { FontIcon, ImageIcon, MusicIcon, VideoIcon } from "../components/Icons";
import { Sparkle } from "../components/Doodles";

const DURATION = 150;

/** Floating media-icon sticker orbiting the bear. */
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
 * Scene 1 · Hook — the promise of the product and the mascot.
 * "把网页里的宝贝，收进采集袋。"
 */
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const exit = easeOut(clamp((frame - (DURATION - 16)) / 14));

  return (
    <AbsoluteFill style={{ opacity: 1 - exit, transform: `translateY(${-60 * exit}px)` }}>
      {/* honey desk circle behind the bear */}
      <div
        style={{
          position: "absolute",
          right: 168,
          top: 138,
          width: 720,
          height: 720,
          borderRadius: "50%",
          background: COLORS.paperDeep,
          opacity: 0.9,
          transform: `scale(${0.86 + 0.14 * springAt(frame, 6, SPRINGS.heavy)})`,
        }}
      />

      <Mascot
        mood="hero"
        height={720}
        enterAt={34}
        enterFrom="bottom"
        bob={10}
        bobPeriod={120}
        style={{ position: "absolute", right: 236, bottom: 54 }}
      />

      <div style={{ ...stickerSlam(frame, 66, -1.5), position: "absolute", right: 470, top: 150 }}>
        <Bubble text={COPY.hook.bubble} fontSize={38} tail="down-right" tailOffset={90} />
      </div>

      <FloatChip
        icon={<ImageIcon size={46} color={COLORS.leaf} strokeWidth={3.2} />}
        frame={frame}
        at={78}
        phase={0}
        rotate={-9}
        style={{ right: 812, top: 246 }}
      />
      <FloatChip
        icon={<VideoIcon size={46} color="#4E93AA" strokeWidth={3.2} />}
        frame={frame}
        at={86}
        phase={1.6}
        rotate={7}
        style={{ right: 118, top: 404 }}
      />
      <FloatChip
        icon={<MusicIcon size={46} color={COLORS.berry} strokeWidth={3.2} />}
        frame={frame}
        at={94}
        phase={3.1}
        rotate={-6}
        style={{ right: 742, top: 742 }}
      />
      <FloatChip
        icon={<FontIcon size={46} color={COLORS.ink} strokeWidth={3.2} />}
        frame={frame}
        at={102}
        phase={4.4}
        rotate={8}
        style={{ right: 128, top: 792 }}
      />

      <div style={{ position: "absolute", left: 120, top: 262 }}>
        <SceneTitle
          eyebrow={COPY.hook.eyebrow}
          eyebrowTone="honey"
          lines={COPY.hook.title}
          sub={COPY.hook.sub}
          startFrame={14}
          titleSize={112}
          subSize={38}
          width={1010}
          highlightLast
          lineGap={2}
        />
      </div>

      <Sparkle size={46} color={COLORS.honey} style={{ position: "absolute", left: 96, top: 232, opacity: clamp((frame - 30) / 10) }} />
      <Sparkle
        size={30}
        color={COLORS.berry}
        style={{
          position: "absolute",
          left: 1044,
          top: 640,
          opacity: clamp((frame - 88) / 10) * 0.8,
          transform: `scale(${0.9 + drift(frame, 0.12, 90)})`,
        }}
      />
    </AbsoluteFill>
  );
};

export const HOOK_DURATION = SCENES[0].duration;
export const HOOK_WIDTH = WIDTH;
