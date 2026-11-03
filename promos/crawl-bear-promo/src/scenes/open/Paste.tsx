import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS, FONTS } from "../../theme";
import { COPY } from "../../lib/copy";
import {
  blink,
  clamp,
  easeOut,
  springAt,
  SPRINGS,
  stickerSlam,
  typed,
} from "../../lib/anim";
import { SceneTitle } from "../../components/SceneTitle";
import { SearchCapsule } from "../../components/SearchCapsule";
import { useCopy } from "../../lib/variant";
import { Sticker, CountBubble } from "../../components/Sticker";
import { Bubble } from "../../components/Bubble";
import { Mascot } from "../../components/Mascot";
import { Sparkle } from "../../components/Doodles";
import { ArrowRightIcon } from "../../components/Icons";

const DURATION = 150;
const EXIT_AT = 134;

const TYPING_START = 24;
const TYPING_SPEED = 0.45;
const AUTO_FILL_AT = 64;

/** Capsule geometry (kept in one place so the tap ripple can aim at the button). */
const CAPSULE = { left: 320, top: 336, width: 1280, height: 156 };
const RIPPLE = { x: 1451, y: 414 };

const TapRipple: React.FC<{ frame: number; at: number }> = ({ frame, at }) => {
  if (frame < at) return null;
  const t = clamp((frame - at) / 22);
  const radius = 18 + easeOut(t) * 112;
  return (
    <div
      style={{
        position: "absolute",
        left: RIPPLE.x - radius,
        top: RIPPLE.y - radius,
        width: radius * 2,
        height: radius * 2,
        borderRadius: 999,
        border: `3.5px solid ${COLORS.honey}`,
        opacity: (1 - t) * 0.55,
      }}
    />
  );
};

/**
 * Scene 3 · Paste — one URL, and the bear takes it from there.
 * Title, a big search capsule that types itself, focus halo, tap, hand-off bubble,
 * plus a small three-step strip that foreshadows what happens next.
 */
export const Paste: React.FC = () => {
  const frame = useCurrentFrame();
  const copy = useCopy();
  const exit = easeOut(clamp((frame - EXIT_AT) / 15));

  const typedText = typed(frame, copy.paste.url, TYPING_START, TYPING_SPEED);
  const autoFilled = frame >= AUTO_FILL_AT;
  const text = autoFilled ? `https://${copy.paste.url}` : typedText;
  const caret = frame > 16 && (frame < AUTO_FILL_AT || blink(frame, 16, 12));

  const focus = easeOut(clamp((frame - 58) / 16));

  // 0 → 0.85 on the press, settle back to 0.15 — then fully release during the exit.
  const pressRaw =
    frame < 76
      ? 0
      : frame < 83
        ? easeOut(clamp((frame - 76) / 7)) * 0.85
        : frame < 91
          ? 0.85 - ((frame - 83) / 8) * 0.7
          : 0.15;
  const press = pressRaw * (1 - exit);

  const capsuleEnter = springAt(frame, 12, SPRINGS.heavy);
  const settle = Math.min(1, Math.max(0, capsuleEnter));
  // A tiny "pop" the moment https:// writes itself in.
  const autoPop = Math.sin(clamp((frame - 60) / 16) * Math.PI) * 0.032;
  const capsuleOpacity = clamp((frame - 12) / 10);
  const capsuleScale = 0.95 + 0.05 * settle + autoPop + 0.075 * exit;

  const tipSlam = stickerSlam(frame, AUTO_FILL_AT, 2);
  const tipFade = 1 - clamp((frame - 100) / 12);
  const tipDrift = -8 * clamp((frame - 92) / 16);

  const subIn = clamp((frame - 92) / 12);

  return (
    <AbsoluteFill style={{ opacity: 1 - exit, transform: `translateY(${-44 * exit}px)` }}>
      {/* Title — centred, upper third */}
      <div
        style={{
          position: "absolute",
          top: 56,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <SceneTitle
          eyebrow={COPY.paste.eyebrow}
          eyebrowTone="honey"
          lines={[COPY.paste.title]}
          startFrame={4}
          titleSize={88}
          width={1500}
          align="center"
        />
      </div>

      {/* The one-piece search capsule */}
      <div
        style={{
          position: "absolute",
          left: CAPSULE.left,
          top: CAPSULE.top,
          opacity: capsuleOpacity,
          transform: `translateY(${(1 - settle) * 46 - 14 * exit}px) scale(${capsuleScale})`,
          transformOrigin: "50% 50%",
        }}
      >
        <SearchCapsule
          width={CAPSULE.width}
          height={CAPSULE.height}
          text={text}
          placeholder={COPY.paste.placeholder}
          cta={COPY.paste.cta}
          focused={focus}
          press={press}
          caret={caret}
        />
      </div>

      {/* Tap ripples around the button */}
      <TapRipple frame={frame} at={86} />
      <TapRipple frame={frame} at={90} />
      <TapRipple frame={frame} at={94} />

      {/* Honey sparkles around the button as it is tapped */}
      <div
        style={{
          position: "absolute",
          left: 1478,
          top: 264,
          opacity: clamp((frame - 82) / 8),
          transform: `scale(${0.6 + 0.4 * clamp((frame - 82) / 10)})`,
        }}
      >
        <Sparkle size={30} color={COLORS.honey} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 1352,
          top: 518,
          opacity: clamp((frame - 88) / 8) * 0.9,
          transform: `scale(${0.6 + 0.4 * clamp((frame - 88) / 10)})`,
        }}
      >
        <Sparkle size={22} color={COLORS.honeyDeep} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 1600,
          top: 250,
          opacity: clamp((frame - 93) / 8) * 0.8,
          transform: `scale(${0.6 + 0.4 * clamp((frame - 93) / 10)})`,
        }}
      >
        <Sparkle size={16} color={COLORS.honey} />
      </div>

      {/* "auto-fill" hint above the capsule */}
      <div
        style={{
          position: "absolute",
          left: 336,
          top: 252,
          opacity: tipSlam.opacity * tipFade,
          transform: `${tipSlam.transform} translateY(${tipDrift}px)`,
        }}
      >
        <Sticker tone="honey" size="sm" shadowSize={5}>
          {COPY.paste.autoFillHint}
        </Sticker>
      </div>

      {/* Supporting line, explained after the magic moment */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 552,
          textAlign: "center",
          fontFamily: FONTS.body,
          fontSize: 34,
          lineHeight: 1.5,
          color: COLORS.inkSoft,
          opacity: subIn,
          transform: `translateY(${(1 - subIn) * 12}px)`,
        }}
      >
        {COPY.paste.sub}
      </div>

      {/* Three-step guide strip, lower-left — fills the paper without stealing focus */}
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 856,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        {COPY.paste.steps.map((step, index) => (
          <React.Fragment key={step}>
            {index > 0 ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  opacity: clamp((frame - (54 + index * 6)) / 8) * 0.6,
                }}
              >
                <ArrowRightIcon size={18} color={COLORS.muted} strokeWidth={3} />
              </div>
            ) : null}
            <div style={{ ...stickerSlam(frame, 46 + index * 6, index % 2 ? 1.2 : -1.4) }}>
              <Sticker
                tone="card"
                size="sm"
                icon={<CountBubble value={index + 1} size={26} tone="honey" />}
                shadowSize={5}
              >
                {step}
              </Sticker>
            </div>
          </React.Fragment>
        ))}
      </div>

      <Mascot
        mood="hero"
        height={420}
        enterAt={92}
        enterFrom="bottom"
        bob={6}
        bobPeriod={112}
        style={{ position: "absolute", right: 120, bottom: 40 }}
      />

      <div style={{ ...stickerSlam(frame, 102, -1.6), position: "absolute", right: 230, top: 500 }}>
        <Bubble text={COPY.paste.bubble} fontSize={38} tail="down-right" tailOffset={70} rotate={0} />
      </div>
    </AbsoluteFill>
  );
};
