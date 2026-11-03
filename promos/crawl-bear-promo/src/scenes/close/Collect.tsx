import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS, FONTS, RADIUS } from "../../theme";
import { COPY } from "../../lib/copy";
import { useCopy, useMediaItems } from "../../lib/variant";
import {
  clamp,
  easeInOut,
  easeOut,
  lerp,
  springAt,
  SPRINGS,
  stickerSlam,
} from "../../lib/anim";
import { InkPanel } from "../../components/InkPanel";
import { SceneTitle } from "../../components/SceneTitle";
import { FilterChip, MediaCard, ToggleMark } from "../../components/MediaCard";
import { BagBar } from "../../components/BagBar";
import { Mascot } from "../../components/Mascot";
import { Bubble } from "../../components/Bubble";
import { Sticker } from "../../components/Sticker";
import {
  BagIcon,
  CursorIcon,
  FontIcon,
  ImageIcon,
  MusicIcon,
  VideoIcon,
} from "../../components/Icons";
import { CircleScribble, PawPrint, Sparkle, StampRing } from "../../components/Doodles";
import { PawConfetti } from "./PawConfetti";
import { RESULT_PANEL_LAYOUT } from "../core/Results";

const DURATION = 210;
const EXIT_AT = 194;

/* ------------------------------------------------------------------ *
 * Results-page geometry — imported from the core Results scene so the cut
 * matches frame for frame: same panel box (x 160 / y 230 / 1600×810),
 * same content origin (203/273), same header / divider / filter / grid rows
 * and the same 4-up card grid (first column x 260, row 1 y 473, row 2 y 813).
 * The sticky collection bag floats over the second card row, exactly like
 * the app's bottom bar floats over the scrolling list.
 * ------------------------------------------------------------------ */

const { panel: PANEL, content: CONTENT, rows: ROWS, grid: GRID } =
  RESULT_PANEL_LAYOUT;

const GRID_W = GRID.cardWidth * GRID.columns + GRID.columnGap * (GRID.columns - 1); // 1400
const GRID_OFFSET_X = (CONTENT.width - GRID_W) / 2; // 57

/** absolute page coordinates */
const CARD_X = (col: number) => CONTENT.left + GRID_OFFSET_X + col * (GRID.cardWidth + GRID.columnGap);
const CARD_Y = (row: number) => CONTENT.top + ROWS.grid + row * (GRID.cardHeight + GRID.rowGap);
const CHECKBOX = (col: number, row = 0) => ({ x: CARD_X(col) + 288, y: CARD_Y(row) + 32 });
/** centre of the green 已收 stamp drawn by MediaCard */
const STAMP_CENTRE = (col: number) => ({ x: CARD_X(col) + 160, y: CARD_Y(0) + 99.8 });
const TOGGLE = { x: 1590, y: 422 };

const BAG = { top: 888, width: 940 } as const;
const CTA = { x: 1276, y: 946 };

const SELECT_AT = [36, 47, 58, 69] as const;
const SELECT_ALL_AT = 85;
const BAG_IN_AT = 54;
const PRESS_AT = 100;
const BEAR_AT = 124;
const BUBBLE_AT = 144;
const STAMP_AT = [122, 132, 142, 152] as const;
const DONE_AT = 160;
const SEAL_AT = 164;

const CLICKS = [
  { at: SELECT_AT[0], ...CHECKBOX(0) },
  { at: SELECT_AT[1], ...CHECKBOX(1) },
  { at: SELECT_AT[2], ...CHECKBOX(2) },
  { at: SELECT_AT[3], ...CHECKBOX(3) },
  { at: SELECT_ALL_AT, ...TOGGLE },
  { at: 102, ...CTA },
] as const;

const CURSOR_PATH = [
  { at: 18, x: 1840, y: 960 },
  { at: 32, ...CHECKBOX(0) },
  { at: 43, ...CHECKBOX(1) },
  { at: 54, ...CHECKBOX(2) },
  { at: 65, ...CHECKBOX(3) },
  { at: 80, ...TOGGLE },
  { at: 98, ...CTA },
] as const;

const FILTER_ICONS: React.ReactNode[] = [
  null,
  <ImageIcon key="image" size={22} color={COLORS.ink} strokeWidth={3} />,
  <VideoIcon key="video" size={22} color={COLORS.ink} strokeWidth={3} />,
  <MusicIcon key="music" size={22} color={COLORS.ink} strokeWidth={3} />,
  <FontIcon key="font" size={22} color={COLORS.ink} strokeWidth={3} />,
];

/** Bell-shaped nudge used when a count changes value. */
const pulseAt = (frame: number, at: number, strength = 0.03, span = 14): number => {
  const s = frame - at;
  if (s < 0 || s >= span) return 0;
  return Math.sin((s / span) * Math.PI) * strength;
};

const cursorAt = (frame: number): { x: number; y: number } => {
  if (frame <= CURSOR_PATH[0].at) return { x: CURSOR_PATH[0].x, y: CURSOR_PATH[0].y };
  for (let i = 0; i < CURSOR_PATH.length - 1; i += 1) {
    const a = CURSOR_PATH[i];
    const b = CURSOR_PATH[i + 1];
    if (frame <= b.at) {
      const t = easeInOut(clamp((frame - a.at) / (b.at - a.at)));
      return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
    }
  }
  const last = CURSOR_PATH[CURSOR_PATH.length - 1];
  return { x: last.x, y: last.y };
};

/* ------------------------------------------------------------------ *
 * The results page (identical language to the core Results scene)
 * ------------------------------------------------------------------ */

const ResultsBoard: React.FC<{ frame: number }> = ({ frame }) => {
  const copy = useCopy();
  const mediaItems = useMediaItems();
  const enter = springAt(frame, 0, SPRINGS.heavy);
  const panelOpacity = clamp(frame / 8);
  const headerP = easeOut(clamp((frame - 14) / 10));
  const dividerP = easeOut(clamp((frame - 16) / 18));

  return (
    <div
      style={{
        position: "absolute",
        left: PANEL.left,
        top: PANEL.top,
        opacity: panelOpacity,
        transform: `translateY(${(1 - enter) * 96}px)`,
      }}
    >
      {/* "挑好就收" tab, the same device Results uses for "翻好了" */}
      <div style={{ ...stickerSlam(frame, 20, -3), position: "absolute", left: 40, top: -56 }}>
        <Sticker tone="honey" size="sm" rotate={-3} shadowSize={5}>
          {COPY.collect.eyebrow}
        </Sticker>
      </div>

      <InkPanel
        padding={PANEL.padding}
        rotate={PANEL.rotate}
        radius={RADIUS.lg}
        shadowSize={12}
        style={{
          width: PANEL.width,
          height: PANEL.height,
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "relative",
            width: CONTENT.width,
            height: CONTENT.height,
            overflow: "hidden",
          }}
        >
          {/* 1 · page header */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: CONTENT.width,
              height: ROWS.headerHeight,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              opacity: headerP,
              transform: `translateX(${(1 - headerP) * -26}px)`,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 40,
                  fontWeight: 700,
                  lineHeight: 1.15,
                  letterSpacing: -0.5,
                  color: COLORS.ink,
                }}
              >
                {copy.results.pageTitle}
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontFamily: FONTS.mono,
                  fontSize: 19,
                  color: COLORS.muted,
                  letterSpacing: 0.3,
                }}
              >
                {copy.results.pageHost}
              </div>
            </div>
            <div style={{ ...stickerSlam(frame, 26, -2), transformOrigin: "100% 50%" }}>
              <Sticker
                tone="honey"
                size="md"
                rotate={-2}
                shadowSize={6}
                icon={<BagIcon size={26} color={COLORS.ink} strokeWidth={2.8} />}
              >
                {COPY.results.badge}
              </Sticker>
            </div>
          </div>

          {/* divider */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: ROWS.divider,
              width: CONTENT.width,
              borderTop: `2px dashed ${COLORS.lineSoft}`,
              transform: `scaleX(${dividerP})`,
              transformOrigin: "0% 50%",
            }}
          />

          {/* 2 · filters + select-all */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: ROWS.filters,
              width: CONTENT.width,
              height: ROWS.filterHeight,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {COPY.results.filters.map((filter, index) => {
                const at = 18 + index * 6;
                const sp = springAt(frame, at, SPRINGS.soft);
                return (
                  <div
                    key={filter.label}
                    style={{
                      opacity: clamp((frame - at) / 8),
                      transform: `translateY(${(1 - sp) * 16}px)`,
                    }}
                  >
                    <FilterChip
                      label={filter.label}
                      value={filter.value}
                      active={index === 0}
                      icon={FILTER_ICONS[index]}
                    />
                  </div>
                );
              })}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                opacity: clamp((frame - 30) / 10),
                transform: `scale(${1 + pulseAt(frame, SELECT_ALL_AT, 0.12, 18)})`,
              }}
            >
              <ToggleMark checked={frame >= SELECT_ALL_AT} size={30} />
              <span style={{ fontFamily: FONTS.body, fontSize: 25, color: COLORS.inkSoft }}>
                {COPY.results.selectAll}
              </span>
            </div>
          </div>

          {/* 3 · card grid (second row peeks above the bag) */}
          <div
            style={{
              position: "absolute",
              left: GRID_OFFSET_X,
              top: ROWS.grid,
              width: GRID_W,
            }}
          >
            {mediaItems.map((item, index) => {
              const col = index % 4;
              const row = Math.floor(index / 4);
              const at = 10 + index * 5;
              const enter = springAt(frame, at, SPRINGS.smooth);
              const selectAt = row === 0 ? SELECT_AT[col] : SELECT_ALL_AT;
              const stampAt = row === 0 ? STAMP_AT[col] : null;
              const selected = frame >= selectAt;
              const stamped = stampAt !== null && frame >= stampAt;

              // pop when the tick lands
              const sinceSelect = frame - selectAt;
              const selectBump =
                sinceSelect < 0 ? 0 : Math.sin(Math.PI * clamp(sinceSelect / 18)) * 0.026;
              const wobble = sinceSelect < 0 ? 0 : Math.sin(Math.PI * clamp(sinceSelect / 20)) * 0.4;
              // rubber-thump when the 已收 stamp lands
              const sinceStamp = stampAt === null ? -1 : frame - stampAt;
              const stampJolt =
                sinceStamp < 0
                  ? 0
                  : Math.sin((sinceStamp / 16) * Math.PI * 2.4) * Math.exp(-sinceStamp / 7) * 0.028;

              return (
                <div
                  key={item.name}
                  style={{
                    position: "absolute",
                    left: col * (GRID.cardWidth + GRID.columnGap),
                    top: row * (GRID.cardHeight + GRID.rowGap),
                    width: GRID.cardWidth,
                    opacity: clamp((frame - at) / 8),
                    transform: `translateY(${(1 - enter) * 28}px) scale(${
                      (0.96 + 0.04 * enter) * (1 + selectBump + stampJolt)
                    }) rotate(${selected ? -wobble : 0}deg)`,
                    transformOrigin: "50% 88%",
                    zIndex: selected ? 2 : 1,
                  }}
                >
                  <MediaCard
                    kind={item.kind}
                    name={item.name}
                    meta={item.meta}
                    tone={item.tone}
                    width={GRID.cardWidth}
                    selected={selected}
                    stamped={stamped}
                  />
                </div>
              );
            })}
          </div>

          {/* leaf shockwave as each 已收 stamp lands */}
          {STAMP_AT.map((at, col) => {
            const t = clamp((frame - at) / 14);
            if (frame < at || t >= 1) return null;
            const centre = STAMP_CENTRE(col);
            const size = 46 + 92 * easeOut(t);
            return (
              <div
                key={`ring-${col}`}
                style={{
                  position: "absolute",
                  left: centre.x - CONTENT.left - size / 2,
                  top: centre.y - CONTENT.top - size / 2,
                  width: size,
                  height: size,
                  borderRadius: "50% 48% 52% 46%",
                  border: `4px solid ${COLORS.leaf}`,
                  opacity: 0.7 * (1 - t),
                  transform: "rotate(-12deg)",
                }}
              />
            );
          })}
        </div>
      </InkPanel>
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * Scene
 * ------------------------------------------------------------------ */

/**
 * Scene 6 · Collect — "勾选，收进采集袋。"
 * Picks the results page up where Results left it, ticks the cards, presses
 * download, stamps them 已收, drops paw confetti and settles into the bag's
 * completed state (toast + Finder path + seal).
 */
export const Collect: React.FC = () => {
  const frame = useCurrentFrame();
  const copy = useCopy();
  const mediaItems = useMediaItems();

  const exit = easeOut(clamp((frame - EXIT_AT) / (DURATION - EXIT_AT)));

  // --- selection counter --------------------------------------------
  const selectedCount =
    frame >= SELECT_ALL_AT
      ? 8
      : frame >= SELECT_AT[3]
        ? 4
        : frame >= SELECT_AT[2]
          ? 3
          : frame >= SELECT_AT[1]
            ? 2
            : frame >= SELECT_AT[0]
              ? 1
              : 0;

  // --- bag entrance / value changes ---------------------------------
  const bagIn = springAt(frame, BAG_IN_AT, SPRINGS.heavy);
  const bagOpacity = clamp((frame - BAG_IN_AT + 4) / 7);
  const bagPulse =
    pulseAt(frame, SELECT_AT[2], 0.024) +
    pulseAt(frame, SELECT_AT[3], 0.03) +
    pulseAt(frame, SELECT_ALL_AT, 0.05, 18) +
    pulseAt(frame, DONE_AT, 0.045, 18);

  // --- button press being held ---------------------------------------
  const press =
    clamp((frame - PRESS_AT) / 5) * 0.9 * (1 - clamp((frame - (PRESS_AT + 10)) / 6));

  // --- cursor ---------------------------------------------------------
  const pos = cursorAt(frame);
  const clickDip = Math.max(...CLICKS.map((click) => clamp(1 - Math.abs(frame - click.at) / 5)));
  const cursorOpacity = clamp((frame - 18) / 8) * (1 - clamp((frame - 126) / 14));

  const done = frame >= DONE_AT;

  // bear pops up (scale, no opacity fade) so it never looks like it is
  // showing through the results panel
  const bearIn = springAt(frame, BEAR_AT, SPRINGS.bouncy);

  return (
    <AbsoluteFill
      style={{
        opacity: 1 - exit,
        transform: `translateY(${-80 * exit}px)`,
      }}
    >
      {/* title, centred above the panel (same header as Results) */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 26,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <SceneTitle
          lines={[COPY.collect.title]}
          sub={COPY.collect.sub}
          startFrame={4}
          titleSize={84}
          subSize={32}
          width={960}
          subWidth={960}
          align="center"
        />
      </div>

      {/* margin doodles, echoing the Results scene */}
      <Sparkle
        size={36}
        color={COLORS.honey}
        style={{ position: "absolute", left: 84, top: 306, opacity: clamp((frame - 26) / 10) * 0.9 }}
      />
      <PawPrint
        size={30}
        color={COLORS.fur}
        rotate={-14}
        style={{ position: "absolute", left: 94, top: 900, opacity: clamp((frame - 40) / 10) * 0.35 }}
      />
      <PawPrint
        size={26}
        color={COLORS.fur}
        rotate={16}
        style={{ position: "absolute", right: 40, top: 360, opacity: clamp((frame - 56) / 10) * 0.32 }}
      />

      <ResultsBoard frame={frame} />

      {/* berry click ripple on the primary button */}
      {[0, 7].map((delay, index) => {
        const t = clamp((frame - 102 - delay) / 26);
        if (t <= 0 || t >= 1) return null;
        const size = 60 + (190 + index * 70) * easeOut(t);
        return (
          <div
            key={delay}
            style={{
              position: "absolute",
              left: CTA.x - size / 2,
              top: CTA.y - size / 2,
              width: size,
              height: size,
              borderRadius: "50%",
              border: `${Math.max(1, 4 - t * 3)}px solid ${COLORS.berry}`,
              opacity: 0.65 * (1 - t),
              zIndex: 6,
            }}
          />
        );
      })}

      {/* sticky collection bag, docked over the page bottom */}
      <div
        style={{
          position: "absolute",
          left: 960,
          top: BAG.top,
          opacity: bagOpacity,
          transform: `translateX(-50%) translateY(${(1 - bagIn) * 210}px) scale(${
            (0.94 + 0.06 * Math.min(1, bagIn)) * (1 + bagPulse - press * 0.01)
          })`,
          transformOrigin: "50% 50%",
          zIndex: 5,
        }}
      >
        <BagBar selected={selectedCount} width={BAG.width} press={press} done={done} path={copy.collect.path} />
      </div>

      {/* 收好 seal stamped across the bag's top-left corner */}
      <div
        style={{
          position: "absolute",
          left: 494,
          top: 800,
          zIndex: 8,
          ...stickerSlam(frame, SEAL_AT, -10),
        }}
      >
        <StampRing label="收好" size={108} color={COLORS.leaf} rotate={0} opacity={0.95} />
      </div>

      {/* the bear pops up in the bottom-right corner, fully on top of the page */}
      <div
        style={{
          position: "absolute",
          right: 16,
          bottom: 12,
          zIndex: 10,
          transform: `translateY(${(1 - Math.min(1, bearIn)) * 28}px) scale(${Math.min(1.12, bearIn)})`,
          transformOrigin: "50% 100%",
        }}
      >
        <Mascot
          mood="happy"
          height={320}
          bob={6}
          bobPeriod={108}
          sway={1.2}
          style={{ position: "relative" }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          right: 37,
          top: 655,
          zIndex: 11,
          ...stickerSlam(frame, BUBBLE_AT, -2),
        }}
      >
        <Bubble
          text={COPY.outro.bubble}
          fontSize={34}
          tail="down-left"
          tailOffset={45}
          rotate={0}
        />
      </div>

      {/* nine paw-print confetti tumble out of the bag */}
      <div style={{ position: "absolute", inset: 0, zIndex: 9, pointerEvents: "none" }}>
        <PawConfetti
          frame={frame}
          startFrame={142}
          count={9}
          originX={960}
          originY={876}
          spread={330}
          fall={200}
          duration={48}
          seed={23}
        />
      </div>

      {/* cursor + hand-drawn click marks */}
      {CLICKS.slice(0, 5).map((click) => {
        const t = (frame - click.at) / 11;
        if (t < 0 || t > 1) return null;
        return (
          <div
            key={click.at}
            style={{
              position: "absolute",
              left: click.x - 45,
              top: click.y - 45,
              opacity: (1 - t) * 0.9,
              transform: `scale(${0.45 + t * 1.15})`,
              zIndex: 20,
            }}
          >
            <CircleScribble width={90} height={90} color={COLORS.berry} />
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: pos.x - 11,
          top: pos.y - 7,
          zIndex: 21,
          opacity: cursorOpacity,
          transform: `scale(${1 - 0.16 * clickDip})`,
          transformOrigin: "22% 18%",
          filter: "drop-shadow(3px 4px 0 rgba(51,38,29,0.16))",
        }}
      >
        <CursorIcon size={54} color={COLORS.ink} strokeWidth={2.4} />
      </div>
    </AbsoluteFill>
  );
};

export const COLLECT_DURATION = DURATION;
