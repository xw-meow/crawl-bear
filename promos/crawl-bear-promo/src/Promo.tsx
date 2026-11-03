import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { COLORS, DURATION, SCENES, sceneStart, type SceneId } from "./theme";
import { PaperBackground } from "./components/PaperBackground";
import { FontLoader } from "./components/FontLoader";
import { PawPrint } from "./components/Doodles";
import { PromoAudio } from "./audio/PromoAudio";
import { fadeIn, fadeOut } from "./lib/anim";

import { Hook } from "./scenes/Hook";
import { Problem } from "./scenes/open/Problem";
import { Paste } from "./scenes/open/Paste";
import { Sites } from "./scenes/open/Sites";
import { Crawl } from "./scenes/core/Crawl";
import { Results } from "./scenes/core/Results";
import { Collect } from "./scenes/close/Collect";
import { Privacy } from "./scenes/close/Privacy";
import { Outro } from "./scenes/close/Outro";

const SCENE_COMPONENTS: Record<SceneId, React.FC> = {
  hook: Hook,
  problem: Problem,
  paste: Paste,
  crawl: Crawl,
  results: Results,
  collect: Collect,
  sites: Sites,
  privacy: Privacy,
  outro: Outro,
};

/** Bottom paw-print chapter markers — the film's gentle progress indicator. */
const ChapterPaws: React.FC<{ frame: number }> = ({ frame }) => {
  let cursor = 0;
  const activeIndex = SCENES.findIndex((scene) => {
    const inside = frame >= cursor && frame < cursor + scene.duration;
    cursor += scene.duration;
    return inside;
  });
  // The results / collect scenes run a full-bleed panel down to y=1040, so the
  // paw markers step aside for those two scenes instead of sitting on the cards.
  const resultsIn = sceneStart("results") - 6;
  const collectEnd = sceneStart("collect") + 210;
  const blocked = Math.min(fadeIn(frame, resultsIn, 10), 1 - fadeIn(frame, collectEnd - 8, 10));

  const visibility = Math.min(
    fadeIn(frame, 120, 20),
    fadeOut(frame, DURATION, 26, 10),
    1 - blocked,
  );
  if (visibility <= 0.001) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 30,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
        opacity: visibility * 0.72,
      }}
    >
      {SCENES.map((scene, index) => {
        const isActive = index === activeIndex;
        return (
          <div
            key={scene.id}
            style={{
              transform: `scale(${isActive ? 1.25 : 1}) rotate(${index % 2 ? 6 : -6}deg)`,
              opacity: isActive ? 1 : 0.32,
              transition: "none",
            }}
          >
            <PawPrint size={isActive ? 22 : 17} color={isActive ? COLORS.berry : COLORS.inkSoft} />
          </div>
        );
      })}
    </div>
  );
};

/**
 * CrawlBear — 54s promo film.
 * 1920×1080 · 30fps. Every scene is a Sequence that starts its own local frame at 0.
 */
export const Promo: React.FC = () => {
  const frame = useCurrentFrame();
  let cursor = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paper }}>
      <FontLoader />
      <PaperBackground />

      {SCENES.map((scene) => {
        const from = cursor;
        cursor += scene.duration;
        const Component = SCENE_COMPONENTS[scene.id];
        return (
          <Sequence
            key={scene.id}
            from={from}
            durationInFrames={scene.duration}
            name={scene.id}
            premountFor={30}
          >
            <Component />
          </Sequence>
        );
      })}

      <ChapterPaws frame={frame} />
      <PromoAudio />
    </AbsoluteFill>
  );
};

/** Exposed so Studio users can jump around. */
export const SCENE_MARKS = SCENES.map((scene, index) => ({
  ...scene,
  start: SCENES.slice(0, index).reduce((sum, item) => sum + item.duration, 0),
}));

export const KEY_ANCHORS = {
  hookTitle: 40,
  problemTitle: SCENE_MARKS[1].start + 30,
  pasteCapsule: SCENE_MARKS[2].start + 26,
  crawlProgress: SCENE_MARKS[3].start + 120,
  resultsGrid: SCENE_MARKS[4].start + 60,
  collectBag: SCENE_MARKS[5].start + 150,
  sites: SCENE_MARKS[6].start + 90,
  privacy: SCENE_MARKS[7].start + 40,
  outro: SCENE_MARKS[8].start + 90,
} as const;
