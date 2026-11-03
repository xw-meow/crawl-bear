import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../../theme";
import { COPY } from "../../lib/copy";
import { clamp, easeOut, float, springAt, SPRINGS, stickerSlam } from "../../lib/anim";
import { SceneTitle } from "../../components/SceneTitle";
import { Sticker } from "../../components/Sticker";
import { CloudOffIcon, LockIcon, ShieldIcon } from "../../components/Icons";
import { PawPrint, Sparkle } from "../../components/Doodles";

const DURATION = 120;
const EXIT_AT = 104;

/** Warm "safe spot" circle — the container for the three promises. */
const CIRCLE = { left: 650, top: 400, size: 620 } as const;
const CIRCLE_CX = CIRCLE.left + CIRCLE.size / 2; // 960
const CIRCLE_CY = CIRCLE.top + CIRCLE.size / 2; // 710

const EMBLEM_TOP = 548;
const POINT_TOP = 662;
const POINT_GAP = 76;

const POINTS = [
  {
    label: COPY.privacy.points[0],
    icon: <LockIcon key="lock" size={34} color={COLORS.ink} strokeWidth={3} />,
    rotate: -1.4,
    phase: 0,
  },
  {
    label: COPY.privacy.points[1],
    icon: <ShieldIcon key="shield" size={34} color={COLORS.ink} strokeWidth={3} />,
    rotate: 0.9,
    phase: 1.9,
  },
  {
    label: COPY.privacy.points[2],
    icon: <CloudOffIcon key="cloud" size={34} color={COLORS.ink} strokeWidth={3} />,
    rotate: -0.8,
    phase: 3.7,
  },
] as const;

/**
 * Scene 8 · Privacy — "你的收藏，不经过任何人。"
 * A quiet breathing beat between the sites grid and the end card: one line,
 * one warm circle, three sticker promises inside it. No UI, no mascot.
 */
export const Privacy: React.FC = () => {
  const frame = useCurrentFrame();
  const exit = easeOut(clamp((frame - EXIT_AT) / (DURATION - EXIT_AT)));

  const circleIn = springAt(frame, 8, SPRINGS.heavy);
  const breathing = 1 + float(frame, 0.01, 165);

  return (
    <AbsoluteFill
      style={{
        opacity: 1 - exit,
        transform: `translateY(${-56 * exit}px)`,
      }}
    >
      {/* warm safe-spot circle, filled by the emblem + three promises */}
      <div
        style={{
          position: "absolute",
          left: CIRCLE.left,
          top: CIRCLE.top,
          width: CIRCLE.size,
          height: CIRCLE.size,
          borderRadius: "50%",
          background: COLORS.paperDeep,
          opacity: 0.85 * clamp((frame - 8) / 8),
          transform: `scale(${(0.88 + 0.12 * circleIn) * breathing})`,
        }}
      />

      {/* centred title block */}
      <div style={{ position: "absolute", left: 180, top: 130 }}>
        <SceneTitle
          eyebrow={COPY.privacy.eyebrow}
          eyebrowTone="honey"
          lines={[COPY.privacy.title]}
          sub={COPY.privacy.sub}
          startFrame={4}
          titleSize={92}
          subSize={36}
          width={1560}
          align="center"
          lineGap={0}
        />
      </div>

      {/* small shield emblem, pinned inside the top of the circle */}
      <div
        style={{
          position: "absolute",
          left: CIRCLE_CX - 42,
          top: EMBLEM_TOP,
          ...stickerSlam(frame, 11, 0),
        }}
      >
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: "50%",
            background: COLORS.honey,
            border: `3px solid ${COLORS.ink}`,
            boxShadow: "0 5px 0 rgba(51,38,29,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `translateY(${float(frame, 2.5, 150, 0.4)}px)`,
          }}
        >
          <ShieldIcon size={46} color={COLORS.ink} strokeWidth={3} />
        </div>
      </div>

      {/* three promises, stacked inside the circle */}
      {POINTS.map((point, index) => {
        const at = 14 + index * 5;
        return (
          <div
            key={point.label}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: POINT_TOP + index * POINT_GAP,
              display: "flex",
              justifyContent: "center",
              ...stickerSlam(frame, at, point.rotate),
            }}
          >
            <div style={{ transform: `translateY(${float(frame, 2.5, 140, point.phase)}px)` }}>
              <Sticker
                tone="card"
                size="md"
                rotate={0}
                icon={point.icon}
                shadowSize={6}
              >
                {point.label}
              </Sticker>
            </div>
          </div>
        );
      })}

      {/* quiet hand-drawn punctuation, kept in the margins */}
      <div
        style={{
          position: "absolute",
          left: 240,
          top: 286,
          opacity: 0.9 * clamp((frame - 18) / 10),
          transform: `rotate(${float(frame, 6, 150, 0)}deg) scale(${springAt(frame, 18, SPRINGS.bouncy)})`,
        }}
      >
        <Sparkle size={44} color={COLORS.honey} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 1648,
          top: 404,
          opacity: 0.8 * clamp((frame - 26) / 10),
          transform: `rotate(${float(frame, 8, 170, 2)}deg) scale(${springAt(frame, 26, SPRINGS.bouncy)})`,
        }}
      >
        <Sparkle size={26} color={COLORS.berry} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 386,
          top: 826,
          opacity: 0.4 * clamp((frame - 30) / 10),
          transform: `rotate(${-16 + float(frame, 4, 160, 1)}deg)`,
        }}
      >
        <PawPrint size={46} color={COLORS.fur} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 1540,
          top: 780,
          opacity: 0.32 * clamp((frame - 34) / 10),
          transform: `rotate(${14 + float(frame, 4, 180, 3)}deg)`,
        }}
      >
        <PawPrint size={32} color={COLORS.fur} />
      </div>
    </AbsoluteFill>
  );
};

export const PRIVACY_DURATION = DURATION;
