import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS, FONTS, INK, RADIUS, shadow } from "../../theme";
import { COPY } from "../../lib/copy";
import { clamp, easeOut, ramp, springAt, SPRINGS, stickerSlam } from "../../lib/anim";
import { SceneTitle } from "../../components/SceneTitle";
import { Sticker } from "../../components/Sticker";
import { SiteBadge } from "../../components/SiteBadge";
import { CheckIcon, ArrowRightIcon, type SiteKey } from "../../components/Icons";
import { MarkerUnderline, Sparkle } from "../../components/Doodles";

const DURATION = 165;
const EXIT_AT = 149;

const SITE_KEYS: SiteKey[] = ["x", "youtube", "bilibili", "douyin"];
const SITE_ROTATION = [-1.5, 1.2, -1.2, 1.5];
const CHIP_ROTATION = [-1.2, 1, -0.8, 1.4];

/** Quality ladder: three steps climbing out of the paper, bottom-aligned. */
type Step = {
  label: string;
  left: number;
  width: number;
  height: number;
  font: number;
  bg: string;
  color: string;
  check: boolean;
};

const STEPS: Step[] = [
  {
    label: "480P",
    left: 0,
    width: 150,
    height: 66,
    font: 30,
    bg: COLORS.paperDeep,
    color: COLORS.muted,
    check: false,
  },
  {
    label: "720P",
    left: 210,
    width: 155,
    height: 84,
    font: 34,
    bg: COLORS.honey,
    color: COLORS.ink,
    check: false,
  },
  {
    label: "1080P",
    left: 425,
    width: 210,
    height: 106,
    font: 42,
    bg: COLORS.berry,
    color: COLORS.card,
    check: true,
  },
];

const LADDER = { left: 480, top: 806, width: 635, height: 124 };

const QualityStep: React.FC<{
  frame: number;
  at: number;
  step: Step;
  checkAt: number;
}> = ({ frame, at, step, checkAt }) => {
  const p = springAt(frame, at, SPRINGS.heavy);
  const rise = (1 - Math.min(1, Math.max(0, p))) * 84;
  const opacity = clamp((frame - at) / 8);
  const checkP = springAt(frame, checkAt, SPRINGS.bouncy);

  return (
    <div
      style={{
        position: "absolute",
        left: step.left,
        bottom: 0,
        opacity,
        transform: `translateY(${rise}px)`,
      }}
    >
      <div
        style={{
          width: step.width,
          height: step.height,
          background: step.bg,
          color: step.color,
          border: `${INK.regular}px solid ${COLORS.ink}`,
          borderRadius: RADIUS.sm + 4,
          boxShadow: shadow(6),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          fontFamily: FONTS.mono,
          fontWeight: 700,
          fontSize: step.font,
          letterSpacing: 0.5,
          whiteSpace: "nowrap",
        }}
      >
        {step.label}
        {step.check && frame >= checkAt ? (
          <span style={{ display: "inline-flex", transform: `scale(${checkP})` }}>
            <CheckIcon size={26} color={step.color} strokeWidth={3.6} />
          </span>
        ) : null}
      </div>
    </div>
  );
};

/**
 * Scene 7 · Sites — sites that are hard to scrape get their own parser,
 * and the bear quietly picks the highest quality available.
 */
export const Sites: React.FC = () => {
  const frame = useCurrentFrame();
  const exit = easeOut(clamp((frame - EXIT_AT) / 15));
  const baselineProgress = easeOut(ramp(frame, 82, 20));

  return (
    <AbsoluteFill style={{ opacity: 1 - exit, transform: `translateY(${-60 * exit}px)` }}>
      {/* Title — centred, upper third */}
      <div
        style={{
          position: "absolute",
          top: 76,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <SceneTitle
          eyebrow={COPY.sites.eyebrow}
          eyebrowTone="honey"
          lines={[COPY.sites.title]}
          sub={COPY.sites.sub}
          startFrame={4}
          titleSize={84}
          subSize={34}
          width={1500}
          align="center"
        />
      </div>

      {/* Feature chips — one per beat */}
      <div
        style={{
          position: "absolute",
          top: 356,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 18,
        }}
      >
        {COPY.sites.chips.map((chip, index) => (
          <div key={chip} style={stickerSlam(frame, 44 + index * 8, CHIP_ROTATION[index])}>
            <Sticker tone="honey" size="md" shadowSize={6}>
              {chip}
            </Sticker>
          </div>
        ))}
      </div>

      {/* Supported sites — 2×2 card wall */}
      <div
        style={{
          position: "absolute",
          left: 516,
          top: 442,
          display: "grid",
          gridTemplateColumns: "430px 430px",
          gap: "22px 28px",
        }}
      >
        {COPY.sites.sites.map((site, index) => (
          <div key={site.name} style={stickerSlam(frame, 12 + index * 8, SITE_ROTATION[index])}>
            <SiteBadge site={SITE_KEYS[index]} name={site.name} note={site.note} width={430} />
          </div>
        ))}
      </div>

      {/* Quality ladder */}
      <div
        style={{
          position: "absolute",
          left: 470,
          top: 924,
          opacity: clamp((frame - 82) / 10),
        }}
      >
        <MarkerUnderline
          width={660}
          progress={baselineProgress}
          color={COLORS.lineSoft}
          thickness={7}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: LADDER.left,
          top: LADDER.top,
          width: LADDER.width,
          height: LADDER.height,
        }}
      >
        {STEPS.map((step, index) => (
          <QualityStep
            key={step.label}
            frame={frame}
            at={86 + index * 8}
            step={step}
            checkAt={112}
          />
        ))}

        {/* little direction arrows between the steps */}
        <div
          style={{
            position: "absolute",
            left: 168,
            top: 62,
            opacity: clamp((frame - 96) / 8) * 0.85,
          }}
        >
          <ArrowRightIcon size={24} color={COLORS.inkSoft} strokeWidth={2.6} />
        </div>
        <div
          style={{
            position: "absolute",
            left: 383,
            top: 66,
            opacity: clamp((frame - 102) / 8) * 0.85,
          }}
        >
          <ArrowRightIcon size={24} color={COLORS.inkSoft} strokeWidth={2.6} />
        </div>
      </div>

      {/* "dedicated parser is on" leaf sticker */}
      <div
        style={{
          ...stickerSlam(frame, 118, 2),
          position: "absolute",
          left: 1160,
          top: 842,
        }}
      >
        <Sticker
          tone="leaf"
          size="md"
          icon={<CheckIcon size={26} color={COLORS.leaf} strokeWidth={3.6} />}
          shadowSize={6}
          style={{ fontSize: 27 }}
        >
          {COPY.sites.badge}
        </Sticker>
      </div>

      {/* A little sparkle punctuation */}
      <div
        style={{
          position: "absolute",
          left: 452,
          top: 430,
          opacity: clamp((frame - 56) / 10) * 0.9,
          transform: `scale(${0.7 + 0.3 * clamp((frame - 56) / 12)}) rotate(${
            Math.sin((frame - 56) / 26) * 8
          }deg)`,
        }}
      >
        <Sparkle size={34} color={COLORS.honey} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 1492,
          top: 770,
          opacity: clamp((frame - 110) / 10) * 0.85,
          transform: `scale(${0.7 + 0.3 * clamp((frame - 110) / 12)}) rotate(${
            Math.sin((frame - 110) / 24) * 8
          }deg)`,
        }}
      >
        <Sparkle size={26} color={COLORS.honeyDeep} />
      </div>
    </AbsoluteFill>
  );
};
