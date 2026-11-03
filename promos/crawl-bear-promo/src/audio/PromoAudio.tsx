import React from "react";
import { Audio, Sequence, interpolate, staticFile } from "remotion";
import { DURATION, SCENES, sceneStart, type SceneId } from "../theme";

/**
 * CrawlBear promo film — soundtrack + UI sound effects.
 *
 * The wav files are synthesized by `scripts/make_audio.py` and live in
 * `public/audio/`. They are deterministic and shipped with the project, so a
 * normal checkout renders with sound straight away:
 *
 *   music-bed.wav  60.0 s stereo bed — fades in over the first 40 frames and
 *                  out over the last 60 frames (1740 → 1800).
 *   pop.wav        60 ms  card / sticker pop
 *   click.wav      40 ms  button press + typing tick + cursor click
 *   stamp.wav     220 ms  "已收" rubber stamp / button slam
 *   whoosh.wav    380 ms  scene-cut swoosh
 *   chime.wav     900 ms  success bell (C6 + E6)
 *
 * The cue sheet is authored **per scene, in local frames** (frame 0 = the first
 * frame of that scene) and mapped onto the timeline with `sceneStart()`. Adding,
 * removing or reordering scenes in `SCENES` therefore never shifts the sound
 * effects — only the scene windows move.
 *
 * Scene windows (30 fps, 1800 frames = 60 s):
 *   prologue 0 · problem 180 · birth 330 · paste 480 · crawl 630 ·
 *   results 870 · collect 1110 · sites 1320 · privacy 1485 · outro 1605
 *
 * Set AUDIO_ENABLED to false to render a silent cut without touching the
 * timeline (useful if `public/audio/` was stripped from a checkout — otherwise
 * Remotion will complain about the missing static files).
 */
const AUDIO_ENABLED = true;

/** Music bed level. Kept low so the short SFX below stay clearly on top. */
const MUSIC_VOLUME = 0.42;

type SfxName = "pop" | "click" | "stamp" | "whoosh" | "chime";

/** How many frames each SFX <Sequence> stays mounted (a little longer than the wav). */
const SFX_FRAMES: Record<SfxName, number> = {
  pop: 3, // 60 ms  → 100 ms of timeline
  click: 3, // 40 ms  → 100 ms
  stamp: 8, // 220 ms → 267 ms
  whoosh: 12, // 380 ms → 400 ms
  chime: 28, // 900 ms → 933 ms
};

/** Default per-effect levels (0–1). */
const SFX_VOLUME: Record<SfxName, number> = {
  pop: 0.35,
  click: 0.3,
  stamp: 0.5,
  whoosh: 0.32,
  chime: 0.4,
};

const Sfx: React.FC<{ name: SfxName; at: number; volume?: number }> = ({
  name,
  at,
  volume,
}) => (
  <Sequence from={at} durationInFrames={SFX_FRAMES[name]} name={`sfx ${name} @${at}`}>
    <Audio src={staticFile(`audio/${name}.wav`)} volume={volume ?? SFX_VOLUME[name]} />
  </Sequence>
);

/* ---------------------------------------------------------------------------
 * Cue sheet — local frames, one array per scene.
 * ------------------------------------------------------------------------- */

type Cue = { at: number; effect: SfxName; volume?: number };

const PROLOGUE_CUES: Cue[] = [
  { at: 8, effect: "pop" }, // 便签砸入
  { at: 20, effect: "pop", volume: 0.24 }, // eyebrow 贴纸
  { at: 34, effect: "pop" }, // 拍立得落下
  { at: 52, effect: "pop", volume: 0.2 }, // 照片显影 + 名字出现
  { at: 118, effect: "pop", volume: 0.2 }, // 「它是怎么来的？」
  { at: 166, effect: "chime", volume: 0.22 }, // 交棒给起因
];

/** 起因：痛点贴纸砸入 + 光标右键点击。 */
const PROBLEM_CUES: Cue[] = [
  { at: 20, effect: "pop" }, // 痛点 1「右键另存为」
  { at: 32, effect: "pop" }, // 痛点 2「截图」
  { at: 40, effect: "click", volume: 0.24 }, // 光标右键存图 #1
  { at: 44, effect: "pop" }, // 痛点 3「视频」
  { at: 56, effect: "pop" }, // 痛点 4「音乐 / 字体」
  { at: 64, effect: "pop" }, // "这也太费劲了…" 气泡
  { at: 68, effect: "click", volume: 0.24 }, // 光标右键存图 #2
  { at: 104, effect: "click", volume: 0.24 }, // 光标右键存图 #3
];

/** 诞生：光圈炸开、小熊落地、气泡和四类媒体贴纸陆续落位。 */
const BIRTH_CUES: Cue[] = [
  { at: 8, effect: "pop", volume: 0.22 }, // 「于是」贴纸
  { at: 34, effect: "whoosh", volume: 0.42 }, // 光圈炸开
  { at: 36, effect: "stamp", volume: 0.32 }, // 小熊落地
  { at: 62, effect: "pop" }, // "以后这种事，交给我。"气泡
  { at: 80, effect: "pop", volume: 0.26 }, // 图片 sticker
  { at: 86, effect: "pop", volume: 0.26 }, // 视频 sticker
  { at: 92, effect: "pop", volume: 0.26 }, // 音乐 sticker
  { at: 98, effect: "pop", volume: 0.26 }, // 字体 sticker
  { at: 112, effect: "chime", volume: 0.3 }, // slogan 落定
];

/** 贴网址：打字 tick、自动补全、按钮、气泡。 */
const PASTE_CUES: Cue[] = [
  { at: 24, effect: "click", volume: 0.12 },
  { at: 30, effect: "click", volume: 0.12 },
  { at: 36, effect: "click", volume: 0.12 },
  { at: 42, effect: "click", volume: 0.12 },
  { at: 48, effect: "click", volume: 0.12 },
  { at: 54, effect: "click", volume: 0.12 },
  { at: 60, effect: "click", volume: 0.12 }, // 最后一个字符打完
  { at: 64, effect: "pop" }, // "自动补 https://" 贴纸
  { at: 76, effect: "click" }, // "开始翻找" 按压
  { at: 102, effect: "pop" }, // "交给我。" 气泡
];

/** 翻找中：8 个图标弹射、气泡、进度 100%。 */
const CRAWL_CUES: Cue[] = [
  { at: 44, effect: "pop" }, // 图标 1（每 13 帧一个）
  { at: 57, effect: "pop" },
  { at: 70, effect: "pop" },
  { at: 76, effect: "pop", volume: 0.3 }, // "找到啦！" 气泡
  { at: 83, effect: "pop" },
  { at: 96, effect: "pop" },
  { at: 109, effect: "pop" },
  { at: 122, effect: "pop" },
  { at: 135, effect: "pop" }, // 图标 8
  { at: 190, effect: "chime" }, // 进度 100%
];

/** 结果页：8 张卡入场、预览开关、点「全选当前」。 */
const RESULTS_CUES: Cue[] = [
  { at: 14, effect: "pop" }, // 卡片 1（每 5 帧一张）
  { at: 19, effect: "pop" },
  { at: 24, effect: "pop" },
  { at: 29, effect: "pop" },
  { at: 34, effect: "pop" },
  { at: 39, effect: "pop" },
  { at: 44, effect: "pop" },
  { at: 49, effect: "pop" }, // 卡片 8
  { at: 96, effect: "click" }, // 打开预览
  { at: 166, effect: "click", volume: 0.22 }, // 关闭预览
  { at: 201, effect: "click", volume: 0.2 }, // 轻触「全选当前」
];

/** 收进采集袋：勾选、按压、四个「已收」章、完成态。 */
const COLLECT_CUES: Cue[] = [
  { at: 36, effect: "pop" }, // 勾选 1
  { at: 47, effect: "pop" }, // 勾选 2
  { at: 58, effect: "pop" }, // 勾选 3
  { at: 69, effect: "pop" }, // 勾选 4
  { at: 85, effect: "click", volume: 0.18 }, // 点「全选当前」
  { at: 100, effect: "click" }, // 按「收进采集袋」
  { at: 122, effect: "stamp" }, // 已收章 1
  { at: 132, effect: "stamp" }, // 已收章 2
  { at: 142, effect: "stamp" }, // 已收章 3
  { at: 152, effect: "stamp" }, // 已收章 4
  { at: 160, effect: "chime" }, // 「收好了」完成态
  { at: 164, effect: "stamp" }, // 「收好」大印章
];

/** 专属解析：站点卡、画质 chip、已启用贴纸。 */
const SITES_CUES: Cue[] = [
  { at: 12, effect: "pop" }, // 站点卡 1（每 8 帧一张）
  { at: 20, effect: "pop" },
  { at: 28, effect: "pop" },
  { at: 36, effect: "pop" }, // 站点卡 4
  { at: 44, effect: "pop", volume: 0.26 }, // 画质 chip 1
  { at: 52, effect: "pop", volume: 0.26 },
  { at: 60, effect: "pop", volume: 0.26 },
  { at: 68, effect: "pop", volume: 0.26 }, // 画质 chip 4
  { at: 112, effect: "pop", volume: 0.3 }, // 画质阶梯 ✓ 亮起
  { at: 118, effect: "pop" }, // 「专属解析已启用」
];

/** 本机运行：盾徽与三条承诺级联落下，最后一声钟收住。 */
const PRIVACY_CUES: Cue[] = [
  { at: 11, effect: "pop" }, // 盾牌徽章
  { at: 14, effect: "pop", volume: 0.24 }, // 「不需要注册」
  { at: 19, effect: "pop", volume: 0.24 }, // 「数据不出这台 Mac」
  { at: 24, effect: "chime" }, // 「Cookie 只留在本机」
];

/** 落版：下载按钮落位 + 气泡。 */
const OUTRO_CUES: Cue[] = [
  { at: 48, effect: "stamp" }, // 「下载 macOS 版」
  { at: 56, effect: "pop" }, // "装满啦！" 气泡
];

/** Every scene's cue list, keyed by scene id. */
const SCENE_CUES: Record<SceneId, Cue[]> = {
  prologue: PROLOGUE_CUES,
  problem: PROBLEM_CUES,
  birth: BIRTH_CUES,
  paste: PASTE_CUES,
  crawl: CRAWL_CUES,
  results: RESULTS_CUES,
  collect: COLLECT_CUES,
  sites: SITES_CUES,
  privacy: PRIVACY_CUES,
  outro: OUTRO_CUES,
};

/** 每一幕的切点都有 whoosh（开场也算一次）。 */
const WHOOSH_CUES: Cue[] = SCENES.map((scene) => ({ at: sceneStart(scene.id), effect: "whoosh" }));

const sceneCues: Cue[] = [];
for (const scene of SCENES) {
  for (const cue of SCENE_CUES[scene.id]) {
    sceneCues.push({ ...cue, at: cue.at + sceneStart(scene.id) });
  }
}

const ALL_CUES: Cue[] = [...WHOOSH_CUES, ...sceneCues].sort((a, b) => a.at - b.at);

export const PromoAudio: React.FC = () => {
  if (!AUDIO_ENABLED) return null;

  return (
    <>
      {/* Music bed — fades in over the opening 40 frames and out over the
          last 60 frames (2 s), so it never fights the fade-to-paper ending. */}
      <Audio
        src={staticFile("audio/music-bed.wav")}
        volume={(frame) =>
          interpolate(
            frame,
            [0, 40, DURATION - 60, DURATION],
            [0, MUSIC_VOLUME, MUSIC_VOLUME, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          )
        }
      />

      {ALL_CUES.map((cue) => (
        <Sfx key={`${cue.effect}-${cue.at}`} name={cue.effect} at={cue.at} volume={cue.volume} />
      ))}
    </>
  );
};
