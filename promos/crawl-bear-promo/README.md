# CrawlBear 宣传短片 · Remotion 工程

「把网页里的宝贝，收进采集袋。」—— 超级爬爬熊（CrawlBear）54 秒产品宣传短片。

- 包名：`@crawl-bear/promo`（pnpm workspace 子包，仓库根目录下的 `promos/crawl-bear-promo/`）
- 分辨率：1920×1080 · 30fps · 1620 帧（54s）· 9 幕
- 技术栈：React 18 + Remotion 4，画面全部由代码绘制
- 视觉依据：[`docs/design.md`](../../docs/design.md)（奶油纸、墨线、硬投影、贴纸、手绘小熊）
- 音频：`scripts/make_audio.py` 程序化合成的木琴配乐 + UI 音效（无需版权素材）
- 图像升级：可选生成图清单与 gpt-image-2 提示词见 [`ASSETS.md`](ASSETS.md)

---

## 快速开始

在**仓库根目录**执行（依赖已在 `pnpm install` 时一起装好）：

```bash
pnpm install        # 只需第一次（整个 workspace）
pnpm dev:promo      # 启动 Remotion Studio → http://localhost:3000
```

Studio 左侧会列出 composition `CrawlBearPromo`，可以拖动时间轴、切帧、改 props，保存即热更新。
只想要某个静帧（比如做海报）：

```bash
pnpm --filter @crawl-bear/promo exec remotion still CrawlBearPromo out/poster.png --frame=110
```

导出成片（约 2–4 分钟，首次会自动下载 Chrome Headless Shell）：

```bash
pnpm render:promo                                        # → promos/crawl-bear-promo/out/crawl-bear-promo.mp4
pnpm --filter @crawl-bear/promo exec remotion render CrawlBearPromo out/promo.mp4 --crf=18   # 更高画质
```

也可以直接在本目录用包内脚本：

```bash
cd promos/crawl-bear-promo
pnpm dev          # Remotion Studio
pnpm typecheck    # tsc --noEmit
pnpm build        # 类型检查 + remotion bundle → dist/
pnpm render       # 渲染 MP4
pnpm audio        # 重新生成配乐与音效（需要 python3 + numpy）
pnpm art          # 把 public/assets/generated 里的生图处理成 WebP（见 ASSETS.md）
```

> `promos/` 下的视频工程不参与 `pnpm build:web` 之类的应用构建；`pnpm build`（`pnpm -r build`）会把它当作一个普通包做 `bundle`，用于在 CI 里确认片子还能编译。

## 分镜时间轴

| # | 场景 | 本地帧 | 时长 | 画面 |
|---|------|--------|------|------|
| 1 | hook | 0–149 | 5.0s | 品牌承诺：标题 + 小熊挥手 + 四类媒体贴纸 |
| 2 | problem | 0–149 | 5.0s | 「老办法」：假浏览器 + 四条痛点 + 被缠住的小熊 |
| 3 | paste | 0–149 | 5.0s | 一体式搜索胶囊：打字网址 → 开始翻找 |
| 4 | crawl | 0–239 | 8.0s | 翻找中：蜂蜜进度条 + 计数 + 媒体图标飞入 |
| 5 | results | 0–239 | 8.0s | 结果页：筛选、卡片、点开预览弹窗 |
| 6 | collect | 0–209 | 7.0s | 勾选 → 采集袋 → 盖章「已收」+ 爪印彩纸 |
| 7 | sites | 0–164 | 5.5s | 专属解析：X / YouTube / Bilibili / 抖音 |
| 8 | privacy | 0–119 | 4.0s | 本机运行：无账号、无云端、无遥测 |
| 9 | outro | 0–194 | 6.5s | 品牌落版：logo + 标语 + 网址 + 下载按钮 |

每个场景在 `Promo.tsx` 里是一个 `<Sequence>`，组件拿到的 `frame` 从 0 开始。
所有场景时长由 [`src/theme.ts`](src/theme.ts) 的 `SCENES` 数组决定，改这里即可重排整片（`DURATION` 自动求和）。

## 工程结构

```text
promos/crawl-bear-promo/
  src/
    theme.ts              设计 token：色板 / 字体 / 描边 / 时间轴 / 场景时长
    lib/
      anim.ts             全部确定性动画工具（spring / 打字机 / 计数 / 伪随机…）
      copy.ts             全片文案 + 结果页卡片数据（改文案只改这里）
    components/           共享视觉组件（面板、贴纸、气泡、小熊、卡片、进度条…）
    scenes/
      Hook.tsx            1 开场（风格基准）
      open/               2 problem · 3 paste · 7 sites
      core/               4 crawl · 5 results
      close/              6 collect · 8 privacy · 9 outro
    audio/PromoAudio.tsx  配乐 + 音效时间轴（81 个 cue，按帧对齐）
    Promo.tsx             总时间轴（9 个 Sequence）+ 章节爪印
    Root.tsx              Composition 注册（CrawlBearPromo）
  public/
    assets/brand/         小熊 WebP、纸纹、logo（同步自 apps/desktop/public/assets）
    assets/shots/         真实 App 截图（结果页/首页/进度/设置，仅作还原对照）
    assets/generated/     自行生成的升级图放这里，见 ASSETS.md
    audio/                合成配乐 + 音效 WAV（54s bed + 5 个 SFX）
    fonts/                ZCOOL KuaiLe 回退字体（SIL OFL）
  scripts/
    make_audio.py         重新生成配乐与音效（numpy，幂等）
    apply_art.py          把生成的 PNG 裁边缩放后覆盖 public/assets/brand
  out/                    渲染产物（gitignored）
  dist/                   remotion bundle 产物（gitignored）
  BRIEF.md                制作规范（组件 API、转场、协作约定）
  ASSETS.md               可选生成图清单 + gpt-image-2 提示词
```

## 常见修改

| 想改什么 | 改哪里 |
| --- | --- |
| 任何一句文案 | `src/lib/copy.ts` |
| 配色 / 字体 / 描边粗细 | `src/theme.ts` 的 `COLORS` / `FONTS` / `INK` |
| 某一幕时长 | `src/theme.ts` 的 `SCENES` |
| 某一幕画面 | `src/scenes/**` 对应组件（帧号从 0 开始） |
| 配乐情绪 / 音效位置 | `scripts/make_audio.py` 与 `src/audio/PromoAudio.tsx` |
| 小熊插画 | 替换 `public/assets/brand/bear-<mood>.webp`（见 ASSETS.md） |
| 新增一幕 | 在 `src/scenes/` 建组件 → 在 `src/theme.ts` 的 `SCENES` 加一行 → 在 `Promo.tsx` 的 `SCENE_COMPONENTS` 注册 |

所有动画都是「帧 → 画面」的纯函数：同一帧永远渲染出同一画面，可以放心并行渲染，也可以把任意一帧导出当海报。

## 依赖与许可

- Remotion 对个人/小团队免费，公司使用需购买许可证：https://remotion.dev/license
- 字体：标题用 macOS 自带 Hannotate SC（手札体），缺失时回退到 `public/fonts/ZCOOLKuaiLe-Regular.ttf`（SIL OFL）；正文 PingFang SC。
- 音频由本项目脚本合成，无第三方素材。
- 小熊插画与品牌资产来自 CrawlBear 仓库，MIT。
