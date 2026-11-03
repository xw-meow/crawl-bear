import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS, FONTS, INK, RADIUS } from "../../theme";
import { COPY, MEDIA_ITEMS, type MediaKind } from "../../lib/copy";
import {
  clamp,
  countUp,
  easeInOut,
  easeOut,
  float,
  lerp,
  seededRange,
  springAt,
  SPRINGS,
  stickerSlam,
} from "../../lib/anim";
import { SceneTitle } from "../../components/SceneTitle";
import { InkPanel } from "../../components/InkPanel";
import { Sticker } from "../../components/Sticker";
import { ProgressHoney } from "../../components/ProgressHoney";
import { Mascot } from "../../components/Mascot";
import { Bubble } from "../../components/Bubble";
import { PawPrint, Sparkle } from "../../components/Doodles";
import {
  CheckIcon,
  FontIcon,
  GlobeIcon,
  ImageIcon,
  MusicIcon,
  SparkIcon,
  VideoIcon,
} from "../../components/Icons";

const DURATION = 240;

/**
 * The copy file only ships a single crawl headline; split it into two written
 * lines so the title stays inside the left column (see BRIEF §7: local copy
 * derivations are allowed, the string itself comes from COPY).
 */
const TITLE_LINES = COPY.crawl.title.split("，").map((part, index, all) =>
  index < all.length - 1 ? `${part}，` : part,
);

/** App status label while crawling (mirrors the real app's "翻找中…" button). */
const RUNNING_LABEL = "翻找中…";

/* ------------------------------------------------------------------ *
 * Panel geometry — fixed so the next scene's panel can line up.
 * Panel box: x 920 → 1800, y 300 → 892, padding 40, border 3.
 * Content box: x 963, width 794, rows measured from content top y 343.
 * ------------------------------------------------------------------ */
const PANEL_LEFT = 920;
const PANEL_TOP = 300;
const PANEL_WIDTH = 880;
const PANEL_PADDING = 40;
const PANEL_ROTATE = 0.5;
const CONTENT_LEFT = PANEL_LEFT + INK.regular + PANEL_PADDING; // 963
const CONTENT_TOP = PANEL_TOP + INK.regular + PANEL_PADDING; // 343
const CONTENT_WIDTH = PANEL_WIDTH - 2 * (INK.regular + PANEL_PADDING); // 794

const ROW1_H = 56;
const ROW1_GAP = 30;
const ROW2_H = 46;
const ROW2_GAP = 30;
const BAR_H = 86;
const BAR_GAP = 44;
const COUNTER_H = 140;
const COUNTER_GAP_X = 16;
const COUNTER_GAP_Y = 30;
const TICKER_H = 44;

const ROW1_TOP = 0;
const ROW2_TOP = ROW1_TOP + ROW1_H + ROW1_GAP; // 86
const BAR_TOP = ROW2_TOP + ROW2_H + ROW2_GAP; // 162
const COUNTERS_TOP = BAR_TOP + BAR_H + BAR_GAP; // 292
const TICKER_TOP = COUNTERS_TOP + COUNTER_H + COUNTER_GAP_Y; // 462
const CONTENT_HEIGHT = TICKER_TOP + TICKER_H; // 506
const PANEL_HEIGHT =
  CONTENT_HEIGHT + 2 * (INK.regular + PANEL_PADDING); // 592

const COUNTER_W = (CONTENT_WIDTH - COUNTER_GAP_X * 3) / 4; // 186.5
const counterX = (index: number) => CONTENT_LEFT + index * (COUNTER_W + COUNTER_GAP_X);

/** Absolute y of the counter row centre — flight targets land on it. */
const COUNTERS_CENTER_Y = CONTENT_TOP + COUNTERS_TOP + COUNTER_H / 2; // 705

/* ------------------------------------------------------------------ *
 * Kinds
 * ------------------------------------------------------------------ */
type IconComponent = React.FC<{ size?: number; color?: string; strokeWidth?: number }>;

const KIND_META: Record<MediaKind, { color: string; Icon: IconComponent }> = {
  image: { color: COLORS.leaf, Icon: ImageIcon },
  video: { color: COLORS.sky, Icon: VideoIcon },
  music: { color: COLORS.berry, Icon: MusicIcon },
  font: { color: COLORS.fur, Icon: FontIcon },
};

const COUNTER_KINDS: readonly MediaKind[] = ["image", "video", "music", "font"];

type CounterDef = {
  label: string;
  value: number;
  kind: MediaKind;
  start: number;
  duration: number;
};

const COUNTERS: CounterDef[] = COPY.crawl.counters.map((counter, index) => ({
  label: counter.label,
  value: counter.value,
  kind: COUNTER_KINDS[index],
  start: 58 + index * 10,
  duration: 112 - index * 8,
}));

/* ------------------------------------------------------------------ *
 * Progress — eased hops with little holds, so it reads as "work", not a
 * constant-speed bar (spec: 0 → 1 between frame 24 and 190).
 * ------------------------------------------------------------------ */
const PROGRESS_STOPS: ReadonlyArray<readonly [number, number]> = [
  [24, 0],
  [36, 0.045],
  [48, 0.1],
  [56, 0.155],
  [68, 0.2],
  [78, 0.29],
  [88, 0.34],
  [96, 0.4],
  [108, 0.46],
  [116, 0.52],
  [128, 0.61],
  [140, 0.68],
  [152, 0.76],
  [164, 0.84],
  [172, 0.9],
  [180, 0.955],
  [190, 1],
];

const progressAt = (frame: number): number => {
  if (frame <= PROGRESS_STOPS[0][0]) return 0;
  for (let i = 1; i < PROGRESS_STOPS.length; i += 1) {
    const [fromFrame, fromValue] = PROGRESS_STOPS[i - 1];
    const [toFrame, toValue] = PROGRESS_STOPS[i];
    if (frame < toFrame) {
      return lerp(fromValue, toValue, easeInOut((frame - fromFrame) / (toFrame - fromFrame)));
    }
  }
  return 1;
};

/* ------------------------------------------------------------------ *
 * Status line — COPY.crawl.status cycles roughly every 48 frames.
 * ------------------------------------------------------------------ */
const STATUS_STARTS = [20, 68, 116, 164] as const;
const DONE_AT = 190;

const StatusLine: React.FC<{ frame: number }> = ({ frame }) => {
  const doneT = easeOut(clamp((frame - DONE_AT - 4) / 8));

  return (
    <div style={{ position: "relative", width: 430, height: ROW2_H }}>
      {COPY.crawl.status.map((text, index) => {
        const enter = STATUS_STARTS[index];
        const enterAt = index === 0 ? enter : enter + 4;
        const leave =
          index + 1 < STATUS_STARTS.length ? STATUS_STARTS[index + 1] : DONE_AT;
        const enterT = easeOut(clamp((frame - enterAt) / 6));
        const exitT = 1 - easeOut(clamp((frame - leave) / 4));
        const opacity = Math.min(enterT, exitT);
        if (frame < enterAt || opacity <= 0.01) return null;
        return (
          <div
            key={text}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              gap: 12,
              opacity,
              transform: `translateY(${(1 - enterT) * 12 - (1 - exitT) * 10}px)`,
            }}
          >
            <SparkIcon
              size={24}
              color={COLORS.honeyDeep}
              strokeWidth={3}
              style={{ transform: `rotate(${float(frame, 14, 46, index)}deg)` }}
            />
            <span
              style={{
                fontFamily: FONTS.display,
                fontSize: 34,
                fontWeight: 700,
                color: COLORS.ink,
                letterSpacing: 0.5,
                whiteSpace: "nowrap",
              }}
            >
              {text}
            </span>
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          gap: 12,
          opacity: doneT,
          transform: `translateY(${(1 - doneT) * 12}px)`,
        }}
      >
        <CheckIcon size={26} color={COLORS.leaf} strokeWidth={4} />
        <span
          style={{
            fontFamily: FONTS.display,
            fontSize: 34,
            fontWeight: 700,
            color: COLORS.leaf,
            letterSpacing: 0.5,
          }}
        >
          {COPY.crawl.done}
        </span>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * Flying media chips — deterministic quadratic arcs from the paper pile
 * (left) into the panel's counter row.
 * ------------------------------------------------------------------ */
type Vec = { x: number; y: number };

type Flight = {
  index: number;
  name: string;
  kind: MediaKind;
  start: number;
  duration: number;
  landing: number;
  p0: Vec;
  p1: Vec;
  p2: Vec;
  rot0: number;
  rot1: number;
  counter: number;
};

const COUNTER_INDEX: Record<MediaKind, number> = {
  image: 0,
  video: 1,
  music: 2,
  font: 3,
};

const bezierAxis = (from: number, control: number, to: number, t: number): number =>
  (1 - t) * (1 - t) * from + 2 * (1 - t) * t * control + t * t * to;

/** First t at which the arc crosses x = targetX — the frame the panel swallows it. */
const bezierCrossing = (p0: Vec, p1: Vec, p2: Vec, targetX: number): number => {
  for (let t = 0; t <= 1; t += 0.002) {
    if (bezierAxis(p0.x, p1.x, p2.x, t) >= targetX) return t;
  }
  return 1;
};

const FLIGHTS: Flight[] = MEDIA_ITEMS.map((item, index) => {
  const start = 44 + index * 13;
  const duration = 34 + Math.round(seededRange(index * 5 + 3, 0, 9));
  const fromRight = index % 2 === 0;
  const kindIndex = COUNTER_INDEX[item.kind];
  const p0: Vec = {
    x: fromRight
      ? seededRange(index * 7 + 1, 470, 700)
      : seededRange(index * 7 + 1, 150, 430),
    y: fromRight
      ? seededRange(index * 11 + 2, 870, 990)
      : seededRange(index * 11 + 2, 950, 1030),
  };
  // the chip's real destination is the counter card; the panel edge hides the last leg
  const p2: Vec = {
    x: counterX(kindIndex) + COUNTER_W / 2,
    y: COUNTERS_CENTER_Y + seededRange(index * 13 + 4, -18, 18),
  };
  const p1: Vec = {
    x: (p0.x + p2.x) / 2 + seededRange(index * 17 + 5, -40, 40),
    y: Math.min(p0.y, p2.y) - seededRange(index * 19 + 6, 20, 80),
  };
  const crossing = bezierCrossing(p0, p1, p2, PANEL_LEFT + 38);
  return {
    index,
    name: item.name,
    kind: item.kind,
    start,
    duration,
    landing: start + Math.round(crossing * duration),
    p0,
    p1,
    p2,
    rot0: seededRange(index * 23 + 8, -22, 22),
    rot1: seededRange(index * 29 + 9, -8, 8),
    counter: kindIndex,
  };
});

const FlightChip: React.FC<{ flight: Flight; frame: number }> = ({ flight, frame }) => {
  if (frame < flight.start || frame > flight.start + flight.duration) return null;
  const t = clamp((frame - flight.start) / flight.duration);
  const appear = clamp((frame - flight.start) / 5);
  if (appear <= 0.01) return null;

  const x = bezierAxis(flight.p0.x, flight.p1.x, flight.p2.x, t);
  const y = bezierAxis(flight.p0.y, flight.p1.y, flight.p2.y, t);
  const scale = easeOut(appear);
  const rotate = lerp(flight.rot0, flight.rot1, easeOut(t));
  const meta = KIND_META[flight.kind];
  const Icon = meta.Icon;

  return (
    <div
      style={{
        position: "absolute",
        left: x - 36,
        top: y - 36,
        opacity: appear,
        transform: `scale(${scale}) rotate(${rotate}deg)`,
      }}
    >
      <Sticker
        tone="card"
        size="md"
        shadowSize={6}
        style={{ padding: 15, gap: 0, borderRadius: RADIUS.pill }}
        icon={<Icon size={36} color={meta.color} strokeWidth={3} />}
      />
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * Counter cards
 * ------------------------------------------------------------------ */
const CounterCard: React.FC<{ counter: CounterDef; frame: number }> = ({ counter, frame }) => {
  const meta = KIND_META[counter.kind];
  const Icon = meta.Icon;
  const doneAt = counter.start + counter.duration;
  const done = frame >= doneAt;
  const value = countUp(frame, 0, counter.value, counter.start, counter.duration);
  const checkPop = done ? springAt(frame, doneAt, SPRINGS.bouncy) : 0;

  const counterIndex = COUNTER_INDEX[counter.kind];
  let lastLanding = -999;
  for (const flight of FLIGHTS) {
    if (flight.counter === counterIndex && flight.landing <= frame) {
      lastLanding = Math.max(lastLanding, flight.landing);
    }
  }
  const bump =
    frame - lastLanding < 20
      ? 1 + 0.1 * (1 - springAt(frame, lastLanding, SPRINGS.bouncy))
      : 1;

  return (
    <div
      style={{
        width: COUNTER_W,
        height: COUNTER_H,
        background: done ? COLORS.leafSoft : COLORS.paper,
        border: `2px dashed ${done ? COLORS.leaf : COLORS.lineSoft}`,
        borderRadius: RADIUS.sm,
        padding: "14px 15px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transform: `scale(${bump})`,
        position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <Icon size={28} color={meta.color} strokeWidth={3} />
        <span
          style={{
            fontFamily: FONTS.body,
            fontSize: 23,
            fontWeight: 600,
            color: COLORS.inkSoft,
            letterSpacing: 1,
          }}
        >
          {counter.label}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <span
          style={{
            fontFamily: FONTS.mono,
            fontSize: 50,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: -1,
            color: COLORS.ink,
          }}
        >
          {value}
        </span>
        <div
          style={{
            opacity: done ? clamp((frame - doneAt) / 5) : 0,
            transform: `scale(${0.4 + 0.6 * checkPop})`,
            marginBottom: 2,
          }}
        >
          <CheckIcon size={26} color={COLORS.leaf} strokeWidth={4.2} />
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * Small helpers
 * ------------------------------------------------------------------ */
const RowEntrance: React.FC<{
  frame: number;
  at: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ frame, at, style, children }) => {
  const sp = springAt(frame, at, SPRINGS.smooth);
  return (
    <div
      style={{
        opacity: clamp((frame - at) / 8),
        transform: `translateY(${(1 - sp) * 18}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * Scene
 * ------------------------------------------------------------------ */
export const Crawl: React.FC = () => {
  const frame = useCurrentFrame();

  const exit = easeOut(clamp((frame - 216) / 22));
  const panelIn = springAt(frame, 0, SPRINGS.heavy);
  const progress = progressAt(frame);
  const doneEase = easeOut(clamp((frame - DONE_AT) / 8));
  const doneSpring = Math.min(1.15, springAt(frame, DONE_AT, SPRINGS.bouncy));
  const totalFound = COUNTERS.reduce(
    (sum, counter) =>
      sum + countUp(frame, 0, counter.value, counter.start, counter.duration),
    0,
  );

  const latest = FLIGHTS.reduce<Flight | null>((acc, flight) => {
    if (flight.landing > frame) return acc;
    if (!acc || flight.landing >= acc.landing) return flight;
    return acc;
  }, null);

  return (
    <AbsoluteFill
      style={{
        opacity: 1 - exit,
        transform: `translateY(${-70 * exit}px)`,
      }}
    >
      {/* 1 · scene title, left column */}
      <div style={{ position: "absolute", left: 120, top: 84 }}>
        <SceneTitle
          eyebrow={COPY.crawl.eyebrow}
          eyebrowTone="honey"
          lines={TITLE_LINES}
          sub={COPY.crawl.sub}
          startFrame={6}
          titleSize={86}
          subSize={30}
          width={760}
          subWidth={800}
          highlightLast
          lineGap={2}
        />
      </div>

      {/* 2 · the bear, digging through the paper pile */}
      <Mascot
        mood="crawl"
        height={560}
        enterAt={18}
        enterFrom="bottom"
        bob={8}
        bobPeriod={120}
        sway={1.2}
        style={{ position: "absolute", left: 90, bottom: -10 }}
      />

      {/* 4 · speech bubble above the bear's head */}
      <div
        style={{
          ...stickerSlam(frame, 76, 0),
          position: "absolute",
          left: 335,
          top: 492,
        }}
      >
        <Bubble text={COPY.crawl.bubble} fontSize={34} tail="down" rotate={-1.5} />
      </div>

      {/* 5 · magnetic media chips flying into the console — mounted under the
          panel so the panel edge swallows the last leg of each arc */}
      {FLIGHTS.map((flight) => (
        <FlightChip key={flight.index} flight={flight} frame={frame} />
      ))}

      {/* 6 · the scan console panel (fixed box: x 920, y 300, 880 × 592) */}
      <div
        style={{
          position: "absolute",
          left: PANEL_LEFT,
          top: PANEL_TOP,
          opacity: clamp(frame / 8),
          transform: `translate(${(1 - panelIn) * 70}px, ${(1 - panelIn) * 110}px)`,
        }}
      >
        <InkPanel
          padding={PANEL_PADDING}
          rotate={PANEL_ROTATE}
          radius={RADIUS.lg}
          shadowSize={10}
          style={{
            width: PANEL_WIDTH,
            height: PANEL_HEIGHT,
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "relative", width: CONTENT_WIDTH, height: CONTENT_HEIGHT }}>
            {/* status row: app status pill + the page being crawled */}
            <RowEntrance
              frame={frame}
              at={22}
              style={{
                position: "absolute",
                top: ROW1_TOP,
                left: 0,
                width: CONTENT_WIDTH,
                height: ROW1_H,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ position: "relative", width: 196, height: ROW1_H }}>
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 5,
                    opacity: 1 - doneEase,
                    transform: `scale(${1 - 0.12 * doneEase})`,
                  }}
                >
                  <Sticker
                    tone="honey"
                    size="sm"
                    rotate={-2}
                    icon={<SparkIcon size={22} color={COLORS.ink} strokeWidth={2.6} />}
                  >
                    {RUNNING_LABEL}
                  </Sticker>
                </div>
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 5,
                    opacity: doneEase,
                    transform: `scale(${0.72 + 0.28 * doneSpring})`,
                  }}
                >
                  <Sticker
                    tone="leaf"
                    size="sm"
                    rotate={-2}
                    icon={<CheckIcon size={22} color={COLORS.ink} strokeWidth={3.4} />}
                  >
                    {COPY.crawl.done}
                  </Sticker>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <GlobeIcon size={26} color={COLORS.inkSoft} strokeWidth={2.6} />
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 26,
                    color: COLORS.inkSoft,
                    letterSpacing: 0.5,
                  }}
                >
                  {COPY.paste.url}
                </span>
              </div>
            </RowEntrance>

            {/* status line + running total */}
            <RowEntrance
              frame={frame}
              at={28}
              style={{
                position: "absolute",
                top: ROW2_TOP,
                left: 0,
                width: CONTENT_WIDTH,
                height: ROW2_H,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <StatusLine frame={frame} />
              <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 40,
                    fontWeight: 700,
                    color: COLORS.ink,
                    lineHeight: 1,
                  }}
                >
                  {totalFound}
                </span>
                <span style={{ fontFamily: FONTS.body, fontSize: 22, color: COLORS.muted }}>
                  {COPY.collect.bagUnit}
                </span>
              </div>
            </RowEntrance>

            {/* honey progress */}
            <RowEntrance
              frame={frame}
              at={26}
              style={{ position: "absolute", top: BAR_TOP, left: 0, width: CONTENT_WIDTH }}
            >
              <ProgressHoney width={CONTENT_WIDTH} height={BAR_H} progress={progress} />
            </RowEntrance>

            {/* per-kind counters */}
            <div
              style={{
                position: "absolute",
                top: COUNTERS_TOP,
                left: 0,
                display: "flex",
                gap: COUNTER_GAP_X,
              }}
            >
              {COUNTERS.map((counter, index) => (
                <RowEntrance key={counter.label} frame={frame} at={34 + index * 8}>
                  <CounterCard counter={counter} frame={frame} />
                </RowEntrance>
              ))}
            </div>

            {/* latest catch ticker */}
            <div
              style={{
                position: "absolute",
                top: TICKER_TOP,
                left: 0,
                width: CONTENT_WIDTH,
                height: TICKER_H,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -14,
                  left: 0,
                  right: 0,
                  borderTop: `2px dashed ${COLORS.lineSoft}`,
                  opacity: clamp((frame - 40) / 10) * 0.9,
                }}
              />
              <RowEntrance
                frame={frame}
                at={42}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  height: TICKER_H,
                }}
              >
                <PawPrint size={20} color={COLORS.fur} rotate={-12} />
                {latest ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      opacity: clamp((frame - latest.landing) / 5),
                      transform: `translateY(${(1 - easeOut(clamp((frame - latest.landing) / 8))) * 10}px)`,
                    }}
                  >
                    {(() => {
                      const meta = KIND_META[latest.kind];
                      const Icon = meta.Icon;
                      return <Icon size={24} color={meta.color} strokeWidth={3} />;
                    })()}
                    <span
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: 24,
                        color: COLORS.inkSoft,
                        letterSpacing: 0.3,
                      }}
                    >
                      {latest.name}
                    </span>
                    <CheckIcon size={19} color={COLORS.leaf} strokeWidth={4} />
                  </div>
                ) : (
                  <span style={{ fontFamily: FONTS.body, fontSize: 24, color: COLORS.muted }}>
                    ···
                  </span>
                )}
              </RowEntrance>
            </div>
          </div>
        </InkPanel>
      </div>

      {/* 7 · celebration burst on the completed progress bar (no stamp: the
          leaf chip + "翻好了" status line already carry the success state) */}
      {[0, 1, 2, 3].map((index) => {
        const at = 192 + index * 4;
        const p = springAt(frame, at, SPRINGS.bouncy);
        return (
          <Sparkle
            key={index}
            size={22 + (index % 3) * 8}
            color={index === 1 ? COLORS.berry : COLORS.honey}
            style={{
              position: "absolute",
              left: 1120 + seededRange(index * 31 + 7, 0, 470),
              top: 492 + seededRange(index * 37 + 11, 0, 150),
              opacity: clamp((frame - at) / 6),
              transform: `scale(${0.4 + 0.6 * p})`,
            }}
          />
        );
      })}

      {/* 8 · ambient doodles */}
      <Sparkle
        size={44}
        color={COLORS.honey}
        style={{ position: "absolute", left: 96, top: 210, opacity: clamp((frame - 34) / 10) }}
      />
      <Sparkle
        size={26}
        color={COLORS.berry}
        style={{
          position: "absolute",
          left: 856,
          top: 372,
          opacity: clamp((frame - 92) / 10) * 0.85,
          transform: `scale(${0.9 + float(frame, 0.1, 90)})`,
        }}
      />
      <PawPrint
        size={30}
        color={COLORS.fur}
        rotate={-18}
        style={{ position: "absolute", left: 780, top: 964, opacity: clamp((frame - 74) / 10) * 0.4 }}
      />
      <PawPrint
        size={22}
        color={COLORS.fur}
        rotate={12}
        style={{ position: "absolute", left: 838, top: 1008, opacity: clamp((frame - 92) / 10) * 0.32 }}
      />

    </AbsoluteFill>
  );
};

export const CRAWL_DURATION = DURATION;
