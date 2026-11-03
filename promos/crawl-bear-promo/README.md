# CrawlBear 宣传短片 · Remotion 工程

「把网页里的宝贝，收进采集袋。」—— 超级爬爬熊（CrawlBear）60 秒产品宣传短片（6 秒「引子」+ 54 秒九幕产品介绍）。

- 包名：`@crawl-bear/promo`（pnpm workspace 子包，仓库根目录下的 `promos/crawl-bear-promo/`）
- 分辨率：1920×1080 · 30fps · 1800 帧（60s）· 10 幕（含引子）
- 技术栈：React 18 + Remotion 4，画面全部由代码绘制
- 视觉依据：[`docs/design.md`](../../docs/design.md)（奶油纸、墨线、硬投影、贴纸、手绘小熊）
- 音频：`scripts/make_audio.py` 程序化合成的木琴配乐 + UI 音效（无需版权素材）
- 生图：只需 1 张（引子拍立得里的大肥鱼），文件名 + 完整提示词见 [`ASSETS.md`](ASSETS.md)；小熊、纸纹、logo 复用现有插画

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

## 两个版本（Composition）

| Composition | 用在哪 | 差异 |
| --- | --- | --- |
| `CrawlBearPromo` | 官网 / B 站 / YouTube / 微信等 | 演示里是真实风格的域名，落版带官网地址 |
| `CrawlBearPromoNoLink` | 抖音 / 视频号等对 URL、平台名敏感的平台 | 域名换成 `xxxx.xx.com` 占位；「专属解析」不出现平台名（改成视频/图集/音频站点 + 「解析不了？提 GitHub Issue」）；落版无网址，改成「私聊作者获取」 |

```bash
pnpm render          # 标准版 → out/crawl-bear-promo.mp4
pnpm render:nolink   # 去外链版 → out/crawl-bear-promo-nolink.mp4
```

（在仓库根目录则用 `pnpm render:promo` / `pnpm render:promo:nolink`。）

变体由 `src/lib/variant.tsx` 注入：场景用 `useCopy()` / `useMediaItems()` 取文案，
URL 相关字段分别在 `lib/copy.ts` 的 `COPY` 与 `COPY_NO_LINK` 里定义，其余文案共用。

## 分镜时间轴

| # | 场景 | 本地帧 | 时长 | 画面 |
|---|------|--------|------|------|
| 1 | prologue | 0–179 | 6.0s | 引子：手写便签 + 大肥鱼拍立得，请大家花一分钟看看小工具 |
| 2 | problem | 0–149 | 5.0s | 起因：想把网页素材存下来，但右键/截图/找地址太费劲 |
| 3 | birth | 0–149 | 5.0s | 诞生：干脆自己写一个 → 光圈炸开，爬爬熊登场 + 名字 + slogan |
| 4 | paste | 0–149 | 5.0s | 一体式搜索胶囊：打字网址 → 开始翻找 |
| 5 | crawl | 0–239 | 8.0s | 翻找中：蜂蜜进度条 + 计数 + 媒体图标飞入 |
| 6 | results | 0–239 | 8.0s | 结果页：筛选、卡片、点开预览弹窗 |
| 7 | collect | 0–209 | 7.0s | 勾选 → 采集袋 → 盖章「已收」+ 爪印彩纸 |
| 8 | sites | 0–164 | 5.5s | 专属解析：X / YouTube / Bilibili / 抖音 |
| 9 | privacy | 0–119 | 4.0s | 本机运行：无账号、无云端、无遥测 |
| 10 | outro | 0–194 | 6.5s | 品牌落版：logo + 标语 + 网址 + 下载按钮 |

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
      variant.tsx         变体上下文：standard / noLink（去外链版）
    components/           共享视觉组件（面板、贴纸、气泡、小熊、卡片、进度条…）
    scenes/
      Prologue.tsx        1 引子（作者便签 + 大肥鱼）
      Birth.tsx           3 诞生（爬爬熊登场 + 品牌名 + slogan）
      open/               2 problem · 4 paste · 8 sites
      core/               5 crawl · 6 results
      close/              7 collect · 9 privacy · 10 outro
    audio/PromoAudio.tsx  配乐 + 音效时间轴（88 个 cue，按帧对齐）
    Promo.tsx             总时间轴（10 个 Sequence）+ 章节爪印 + 变体注入
    Root.tsx              注册两个 Composition（标准版 / 去外链版）
  public/
    assets/brand/         小熊 WebP、纸纹、logo（同步自 apps/desktop/public/assets）
    assets/shots/         真实 App 截图（结果页/首页/进度/设置，仅作还原对照）
    assets/generated/     生图放这里（当前只有引子的大肥鱼），见 ASSETS.md
    audio/                合成配乐 + 音效 WAV（60s bed + 5 个 SFX）
    fonts/                ZCOOL KuaiLe 回退字体（SIL OFL）
  scripts/
    make_audio.py         重新生成配乐与音效（numpy，幂等）
    apply_art.py          把生成的 PNG 裁边缩放后覆盖 public/assets/brand
  out/                    渲染产物（gitignored）
  dist/                   remotion bundle 产物（gitignored）
  BRIEF.md                制作规范（组件 API、转场、协作约定）
  ASSETS.md               生图清单：1 张图 + 完整提示词
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
