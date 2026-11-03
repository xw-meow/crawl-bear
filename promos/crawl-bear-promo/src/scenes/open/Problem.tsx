import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS, FONTS, INK, SAFE } from "../../theme";
import { COPY } from "../../lib/copy";
import {
  clamp,
  easeInOut,
  easeOut,
  lerp,
  springAt,
  SPRINGS,
  stickerSlam,
} from "../../lib/anim";
import { SceneTitle } from "../../components/SceneTitle";
import { InkPanel } from "../../components/InkPanel";
import { Sticker } from "../../components/Sticker";
import { Bubble } from "../../components/Bubble";
import { Mascot } from "../../components/Mascot";
import { useCopy } from "../../lib/variant";
import { CrossMark, PawPrint } from "../../components/Doodles";
import { CursorIcon, GlobeIcon } from "../../components/Icons";

const DURATION = 150;
const EXIT_AT = 134;

/* ------------------------------------------------------------------ *
 * Scene-specific layout constants (1920×1080)
 * ------------------------------------------------------------------ */

const WINDOW = { left: 1000, top: 96, width: 800, height: 548 };
const TILE = { width: 238, height: 178 };
const PAIN_ROTATION = [-1.3, 1.1, -0.9, 1.4];

/* ------------------------------------------------------------------ *
 * Fake unsplash page — small flat "photos" drawn with tokens only.
 * ------------------------------------------------------------------ */

const TILE_BG = [
  COLORS.skySoft,
  COLORS.leafSoft,
  COLORS.paperDeep,
  COLORS.furLight,
  COLORS.leafSoft,
  COLORS.skySoft,
];

const PhotoArt: React.FC<{ variant: number }> = ({ variant }) => {
  const ink = {
    stroke: COLORS.ink,
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  let shapes: React.ReactNode = null;
  switch (variant % 6) {
    case 0:
      shapes = (
        <>
          <circle cx="76" cy="20" r="10" fill={COLORS.honey} {...ink} />
          <path d="M-10 76 L26 34 L60 76 Z" fill={COLORS.leaf} {...ink} />
          <path d="M40 76 L70 26 L110 76 Z" fill={COLORS.furLight} {...ink} />
        </>
      );
      break;
    case 1:
      shapes = (
        <>
          <path
            d="M50 64 C30 58 22 38 34 20 C46 4 66 8 74 24 C82 42 70 60 50 64 Z"
            fill={COLORS.leaf}
            {...ink}
          />
          <path d="M52 61 C54 46 58 32 66 20" fill="none" {...ink} />
          <path d="M2 68 L98 68" fill="none" {...ink} opacity={0.4} />
        </>
      );
      break;
    case 2:
      shapes = (
        <>
          <circle cx="70" cy="22" r="8" fill={COLORS.honey} {...ink} />
          <path
            d="M-6 46 C10 34 24 58 40 46 C56 34 70 58 86 46 C96 39 104 42 108 44"
            fill="none"
            stroke={COLORS.sky}
            strokeWidth={6}
            strokeLinecap="round"
          />
          <path
            d="M-6 62 C10 50 24 74 40 62 C56 50 70 74 86 62 C96 55 104 58 108 60"
            fill="none"
            stroke={COLORS.sky}
            strokeWidth={6}
            strokeLinecap="round"
            opacity={0.7}
          />
        </>
      );
      break;
    case 3:
      shapes = (
        <>
          <circle cx="30" cy="24" r="12" fill={COLORS.fur} {...ink} />
          <circle cx="70" cy="24" r="12" fill={COLORS.fur} {...ink} />
          <circle cx="50" cy="46" r="24" fill={COLORS.fur} {...ink} />
          <ellipse cx="50" cy="52" rx="13" ry="10" fill={COLORS.card} {...ink} />
          <circle cx="43" cy="42" r="2.6" fill={COLORS.ink} />
          <circle cx="57" cy="42" r="2.6" fill={COLORS.ink} />
          <ellipse cx="50" cy="49" rx="4" ry="3" fill={COLORS.ink} />
        </>
      );
      break;
    case 4:
      shapes = (
        <>
          <circle cx="30" cy="30" r="17" fill={COLORS.berry} {...ink} />
          <circle cx="64" cy="24" r="12" fill={COLORS.honey} {...ink} />
          <circle cx="66" cy="56" r="18" fill={COLORS.sky} {...ink} />
          <path d="M14 62 L30 56" fill="none" {...ink} opacity={0.5} />
        </>
      );
      break;
    default:
      shapes = (
        <>
          <path
            d="M50 62 L50 72"
            fill="none"
            stroke={COLORS.leaf}
            strokeWidth={4}
            strokeLinecap="round"
          />
          <path
            d="M50 62 C42 58 35 64 37 70"
            fill="none"
            stroke={COLORS.leaf}
            strokeWidth={4}
            strokeLinecap="round"
          />
          {[0, 1, 2, 3, 4].map((petal) => {
            const angle = (petal / 5) * Math.PI * 2 - Math.PI / 2;
            return (
              <circle
                key={petal}
                cx={50 + Math.cos(angle) * 16}
                cy={36 + Math.sin(angle) * 16}
                r="11"
                fill={COLORS.card}
                {...ink}
              />
            );
          })}
          <circle cx="50" cy="36" r="8" fill={COLORS.honey} {...ink} />
        </>
      );
  }
  return (
    <svg
      viewBox="0 0 100 75"
      preserveAspectRatio="none"
      style={{ display: "block", width: "100%", height: "100%" }}
      aria-hidden
    >
      {shapes}
    </svg>
  );
};

const PhotoTile: React.FC<{
  variant: number;
  frame: number;
  enterAt: number;
}> = ({ variant, frame, enterAt }) => {
  const p = easeOut(clamp((frame - enterAt) / 12));
  return (
    <div
      style={{
        width: TILE.width,
        height: TILE.height,
        background: TILE_BG[variant % TILE_BG.length],
        border: `${INK.regular}px solid ${COLORS.ink}`,
        borderRadius: 12,
        overflow: "hidden",
        opacity: p,
        transform: `translateY(${(1 - p) * 16}px) scale(${0.9 + 0.1 * p})`,
      }}
    >
      <PhotoArt variant={variant} />
    </div>
  );
};

/** The failed "old way" browser window. Enters as one heavy slab. */
const BrowserWindow: React.FC<{ frame: number }> = ({ frame }) => {
  const copy = useCopy();
  const p = springAt(frame, 10, SPRINGS.heavy);
  const settle = Math.min(1, Math.max(0, p));
  const opacity = clamp((frame - 10) / 8);

  return (
    <div
      style={{
        position: "absolute",
        left: WINDOW.left,
        top: WINDOW.top,
        opacity,
        transform: `translateY(${(1 - settle) * 54}px) scale(${0.94 + 0.06 * settle}) rotate(${lerp(
          -1.6,
          -0.5,
          settle,
        )}deg)`,
      }}
    >
      <InkPanel
        padding={0}
        radius={26}
        shadowSize={10}
        style={{ width: WINDOW.width, height: WINDOW.height, overflow: "hidden" }}
      >
        {/* browser chrome */}
        <div
          style={{
            height: 64,
            background: COLORS.paperDeep,
            borderBottom: `${INK.hairline}px solid ${COLORS.ink}`,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "0 24px",
          }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            {[COLORS.berry, COLORS.honey, COLORS.leaf].map((color) => (
              <span
                key={color}
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 999,
                  background: color,
                  border: `${INK.hairline}px solid ${COLORS.ink}`,
                }}
              />
            ))}
          </div>
          <div
            style={{
              flex: 1,
              maxWidth: 470,
              height: 38,
              borderRadius: 999,
              background: COLORS.card,
              border: `${INK.hairline}px solid ${COLORS.lineSoft}`,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0 16px",
            }}
          >
            <GlobeIcon size={22} color={COLORS.inkSoft} strokeWidth={2.4} />
            <span
              style={{
                fontFamily: FONTS.body,
                fontSize: 24,
                color: COLORS.inkSoft,
                whiteSpace: "nowrap",
              }}
            >
              {copy.problem.windowTitle}
            </span>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 5 }}>
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                style={{ width: 5, height: 5, borderRadius: 999, background: COLORS.inkSoft }}
              />
            ))}
          </div>
        </div>

        {/* fake page: tiny header + photo grid */}
        <div style={{ padding: "22px 26px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, height: 36 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: COLORS.honey,
                border: `${INK.hairline}px solid ${COLORS.ink}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PawPrint size={20} color={COLORS.ink} />
            </div>
            {[54, 40, 46].map((width, index) => (
              <span
                key={index}
                style={{ width, height: 10, borderRadius: 99, background: COLORS.lineSoft }}
              />
            ))}
            <div
              style={{
                marginLeft: "auto",
                width: 190,
                height: 30,
                borderRadius: 999,
                background: COLORS.paperDeep,
                border: `${INK.hairline}px solid ${COLORS.lineSoft}`,
              }}
            />
          </div>
          <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 14 }}>
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <PhotoTile key={index} variant={index} frame={frame} enterAt={18 + index * 3} />
            ))}
          </div>
        </div>
      </InkPanel>
    </div>
  );
};

/** Loose rope doodle trailing from the browser toward Papa — "the web, tangled". */
const TangleRope: React.FC<{ frame: number }> = ({ frame }) => {
  const progress = easeOut(clamp((frame - 74) / 36));
  const length = 1150;
  return (
    <svg
      width={690}
      height={280}
      viewBox="0 0 690 280"
      style={{ position: "absolute", left: 368, top: 640, opacity: 0.55 }}
      aria-hidden
    >
      <path
        d="M 664 16 C 590 26, 566 92, 470 96 C 372 100, 356 178, 250 176 C 176 174, 148 224, 64 222"
        fill="none"
        stroke={COLORS.sky}
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={length}
        strokeDashoffset={length * (1 - progress)}
      />
    </svg>
  );
};

const ClickPulse: React.FC<{ frame: number; at: number; x: number; y: number }> = ({
  frame,
  at,
  x,
  y,
}) => {
  if (frame < at) return null;
  const t = clamp((frame - at) / 12);
  const r = 8 + easeOut(t) * 24;
  return (
    <div
      style={{
        position: "absolute",
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: 999,
        border: `${INK.regular}px solid ${COLORS.ink}`,
        opacity: (1 - t) * 0.45,
      }}
    />
  );
};

/**
 * Scene 2 · Problem — the old way of saving media is a chore.
 * A fake page window, four crossed-out pain stickers, and Papa tangled up.
 */
export const Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const copy = useCopy();
  const exit = easeOut(clamp((frame - EXIT_AT) / 15));

  // Papa's slow "no no no" head shake, eased in and out.
  const shakeEnvelope = clamp((frame - 56) / 12) * (1 - clamp((frame - 118) / 14));
  const shake = Math.sin((frame - 56) / 5.5) * 2.1 * shakeEnvelope;

  // A cursor that keeps right-click-saving, one photo at a time.
  const move1 = easeInOut(clamp((frame - 26) / 14));
  const move2 = easeInOut(clamp((frame - 54) / 14));
  const move3 = easeInOut(clamp((frame - 86) / 16));
  const cursorX = lerp(lerp(lerp(1812, 1400, move1), 1148, move2), 1652, move3);
  const cursorY = lerp(lerp(lerp(648, 330, move1), 522, move2), 330, move3);
  const cursorOpacity = clamp((frame - 20) / 8) * (1 - clamp((frame - 116) / 12));

  return (
    <AbsoluteFill style={{ opacity: 1 - exit, transform: `translateY(${-70 * exit}px)` }}>
      <BrowserWindow frame={frame} />
      <TangleRope frame={frame} />

      {/* four crossed-out pain stickers, slammed in a 2×2 grid */}
      <div
        style={{
          position: "absolute",
          left: 885,
          top: 730,
          display: "grid",
          gridTemplateColumns: "auto auto",
          columnGap: 26,
          rowGap: 22,
          justifyItems: "start",
        }}
      >
        {COPY.problem.pains.map((pain, index) => (
          <div
            key={pain}
            style={{
              ...stickerSlam(frame, 20 + index * 12, PAIN_ROTATION[index]),
              display: "inline-block",
            }}
          >
            <Sticker
              tone="card"
              size="md"
              icon={<CrossMark size={30} />}
              shadowSize={7}
              style={{ fontSize: 33, padding: "16px 28px" }}
            >
              {pain}
            </Sticker>
          </div>
        ))}
      </div>

      {/* Papa, tied up in the same rope */}
      <div
        style={{
          position: "absolute",
          left: 48,
          bottom: 40,
          transform: `rotate(${shake}deg)`,
          transformOrigin: "52% 86%",
        }}
      >
        <Mascot
          mood="error"
          height={400}
          enterAt={46}
          enterFrom="left"
          bob={7}
          bobPeriod={100}
          sway={0.9}
        />
      </div>

      <div style={{ ...stickerSlam(frame, 64, -1.8), position: "absolute", left: 158, top: 512 }}>
        <Bubble text={COPY.problem.bubble} fontSize={34} tail="down-right" tailOffset={186} rotate={0} />
      </div>

      <div style={{ position: "absolute", left: SAFE, top: 126 }}>
        <SceneTitle
          eyebrow={COPY.problem.eyebrow}
          eyebrowTone="card"
          lines={COPY.problem.titleLines}
          sub={COPY.problem.sub}
          startFrame={4}
          titleSize={80}
          subSize={30}
          width={740}
        />
      </div>

      {/* cursor + little right-click pulses */}
      <ClickPulse frame={frame} at={40} x={1400} y={330} />
      <ClickPulse frame={frame} at={68} x={1148} y={522} />
      <ClickPulse frame={frame} at={104} x={1652} y={330} />
      <div
        style={{
          position: "absolute",
          left: cursorX,
          top: cursorY,
          opacity: cursorOpacity,
          transform: "translate(-4px, -2px)",
        }}
      >
        <CursorIcon size={34} />
      </div>
    </AbsoluteFill>
  );
};
