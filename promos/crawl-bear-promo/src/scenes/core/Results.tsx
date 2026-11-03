import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS, FONTS, INK, RADIUS, shadow } from "../../theme";
import { COPY, MEDIA_ITEMS, type MediaKind } from "../../lib/copy";
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
import { MediaCard, FilterChip, ToggleMark } from "../../components/MediaCard";
import { CircleScribble, PawPrint, Sparkle } from "../../components/Doodles";
import {
  BagIcon,
  CursorIcon,
  EyeIcon,
  FontIcon,
  FolderIcon,
  GlobeIcon,
  ImageIcon,
  MusicIcon,
  VideoIcon,
} from "../../components/Icons";

const DURATION = 240;

/* ------------------------------------------------------------------ *
 * Shared "results page" geometry — Collect continues this exact panel.
 * Panel box: x 160 → 1760, y 230 → 1040 (1600 × 810), padding 40, border 3.
 * Content box: x 203, y 273, 1514 × 724.
 * ------------------------------------------------------------------ */
export const RESULT_PANEL_LAYOUT = {
  panel: {
    left: 160,
    top: 230,
    width: 1600,
    height: 810,
    padding: 40,
    border: INK.regular,
    rotate: -0.3,
  },
  content: { left: 203, top: 273, width: 1514, height: 724 },
  rows: { header: 0, headerHeight: 76, divider: 96, filters: 124, filterHeight: 50, grid: 200 },
  grid: {
    columns: 4,
    cardWidth: 320,
    columnGap: 40,
    rowGap: 26,
    cardHeight: 314,
    /** absolute x of the first card of each column */
    firstCardLeft: 260,
  },
} as const;

const PANEL_LEFT = RESULT_PANEL_LAYOUT.panel.left;
const PANEL_TOP = RESULT_PANEL_LAYOUT.panel.top;
const PANEL_WIDTH = RESULT_PANEL_LAYOUT.panel.width;
const PANEL_HEIGHT = RESULT_PANEL_LAYOUT.panel.height;
const PANEL_PADDING = RESULT_PANEL_LAYOUT.panel.padding;
const PANEL_ROTATE = RESULT_PANEL_LAYOUT.panel.rotate;

const CONTENT_WIDTH = RESULT_PANEL_LAYOUT.content.width;
const CONTENT_HEIGHT = RESULT_PANEL_LAYOUT.content.height;

const HEADER_H = RESULT_PANEL_LAYOUT.rows.headerHeight;
const DIVIDER_Y = RESULT_PANEL_LAYOUT.rows.divider;
const FILTER_Y = RESULT_PANEL_LAYOUT.rows.filters;
const FILTER_H = RESULT_PANEL_LAYOUT.rows.filterHeight;
const GRID_Y = RESULT_PANEL_LAYOUT.rows.grid;

const CARD_W = RESULT_PANEL_LAYOUT.grid.cardWidth;
const CARD_GAP_X = RESULT_PANEL_LAYOUT.grid.columnGap;
const CARD_GAP_Y = RESULT_PANEL_LAYOUT.grid.rowGap;
const CARD_H = RESULT_PANEL_LAYOUT.grid.cardHeight;
const GRID_W = CARD_W * 4 + CARD_GAP_X * 3; // 1400
const GRID_OFFSET_X = (CONTENT_WIDTH - GRID_W) / 2; // 57

const DOTS = "radial-gradient(circle, rgba(51,38,29,0.13) 1.6px, transparent 1.7px)";

const KIND_LABEL: Record<MediaKind, string> = {
  image: "图片",
  video: "视频",
  music: "音乐",
  font: "字体",
};

const FILTER_ICONS: React.ReactNode[] = [
  null,
  <ImageIcon size={22} color={COLORS.ink} strokeWidth={3} />,
  <VideoIcon size={22} color={COLORS.ink} strokeWidth={3} />,
  <MusicIcon size={22} color={COLORS.ink} strokeWidth={3} />,
  <FontIcon size={22} color={COLORS.ink} strokeWidth={3} />,
];

/* ------------------------------------------------------------------ *
 * Preview modal — abstract "mountain-lake" art drawn with tokens only.
 * ------------------------------------------------------------------ */
const PreviewArt: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, background: COLORS.skySoft, overflow: "hidden" }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: DOTS,
        backgroundSize: "24px 24px",
        opacity: 0.6,
      }}
    />
    <div
      style={{
        position: "absolute",
        right: 74,
        top: 46,
        width: 130,
        height: 130,
        borderRadius: "50%",
        background: COLORS.honey,
      }}
    />
    <div
      style={{
        position: "absolute",
        left: -80,
        bottom: 92,
        width: 440,
        height: 310,
        borderRadius: "50%",
        background: COLORS.leafSoft,
      }}
    />
    <div
      style={{
        position: "absolute",
        right: -70,
        bottom: 80,
        width: 380,
        height: 250,
        borderRadius: "50%",
        background: COLORS.leaf,
        opacity: 0.5,
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 44,
        right: 44,
        bottom: 32,
        height: 78,
        borderRadius: 999,
        background: COLORS.sky,
        opacity: 0.55,
      }}
    />
    <PawPrint
      size={62}
      color={COLORS.card}
      rotate={-14}
      style={{ position: "absolute", left: 42, top: 40, opacity: 0.9 }}
    />
  </div>
);

const InfoRow: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    {icon}
    <span
      style={{
        fontFamily: FONTS.mono,
        fontSize: 21,
        color: COLORS.inkSoft,
        letterSpacing: 0.2,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {text}
    </span>
  </div>
);

const PreviewModal: React.FC<{ frame: number; item: (typeof MEDIA_ITEMS)[number] }> = ({
  frame,
  item,
}) => {
  if (frame < 96 || frame > 186) return null;
  const closeT = easeOut(clamp((frame - 168) / 14));
  const opacity = clamp((frame - 96) / 6) * (1 - closeT);
  if (opacity <= 0.01) return null;

  const sp = springAt(frame, 96, SPRINGS.smooth);
  const scale = (0.82 + 0.18 * sp) * (1 - 0.06 * closeT);
  const translateY = (1 - sp) * 24 - closeT * 14;
  const closePressed = 1 - 0.12 * clamp(1 - Math.abs(frame - 166) / 7);

  const metaParts = item.meta.split(" · ");
  const host = metaParts[0] ?? "";
  const dimension = metaParts[1] ?? "";
  const extension = item.name.split(".").pop()?.toUpperCase() ?? "";

  return (
    <>
      <AbsoluteFill
        style={{ background: "rgba(51,38,29,0.16)", opacity: opacity * 0.9 }}
      />
      <div
        style={{
          position: "absolute",
          left: (1920 - 1000) / 2,
          top: (1080 - 620) / 2,
          width: 1000,
          height: 620,
          opacity,
          transform: `translateY(${translateY}px) scale(${scale})`,
        }}
      >
        <InkPanel
          padding={0}
          rotate={-0.35}
          radius={RADIUS.lg}
          shadowSize={14}
          style={{ width: 1000, height: 620, boxSizing: "border-box" }}
        >
          {/* header */}
          <div style={{ position: "absolute", left: 28, top: 24, display: "flex", alignItems: "center", gap: 16 }}>
            <Sticker
              tone="honey"
              size="sm"
              rotate={-2}
              icon={<EyeIcon size={22} color={COLORS.ink} strokeWidth={2.8} />}
            >
              {COPY.results.preview}
            </Sticker>
            <span style={{ fontFamily: FONTS.body, fontSize: 22, color: COLORS.inkSoft }}>
              {COPY.results.pageTitle}
            </span>
          </div>
          <div
            style={{
              position: "absolute",
              right: 26,
              top: 24,
              width: 46,
              height: 46,
              borderRadius: RADIUS.pill,
              background: COLORS.card,
              border: `${INK.regular}px solid ${COLORS.ink}`,
              boxShadow: shadow(4),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${closePressed})`,
            }}
          >
            <div style={{ position: "relative", width: 20, height: 20 }}>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 8.5,
                  width: 20,
                  height: 3,
                  borderRadius: 2,
                  background: COLORS.ink,
                  transform: "rotate(45deg)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 8.5,
                  width: 20,
                  height: 3,
                  borderRadius: 2,
                  background: COLORS.ink,
                  transform: "rotate(-45deg)",
                }}
              />
            </div>
          </div>

          {/* big image */}
          <div
            style={{
              position: "absolute",
              left: 28,
              top: 86,
              width: 560,
              height: 442,
              borderRadius: 20,
              border: `${INK.regular}px solid ${COLORS.ink}`,
              overflow: "hidden",
              background: COLORS.skySoft,
            }}
          >
            <PreviewArt />
            <div style={{ position: "absolute", left: 14, top: 14 }}>
              <Sticker
                tone="card"
                size="sm"
                rotate={-2}
                shadowSize={4}
                icon={<ImageIcon size={20} color={COLORS.ink} strokeWidth={3} />}
              >
                {KIND_LABEL[item.kind]}
              </Sticker>
            </div>
            <div
              style={{
                position: "absolute",
                right: 14,
                bottom: 14,
                padding: "6px 18px",
                borderRadius: 999,
                background: COLORS.card,
                border: `${INK.regular}px solid ${COLORS.ink}`,
                boxShadow: shadow(3),
                fontFamily: FONTS.mono,
                fontSize: 19,
                fontWeight: 700,
                color: COLORS.ink,
              }}
            >
              {dimension}
            </div>
          </div>

          {/* info column */}
          <div
            style={{
              position: "absolute",
              left: 622,
              top: 86,
              width: 344,
              height: 442,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                fontFamily: FONTS.display,
                fontSize: 38,
                fontWeight: 700,
                lineHeight: 1.15,
                color: COLORS.ink,
                letterSpacing: -0.5,
              }}
            >
              {item.name}
            </div>
            <div style={{ marginTop: 10, fontFamily: FONTS.mono, fontSize: 18, letterSpacing: -0.3, color: COLORS.muted, whiteSpace: "nowrap" }}>
              {item.meta}
            </div>
            <div
              style={{
                marginTop: 24,
                marginBottom: 22,
                borderTop: `2px dashed ${COLORS.lineSoft}`,
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <InfoRow
                icon={<GlobeIcon size={24} color={COLORS.inkSoft} strokeWidth={2.6} />}
                text={host}
              />
              <InfoRow
                icon={<ImageIcon size={24} color={COLORS.inkSoft} strokeWidth={2.6} />}
                text={dimension}
              />
              <InfoRow
                icon={<FolderIcon size={24} color={COLORS.inkSoft} strokeWidth={2.6} />}
                text={extension}
              />
            </div>
            <PawPrint
              size={64}
              color={COLORS.furLight}
              rotate={12}
              style={{ position: "absolute", right: 6, bottom: 4, opacity: 0.8 }}
            />
          </div>

          {/* footer path strip */}
          <div
            style={{
              position: "absolute",
              left: 28,
              right: 28,
              top: 552,
              height: 44,
              borderTop: `2px dashed ${COLORS.lineSoft}`,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <FolderIcon size={22} color={COLORS.muted} strokeWidth={2.6} />
            <span style={{ fontFamily: FONTS.mono, fontSize: 20, color: COLORS.muted }}>
              {host}/{item.name}
            </span>
          </div>
        </InkPanel>
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ *
 * Cursor choreography
 * ------------------------------------------------------------------ */
const CLICKS = [
  { at: 96, x: 1500, y: 648 }, // hover → open preview on mountain-lake card
  { at: 166, x: 1409, y: 277 }, // close the preview
  { at: 200, x: 1590, y: 422 }, // tap "全选当前" — bounce only, grid stays unselected
];

const CURSOR_KEYS = [
  { at: 54, x: 1840, y: 960 },
  { at: 90, x: CLICKS[0].x, y: CLICKS[0].y },
  { at: 150, x: CLICKS[1].x, y: CLICKS[1].y },
  { at: 194, x: CLICKS[2].x, y: CLICKS[2].y },
];

const cursorAt = (frame: number): { x: number; y: number } => {
  if (frame <= CURSOR_KEYS[0].at) return { x: CURSOR_KEYS[0].x, y: CURSOR_KEYS[0].y };
  for (let i = 1; i < CURSOR_KEYS.length; i += 1) {
    const from = CURSOR_KEYS[i - 1];
    const to = CURSOR_KEYS[i];
    if (frame <= to.at) {
      const t = easeInOut((frame - from.at) / (to.at - from.at));
      return { x: lerp(from.x, to.x, t), y: lerp(from.y, to.y, t) };
    }
  }
  const last = CURSOR_KEYS[CURSOR_KEYS.length - 1];
  return { x: last.x, y: last.y };
};

const CursorLayer: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < 52) return null;
  const pos = cursorAt(frame);
  const opacity = clamp((frame - 52) / 8);
  const press = Math.max(...CLICKS.map((click) => 1 - clamp(Math.abs(frame - click.at) / 7)));
  const scale = 1 - 0.16 * press;

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: pos.x - 11,
          top: pos.y - 7,
          opacity,
          transform: `scale(${scale})`,
          transformOrigin: "22% 18%",
          filter: "drop-shadow(3px 4px 0 rgba(51,38,29,0.16))",
        }}
      >
        <CursorIcon size={54} color={COLORS.ink} strokeWidth={2.4} />
      </div>
      {CLICKS.map((click) => {
        const t = (frame - click.at) / 11;
        if (t < 0 || t > 1) return null;
        const light = click.at === 200; // just a touch on "全选当前", no state change
        return (
          <div
            key={click.at}
            style={{
              position: "absolute",
              left: click.x - 45,
              top: click.y - 45,
              opacity: (1 - t) * (light ? 0.45 : 0.9),
              transform: `scale(${0.45 + t * (light ? 0.7 : 1.15)})`,
            }}
          >
            <CircleScribble width={90} height={90} color={light ? COLORS.honeyDeep : COLORS.berry} />
          </div>
        );
      })}
    </>
  );
};

/* ------------------------------------------------------------------ *
 * Scene
 * ------------------------------------------------------------------ */
export const Results: React.FC = () => {
  const frame = useCurrentFrame();

  const exit = easeOut(clamp((frame - 218) / 20));
  const panelSp = springAt(frame, 0, SPRINGS.heavy);
  const panelOpacity = clamp(frame / 8);

  const previewItem = MEDIA_ITEMS[3]; // mountain-lake.jpg

  // hover on the fourth card, released as the preview opens
  const hoverP = easeOut(clamp((frame - 80) / 10)) * (1 - easeOut(clamp((frame - 96) / 8)));
  const hoverStickerSpring = springAt(frame, 82, SPRINGS.quick);
  const hoverStickerOpacity = clamp((frame - 82) / 6) * (1 - clamp((frame - 96) / 5));

  // The grid deliberately stays unselected: Collect starts its own 0 → N
  // selection beat, so "全选当前" only gets a touch/hover bounce here.
  const selectTap = frame >= 200 ? 1 - springAt(frame, 200, SPRINGS.bouncy) : 0;

  const dividerP = easeOut(clamp((frame - 16) / 18));
  const headerP = easeOut(clamp((frame - 14) / 10));

  return (
    <AbsoluteFill
      style={{
        opacity: 1 - exit,
        transform: `translateY(${-80 * exit}px)`,
      }}
    >
      {/* title, centred above the panel */}
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
          lines={[COPY.results.title]}
          sub={COPY.results.sub}
          startFrame={4}
          titleSize={84}
          subSize={32}
          width={960}
          subWidth={960}
          align="center"
        />
      </div>

      {/* decorative doodles in the side margins */}
      <Sparkle
        size={38}
        color={COLORS.honey}
        style={{ position: "absolute", left: 86, top: 300, opacity: clamp((frame - 26) / 10) * 0.9 }}
      />
      <PawPrint
        size={32}
        color={COLORS.fur}
        rotate={-14}
        style={{ position: "absolute", left: 92, top: 902, opacity: clamp((frame - 60) / 10) * 0.35 }}
      />
      <PawPrint
        size={26}
        color={COLORS.fur}
        rotate={16}
        style={{ position: "absolute", right: 74, top: 690, opacity: clamp((frame - 76) / 10) * 0.32 }}
      />

      {/* panel + its "翻好了" tab keep one transform for the entrance/exit */}
      <div
        style={{
          position: "absolute",
          left: PANEL_LEFT,
          top: PANEL_TOP,
          opacity: panelOpacity,
          transform: `translateY(${(1 - panelSp) * 110}px)`,
        }}
      >
        <InkPanel
          padding={PANEL_PADDING}
          rotate={PANEL_ROTATE}
          radius={RADIUS.lg}
          shadowSize={12}
          style={{
            width: PANEL_WIDTH,
            height: PANEL_HEIGHT,
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "relative", width: CONTENT_WIDTH, height: CONTENT_HEIGHT, overflow: "hidden" }}>
            {/* 1 · page header */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: CONTENT_WIDTH,
                height: HEADER_H,
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
                  {COPY.results.pageTitle}
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
                  {COPY.results.pageHost}
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
                top: DIVIDER_Y,
                left: 0,
                width: CONTENT_WIDTH,
                borderTop: `2px solid ${COLORS.lineSoft}`,
                transform: `scaleX(${dividerP})`,
                transformOrigin: "0% 50%",
              }}
            />

            {/* 2 · filters + select-all */}
            <div
              style={{
                position: "absolute",
                top: FILTER_Y,
                left: 0,
                width: CONTENT_WIDTH,
                height: FILTER_H,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", gap: 14 }}>
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
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    opacity: clamp((frame - 34) / 10),
                    transform: `translateX(${(1 - springAt(frame, 34, SPRINGS.soft)) * 20}px)`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      transform: `scale(${1 + 0.1 * selectTap})`,
                    }}
                  >
                    <ToggleMark checked={false} size={30} />
                    <span style={{ fontFamily: FONTS.body, fontSize: 25, color: COLORS.inkSoft }}>
                      {COPY.results.selectAll}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 · card grid (second row is clipped by the panel) */}
            <div
              style={{
                position: "absolute",
                top: GRID_Y,
                left: GRID_OFFSET_X,
                width: GRID_W,
              }}
            >
              {MEDIA_ITEMS.map((item, index) => {
                const at = 14 + index * 5;
                const enter = springAt(frame, at, SPRINGS.smooth);
                const col = index % 4;
                const row = Math.floor(index / 4);
                const isHovered = index === 3;
                const lift = isHovered ? hoverP : 0;

                return (
                  <div
                    key={item.name}
                    style={{
                      position: "absolute",
                      left: col * (CARD_W + CARD_GAP_X),
                      top: row * (CARD_H + CARD_GAP_Y),
                      width: CARD_W,
                      opacity: clamp((frame - at) / 8),
                      transform: `translateY(${(1 - enter) * 28}px) scale(${0.96 + 0.04 * enter})`,
                    }}
                  >
                    <div
                      style={{
                        transform: `translateY(${-10 * lift}px) rotate(${-0.6 * lift}deg)`,
                      }}
                    >
                      <div style={{ position: "relative" }}>
                        <MediaCard
                          kind={item.kind}
                          name={item.name}
                          meta={item.meta}
                          tone={item.tone}
                          width={CARD_W}
                          selected={false}
                          shadowSize={Math.round(8 + 5 * lift)}
                        />
                        {isHovered ? (
                          <div
                            style={{
                              position: "absolute",
                              left: "50%",
                              top: 96,
                              opacity: hoverStickerOpacity,
                              transform: `translateX(-50%) scale(${0.6 + 0.4 * hoverStickerSpring})`,
                            }}
                          >
                            <Sticker
                              tone="card"
                              size="sm"
                              rotate={-2}
                              shadowSize={4}
                              icon={<EyeIcon size={20} color={COLORS.ink} strokeWidth={2.8} />}
                            >
                              {COPY.results.preview}
                            </Sticker>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </InkPanel>

        <div style={{ ...stickerSlam(frame, 20, -3), position: "absolute", left: 40, top: -56 }}>
          <Sticker tone="leaf" size="sm" rotate={-3} shadowSize={5}>
            {COPY.results.eyebrow}
          </Sticker>
        </div>
      </div>

      {/* preview modal sits above the panel but under the cursor */}
      <PreviewModal frame={frame} item={previewItem} />
      <CursorLayer frame={frame} />

    </AbsoluteFill>
  );
};

export const RESULTS_DURATION = DURATION;
