import React from "react";
import { Audio, Sequence, interpolate, staticFile } from "remotion";
import { DURATION } from "../theme";

/**
 * CrawlBear promo film — soundtrack + UI sound effects.
 *
 * The wav files are synthesized by `promo/scripts/make_audio.py` and live in
 * `promo/public/audio/`. They are deterministic and shipped with the project,
 * so a normal checkout renders with sound straight away:
 *
 *   music-bed.wav  54.0 s stereo bed — fades in over the first 40 frames and
 *                  out over the last 60 frames (1560 → 1620).
 *   pop.wav        60 ms  card / sticker pop
 *   click.wav      40 ms  button press + typing tick + cursor click
 *   stamp.wav     220 ms  "已收" rubber stamp / button slam
 *   whoosh.wav    380 ms  scene-cut swoosh
 *   chime.wav     900 ms  success bell (C6 + E6)
 *
 * The cue sheet below is aligned to the actual scene implementations (not just
 * the storyboard): every pop/click/stamp sits on the frame where the matching
 * sticker slams in, the cursor clicks, or the card lands. Frames are absolute
 * (30 fps, 1620 frames = 54 s); scene windows are:
 *
 *   hook 0 · problem 150 · paste 300 · crawl 450 · results 690 ·
 *   collect 930 · sites 1140 · privacy 1305 · outro 1425
 *
 * Set AUDIO_ENABLED to false to render a silent cut without touching the
 * timeline (useful if `public/audio/` was stripped from a checkout — otherwise
 * Remotion will complain about the missing static files).
 */
const AUDIO_ENABLED = true;

/** Music bed level. Kept low so the short SFX below stay clearly on top. */
const MUSIC_VOLUME = 0.42;

type SfxName = "pop" | "click" | "stamp" | "whoosh" | "chime";

/**
 * How many frames each SFX <Sequence> stays mounted. Always a little longer
 * than the wav itself so the tail is never clipped by the Sequence.
 */
const SFX_FRAMES: Record<SfxName, number> = {
  pop: 3, // 60 ms  → 100 ms of timeline
  click: 3, // 40 ms  → 100 ms
  stamp: 8, // 220 ms → 267 ms
  whoosh: 12, // 380 ms → 400 ms
  chime: 28, // 900 ms → 933 ms
};

/** Default per-effect levels (0–1), all well under the music's headroom. */
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
  <Sequence
    from={at}
    durationInFrames={SFX_FRAMES[name]}
    name={`sfx ${name} @${at}`}
  >
    <Audio src={staticFile(`audio/${name}.wav`)} volume={volume ?? SFX_VOLUME[name]} />
  </Sequence>
);

/* ---------------------------------------------------------------------------
 * Cue sheet. One array per scene, chronological. `volume` overrides the
 * default level for that specific hit (typing ticks and cursor clicks are
 * deliberately quieter than card pops).
 * ------------------------------------------------------------------------- */

type Cue = { at: number; effect: SfxName; volume?: number };

/** Hook (0:00–0:05) — hero lands, bubble + four media stickers slam in. */
const HOOK_CUES: Cue[] = [
  { at: 66, effect: "pop" }, // "今天想翻哪个网站？" bubble slam
  { at: 78, effect: "pop" }, // 图片 sticker
  { at: 86, effect: "pop" }, // 视频 sticker
  { at: 94, effect: "pop" }, // 音乐 sticker
  { at: 102, effect: "pop" }, // 字体 sticker
];

/** Problem (0:05–0:10) — four pain stickers slam, cursor keeps right-clicking. */
const PROBLEM_CUES: Cue[] = [
  { at: 170, effect: "pop" }, // 痛点 1「右键另存为」砸入
  { at: 182, effect: "pop" }, // 痛点 2「截图」
  { at: 190, effect: "click", volume: 0.24 }, // 光标右键存图 #1
  { at: 194, effect: "pop" }, // 痛点 3「视频」
  { at: 206, effect: "pop" }, // 痛点 4「音乐 / 字体」
  { at: 214, effect: "pop" }, // "这也太费劲了…" bubble slam
  { at: 218, effect: "click", volume: 0.24 }, // 光标右键存图 #2
  { at: 254, effect: "click", volume: 0.24 }, // 光标右键存图 #3
];

/** Paste (0:10–0:15) — URL types itself, auto-fill hint slams, CTA pressed. */
const PASTE_CUES: Cue[] = [
  { at: 324, effect: "click", volume: 0.12 }, // 打字 tick（与 typed() 同步）
  { at: 330, effect: "click", volume: 0.12 },
  { at: 336, effect: "click", volume: 0.12 },
  { at: 342, effect: "click", volume: 0.12 },
  { at: 348, effect: "click", volume: 0.12 },
  { at: 354, effect: "click", volume: 0.12 },
  { at: 360, effect: "click", volume: 0.12 }, // 最后一个字符打完
  { at: 364, effect: "pop" }, // "自动补 https://" 贴纸砸入（local 64）
  { at: 376, effect: "click" }, // "开始翻找" 按钮按下（local 76）
  { at: 402, effect: "pop" }, // "交给我。" bubble slam（local 102）
];

/** Crawl (0:15–0:23) — 8 media chips launch, progress completes, "翻好了" stamp. */
const CRAWL_CUES: Cue[] = [
  { at: 494, effect: "pop" }, // 图标弹射 #1（local 44 起，每 13 帧一个）
  { at: 507, effect: "pop" },
  { at: 520, effect: "pop" },
  { at: 526, effect: "pop", volume: 0.3 }, // "找到啦！" bubble slam（local 76）
  { at: 533, effect: "pop" },
  { at: 546, effect: "pop" },
  { at: 559, effect: "pop" },
  { at: 572, effect: "pop" },
  { at: 585, effect: "pop" }, // 图标弹射 #8
  { at: 640, effect: "chime" }, // 进度 100% → 状态 chip 变「翻好了」（local 190）
];

/** Results (0:23–0:31) — 8 cards stagger in, preview opens/closes, select all. */
const RESULTS_CUES: Cue[] = [
  { at: 704, effect: "pop" }, // 卡片 #1（local 14 起，每 5 帧）
  { at: 709, effect: "pop" },
  { at: 714, effect: "pop" },
  { at: 719, effect: "pop" },
  { at: 724, effect: "pop" },
  { at: 729, effect: "pop" },
  { at: 734, effect: "pop" },
  { at: 739, effect: "pop" }, // 卡片 #8
  { at: 786, effect: "click" }, // 点开预览弹窗（local 96）
  { at: 856, effect: "click", volume: 0.22 }, // 关闭预览（local 166）
  { at: 891, effect: "click", volume: 0.2 }, // 点「全选当前」（local 201）
];

/** Collect (0:31–0:38) — 4 ticks, CTA, 4 "已收" stamps, done chime + seal. */
const COLLECT_CUES: Cue[] = [
  { at: 966, effect: "pop" }, // 勾选卡片 #1（local 36）
  { at: 977, effect: "pop" }, // 勾选 #2（local 47）
  { at: 988, effect: "pop" }, // 勾选 #3（local 58）
  { at: 999, effect: "pop" }, // 勾选 #4（local 69）
  { at: 1015, effect: "click", volume: 0.18 }, // 点「全选当前」（local 85）
  { at: 1030, effect: "click" }, // 按「收进采集袋」（local 100）
  { at: 1052, effect: "stamp" }, // 已收章 #1（local 122）
  { at: 1062, effect: "stamp" }, // 已收章 #2
  { at: 1072, effect: "stamp" }, // 已收章 #3
  { at: 1082, effect: "stamp" }, // 已收章 #4
  { at: 1090, effect: "chime" }, // BagBar 变「收好了，8 件都在袋子里」（local 160）
  { at: 1094, effect: "stamp" }, // 「收好」大印章砸到采集袋上（local 164）
];

/** Sites (0:38–0:43.5) — 4 site badges + 4 quality chips + "已启用" sticker. */
const SITES_CUES: Cue[] = [
  { at: 1152, effect: "pop" }, // 站点卡 #1（local 12 起，每 8 帧）
  { at: 1160, effect: "pop" },
  { at: 1168, effect: "pop" },
  { at: 1176, effect: "pop" }, // 站点卡 #4
  { at: 1184, effect: "pop", volume: 0.26 }, // 画质 chip #1（local 44 起）
  { at: 1192, effect: "pop", volume: 0.26 },
  { at: 1200, effect: "pop", volume: 0.26 },
  { at: 1208, effect: "pop", volume: 0.26 }, // 画质 chip #4
  { at: 1252, effect: "pop", volume: 0.3 }, // 画质阶梯 4 个 ✓ 同时亮起（local 112）
  { at: 1258, effect: "pop" }, // 「专属解析已启用」贴纸砸入（local 118）
];

/** Privacy (0:43.5–0:47.5) — shield emblem + three promises land in a quick
 *  cascade; the bell rings on the last one and holds through the quiet beat. */
const PRIVACY_CUES: Cue[] = [
  { at: 1316, effect: "pop" }, // 盾牌徽章砸入圆圈顶部（local 11）
  { at: 1319, effect: "pop", volume: 0.24 }, // 「不需要注册」（local 14）
  { at: 1324, effect: "pop", volume: 0.24 }, // 「数据不出这台 Mac」（local 19）
  { at: 1329, effect: "chime" }, // 「Cookie 只留在本机」落位 + 安全感定音（local 24）
];

/** Outro (0:47.5–0:54) — download CTA lands, "装满啦！" bubble follows. */
const OUTRO_CUES: Cue[] = [
  { at: 1473, effect: "stamp" }, // 「下载 macOS 版」主按钮落位（local 48）
  { at: 1481, effect: "pop" }, // "装满啦！" bubble slam（local 56）
];

/**
 * Scene cuts — every scene ends on a "paper slide + sticker slam", so each cut
 * gets a whoosh. 0 s opens the film; 150/300/450/690/930/1140/1305/1425 are the
 * hook→problem→paste→crawl→results→collect→sites→privacy→outro cuts.
 */
const WHOOSH_CUES: Cue[] = [
  { at: 0, effect: "whoosh" },
  { at: 150, effect: "whoosh" },
  { at: 300, effect: "whoosh" },
  { at: 450, effect: "whoosh" },
  { at: 690, effect: "whoosh" },
  { at: 930, effect: "whoosh" },
  { at: 1140, effect: "whoosh" },
  { at: 1305, effect: "whoosh" },
  { at: 1425, effect: "whoosh" },
];

const ALL_CUES: Cue[] = [
  ...WHOOSH_CUES,
  ...HOOK_CUES,
  ...PROBLEM_CUES,
  ...PASTE_CUES,
  ...CRAWL_CUES,
  ...RESULTS_CUES,
  ...COLLECT_CUES,
  ...SITES_CUES,
  ...PRIVACY_CUES,
  ...OUTRO_CUES,
];

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
        <Sfx
          key={`${cue.effect}-${cue.at}`}
          name={cue.effect}
          at={cue.at}
          volume={cue.volume}
        />
      ))}
    </>
  );
};
