# 工程结构 · Repository structure

> 版本 v0.5 · 与 `package.json` / `pnpm-workspace.yaml` 保持一致。
> 配套阅读：[README.md](../README.md)（项目介绍与使用）、[design.md](design.md)（设计规范）、[ARCHITECTURE.md](ARCHITECTURE.md)（运行时分层）。

本文回答三件事：**仓库里有什么、每个包负责什么、改东西该去哪个文件**。

---

## 1. 一眼看懂

仓库是一个 **pnpm workspace**，包含三个可独立开发、独立构建的子包，外加一份被所有包共用的设计规范与资产流水线：

```
crawl-bear/
├── apps/                          应用（会被用户直接安装 / 访问）
│   ├── desktop/                   macOS 桌面应用：Tauri 2 + Rust + React 18
│   └── website/                   营销官网：Vite + React 18
├── promos/                        营销素材（产出视频 / 图片，不参与应用安装包）
│   └── crawl-bear-promo/          54s 宣传短片：Remotion 4 + React 18
├── docs/                          跨包共享的文档（设计规范、架构、契约、本文件）
├── assets/readme/                 README / 文档用配图（已提交）
├── design-assets/                 生图原稿（本地保留，不提交，可按 docs/assets.md 重新生成）
└── scripts/                       跨包图片资产流水线 + macOS 打包脚本
```

| 包名 | 目录 | 技术栈 | 主要产物 | 开发命令 |
| --- | --- | --- | --- | --- |
| `@crawl-bear/desktop` | `apps/desktop` | Tauri 2 · Rust 2021 · React 18 · Ant Design · framer-motion · Vite | `CrawlBear.app` / `.pkg` / `.zip` | `pnpm dev:desktop` |
| `@crawl-bear/website` | `apps/website` | React 18 · framer-motion · Vite | 静态站点（部署到腾讯云 COS） | `pnpm dev:web` |
| `@crawl-bear/promo` | `promos/crawl-bear-promo` | Remotion 4 · React 18 | `.mp4` 宣传片、静帧海报、合成音频 | `pnpm dev:promo` |

**包之间没有代码依赖。** 三者共享的不是 npm 包，而是三样东西：

1. **设计规范**：[`docs/design.md`](design.md) —— 色板、字体、描边、圆角、动效、文案口吻的唯一依据；
2. **图片资产**：`design-assets/`（生图原稿）→ 由 `scripts/prepare_assets.py` 转成各包 `public/` 下的 WebP；
3. **文档**：`docs/` 与各包的 `README.md` / `ASSETS.md`。

这样做的原因：桌面端依赖 Ant Design、官网依赖 framer-motion，而视频工程必须保持纯净（Remotion 逐帧渲染，任何 UI 库都会拖慢构建、引入不确定性）。因此 token 以「值」的形式各自实现，而不是抽成共享包。

---

## 2. 完整目录树

```text
crawl-bear/
├── package.json                    根：workspace 命令入口（dev/build/assets/test/package）
├── pnpm-workspace.yaml             workspace 包列表：apps/* + promos/*
├── pnpm-lock.yaml                  全仓唯一锁文件
├── .npmrc                          npm registry 配置
├── .gitignore                      产物 / 本地资产忽略规则
├── LICENSE                         MIT
├── README.md                       中文 README（项目介绍、使用、开发、部署）
├── README.en.md                    英文 README
│
├── apps/
│   ├── desktop/                    macOS 桌面应用
│   │   ├── package.json            @crawl-bear/desktop
│   │   ├── index.html              Vite 入口
│   │   ├── vite.config.ts          Vite + React 插件
│   │   ├── tsconfig.json
│   │   ├── src/                    React 前端
│   │   │   ├── main.tsx            挂载点
│   │   │   ├── app/                App 外壳、顶栏（App.tsx / Masthead.tsx）
│   │   │   ├── features/
│   │   │   │   ├── crawler/        首页、结果页、预览弹窗、卡片、筛选、采集袋
│   │   │   │   └── settings/       保存位置 / 并发 / 登录站点 / 扩展 / 语言
│   │   │   ├── shared/             api（Tauri 调用）、i18n、errors、format、组件（Mascot 等）
│   │   │   ├── theme.ts            Ant Design token（与 docs/design.md 对齐）
│   │   │   └── styles.css          全局样式与 CSS token
│   │   ├── public/assets/          应用内 WebP：小熊插画、纸纹、logo
│   │   └── src-tauri/              Rust 后端与 Tauri 配置
│   │       ├── Cargo.toml
│   │       ├── tauri.conf.json     窗口 / 权限 / 打包配置
│   │       ├── capabilities/       权限声明
│   │       ├── icons/              应用图标（由 design-assets 生成）
│   │       ├── src/                爬取、解析器、下载、Cookie、扩展管理
│   │       └── target/             构建产物（gitignored）
│   │
│   └── website/                    营销官网
│       ├── package.json            @crawl-bear/website
│       ├── vite.config.ts          base 由 COS_PREFIX 注入
│       ├── src/
│       │   ├── App.tsx             单页官网：Hero / 功能 / 预览 / 专站解析 / 安装 / 下载
│       │   ├── components/         Icons.tsx、SmartImage（主图缺失时回退占位图）
│       │   ├── i18n.ts             中英切换
│       │   └── styles.css          与 docs/design.md 对齐的样式体系
│       ├── public/
│       │   ├── assets/brand/       小熊 / 纸纹 / logo（prepare_assets.py 同步）
│       │   ├── assets/shots/       真实界面截图
│       │   ├── assets/generated/   可选生图（缺失自动回退）
│       │   └── og-cover.webp       社交分享图
│       └── ASSETS.md               官网生图清单与提示词
│
├── promos/                         营销素材（不参与应用构建，可独立发布）
│   └── crawl-bear-promo/           54s 宣传短片
│       ├── package.json            @crawl-bear/promo
│       ├── remotion.config.ts      Remotion 构建配置
│       ├── tsconfig.json
│       ├── src/
│       │   ├── index.ts            注册根组件
│       │   ├── Root.tsx            注册 Composition：CrawlBearPromo（1920×1080 / 30fps / 1620 帧）
│       │   ├── Promo.tsx           总时间轴：9 个 <Sequence> + 全局纸张背景 + 章节爪印 + 音轨
│       │   ├── theme.ts            设计 token：色板、字体栈、描边、圆角、场景时长、总帧数
│       │   ├── lib/
│       │   │   ├── anim.ts         spring / 擦除 / 打字机 / 计数 / 确定性伪随机
│       │   │   └── copy.ts         全片文案 + 结果页卡片数据
│       │   ├── components/         InkPanel、Sticker、Bubble、Mascot、MediaCard、ProgressHoney…
│       │   ├── scenes/
│       │   │   ├── Hook.tsx        1 钩子（风格基准）
│       │   │   ├── open/           2 老办法 · 3 贴网址 · 7 专属解析
│       │   │   ├── core/           4 翻找中 · 5 结果页
│       │   │   └── close/          6 收进采集袋 · 8 本机运行 · 9 落版
│       │   └── audio/PromoAudio.tsx  背景乐音量包络 + 81 条音效 cue（按帧对齐）
│       ├── public/
│       │   ├── assets/brand/       小熊 WebP、纸纹、logo（同步自 desktop）
│       │   ├── assets/shots/       真实界面截图（仅作还原对照）
│       │   ├── assets/generated/   可选 2K 生图（apply_art.py 处理后覆盖 brand/）
│       │   ├── audio/              合成配乐 54s + 5 个音效 WAV
│       │   └── fonts/              ZCOOL KuaiLe 回退字体（SIL OFL）
│       ├── scripts/
│       │   ├── make_audio.py       numpy 合成配乐与音效（幂等，可重跑）
│       │   └── apply_art.py        生图 → 裁边 / 缩放 / WebP → 覆盖 public/assets
│       ├── out/                    渲染产物 MP4 / 静帧（gitignored）
│       ├── dist/                   remotion bundle 产物（gitignored）
│       ├── BRIEF.md                制作规范：组件 API、转场约定、协作规则
│       └── ASSETS.md               11 条可选生图清单 + gpt-image-2 提示词
│
├── assets/readme/                  README 配图（banner / 四张界面截图 / promo 分镜总览）
├── design-assets/                  生图原稿 PNG（本地保留，不提交；见 docs/assets.md）
├── docs/                           跨包共享文档
│   ├── design.md                   设计规范：品牌、色彩、字体、布局、动效、文案、无障碍
│   ├── assets.md                   小熊插画 / 底纹 / 图标的生图提示词
│   ├── ARCHITECTURE.md             Rust/React 分层、数据流、解析器扩展点
│   ├── API_CONTRACT.md             Tauri 命令 / 事件 / 错误码契约
│   ├── media-extraction.md         通用媒体提取脚本与双内核实测
│   ├── INSTALL-macOS.md            无开发者证书时的安装说明（随 .pkg 分发）
│   ├── STRUCTURE.md                本文件：工程结构总览
│   ├── screenshots/                本地校验截图（不提交）
│   └── archive/                    历史文档（不提交）
├── scripts/
│   ├── prepare_assets.py           生图原稿 → 应用/官网 WebP + 圆角图标 + 官网同步
│   ├── package_macos.sh            ad-hoc 签名 + 生成 .pkg / .zip 到 dist/
│   └── pkg-scripts/                安装包内的安装/卸载脚本
├── .github/workflows/
│   ├── ci.yml                      push/PR：装依赖 → pnpm build（三个包）→ Rust 测试
│   ├── website.yml                 官网构建 + 腾讯云 COS 部署
│   └── release.yml                 v* tag：universal macOS 包 + GitHub Release
└── dist/                           macOS 分发包产物（gitignored）
```

---

## 3. 三个子包各自负责什么

### 3.1 `apps/desktop` —— macOS 桌面应用（用户真正安装的东西）

- **前端**（`src/`）：单屏首页 → 翻找进度 → 结果页三态；设置页；预览弹窗；采集袋吸底栏。Ant Design 负责表单/弹窗基础，framer-motion 负责贴纸式动效，`Mascot` 组件负责小熊。
- **后端**（`src-tauri/src/`）：隐藏 WebView 抓取、专用解析器（X / YouTube / Bilibili / 抖音）、下载器与并发控制、Cookie 管理、FFmpeg 扩展管理。
- **两端契约**：Tauri command / event，见 [`API_CONTRACT.md`](API_CONTRACT.md)。
- **产物**：`apps/desktop/src-tauri/target/release/bundle/macos/CrawlBear.app`；发布用 `pnpm package:macos` 生成 `dist/CrawlBear-macOS.pkg|zip`。

### 3.2 `apps/website` —— 营销官网（`we.miework.cn/crawl-bear`）

- 单页滚动：Hero / 功能 / 预览 / 专站解析 / 安装 / 下载 / 页脚，中英双语（`src/i18n.ts`，跟随浏览器语言，可手动切换）。
- `SmartImage` 先探测 `public/assets/generated/*`，不存在就回退到 `public/assets/brand/*` 占位图，所以缺生图也能构建。
- `vite.config.ts` 的 `base` 由 `COS_PREFIX` 环境变量注入；`.github/workflows/website.yml` 负责构建与上传腾讯云 COS。

### 3.3 `promos/crawl-bear-promo` —— 营销短片（不参与应用构建）

- Remotion 工程：一段 54s、9 幕的产品短片，画面全部由 React 组件逐帧绘制，不依赖剪辑软件。
- 结构：`Root.tsx` 注册 Composition → `Promo.tsx` 排列 `<Sequence>` → `scenes/*` 各幕 → `components/*` 共享视觉组件 → `theme.ts` token。
- 音频：`scripts/make_audio.py` 用 numpy 合成木琴配乐 + 5 个 UI 音效；`PromoAudio.tsx` 用 `<Sequence>` 把 81 个音效钉在对应帧上。
- 图像升级：`ASSETS.md` 列出可选的 2K 小熊 / 贴纸生成清单（gpt-image-2 提示词）；`scripts/apply_art.py` 把生成图裁边缩放成 WebP，P1 图直接覆盖 `public/assets/brand/`，零改码。
- 产物：`pnpm render:promo` → `out/crawl-bear-promo.mp4`；`pnpm build:promo` → `dist/`（可部署的 bundle）。

---

## 4. workspace 与依赖约定

- 包列表在 [`pnpm-workspace.yaml`](../pnpm-workspace.yaml)：`apps/*` 与 `promos/*`。
- 每个包**自己声明**依赖，不共享 `node_modules`，因此各包可以独立升级（例如 TypeScript：桌面/官网 5.7，视频工程 5.9）。
- React 统一 **18**（桌面、官网、视频三个包一致），避免 workspace 里出现两套 React 类型。
- Remotion 相关包必须**整套同版本**（当前 `remotion` / `@remotion/cli` 都是 `4.0.484`）；升级时用 `pnpm --filter @crawl-bear/promo upgrade` 或同时改。
- 新增子包的步骤：
  1. 在 `apps/` 或 `promos/` 下建目录并写 `package.json`，`name` 用 `@crawl-bear/<名词>`、`private: true`、版本跟根包一致；
  2. `pnpm-workspace.yaml` 增加对应 glob（`apps/*`、`promos/*` 已覆盖）；
  3. 在根 `package.json` 加 `dev:<包>` / `build:<包>` 脚本；
  4. 在 `README.md` / `README.en.md` / 本文件的表格里登记。

### 根目录命令

| 命令 | 作用 |
| --- | --- |
| `pnpm install` | 安装全仓依赖（含 `promos/*`） |
| `pnpm dev:desktop` / `dev:web` / `dev:promo` | 分别启动桌面应用 / 官网 / 视频 Studio |
| `pnpm build` | `pnpm -r build`：桌面前端 + 官网 + 视频 bundle（CI 用这个） |
| `pnpm build:desktop` / `build:web` / `build:promo` | 单独构建某个包 |
| `pnpm render:promo` | 渲染宣传片 MP4（需要 Chrome，CI 不跑） |
| `pnpm assets` | 生图原稿 → WebP / 圆角图标 / 官网同步 |
| `pnpm test:rust` | Rust 单元测试 |
| `pnpm package:macos` | 打 macOS 分发包 |

---

## 5. 图片与音频资产流水线

```
design-assets/*.png                  ← 生图原稿（本地，不提交）
        │  python3 scripts/prepare_assets.py
        ├─→ apps/desktop/public/assets/bear-<mood>.webp     应用内小熊
        ├─→ apps/desktop/public/assets/paper-pattern.webp   纸纹
        ├─→ apps/desktop/public/assets/bear-logo.webp       圆角小图标
        ├─→ design-assets/app-icon-rounded.png               macOS 图标源
        └─→ apps/website/public/assets/brand/*              官网复用副本

promos/crawl-bear-promo/public/assets/generated/*.png   ← 视频专用 2K 生图（可选）
        │  pnpm --filter @crawl-bear/promo art
        ├─→ public/assets/brand/bear-<mood>.webp    P1：直接覆盖，立即生效
        ├─→ public/assets/brand/paper-pattern.webp  P3：纸纹底
        └─→ public/assets/generated/*.webp          P2/P3：需在场景里接线

promos/crawl-bear-promo/scripts/make_audio.py           ← 合成音频（无需素材）
        └─→ public/audio/music-bed.wav + pop/click/stamp/whoosh/chime.wav
```

规则：

- 生图**原稿永远放 `design-assets/`**（gitignored），各包 `public/` 里只放处理后的 WebP。
- 缺图自动回退：桌面端回退内置 SVG 小熊，官网回退 `brand/` 占位图，视频端直接用现有 WebP —— 任何一步没做都不影响构建。
- 界面截图放 `docs/screenshots/`（本地校验用，不提交）；README 用图放 `assets/readme/`（提交）。

---

## 6. 构建、测试与发布

| 流程 | 触发 | 内容 |
| --- | --- | --- |
| CI (`ci.yml`) | push / PR | `pnpm install --frozen-lockfile` → `pnpm build`（三个包的类型检查与构建，含视频 bundle）→ `pnpm test:rust` |
| 官网部署 (`website.yml`) | `main` push / PR | 构建官网，配置了 `COS_*` 变量时上传腾讯云 COS |
| 应用发布 (`release.yml`) | `v*` tag | 构建 universal macOS 包（arm64 + x86_64）、ad-hoc 签名、`.pkg` / `.zip` / SHA256 → GitHub Release |
| 视频渲染 | 手动 | `pnpm render:promo`（需要 Chrome Headless Shell，不进 CI） |

视频为什么不进 CI 渲染：渲染需要下载 Chrome 内核、64 帧并发跑几十秒到几分钟，属于「出片」动作；CI 只保证片子**能编译**（`remotion bundle`），这样场景代码写错会在 PR 阶段被发现。

---

## 7. 我该改哪里？

| 想做的事 | 去改 |
| --- | --- |
| 界面配色 / 字体 / 圆角 / 动效参数 | 先改 [`docs/design.md`](design.md)，再同步 `apps/*/src/styles.css`、`theme.ts`、`promos/*/src/theme.ts` |
| 桌面端功能（抓取、下载、解析器、设置） | `apps/desktop/src/`、`apps/desktop/src-tauri/src/` |
| 官网文案 / 板块 / 语言 | `apps/website/src/App.tsx`、`apps/website/src/i18n.ts` |
| 宣传片文案 / 分镜 / 时长 / 配乐 | `promos/crawl-bear-promo/src/lib/copy.ts`、`src/theme.ts`、`src/scenes/**`、`scripts/make_audio.py` |
| 小熊插画 / 应用图标 / 纸纹 | 生图 → `design-assets/` → `pnpm assets`（视频用图走 `promo/ASSETS.md` + `pnpm --filter @crawl-bear/promo art`） |
| 安装流程 / 签名 / 打包 | [`docs/INSTALL-macOS.md`](INSTALL-macOS.md)、`scripts/package_macos.sh`、`.github/workflows/release.yml` |
| Tauri 命令 / 事件 / 错误码 | [`docs/API_CONTRACT.md`](API_CONTRACT.md) → `src-tauri/src/` + `src/shared/api.ts` |
| 官网部署参数 | `.github/workflows/website.yml` + 仓库 Secrets/Variables |

---

## 8. 命名与提交约定

- 包名统一 `@crawl-bear/<名词>`；`private: true`；版本与根 `package.json` 同步（当前 `0.4.0`）。
- 文档语言：`README.md` / `README.en.md` 双语；`docs/` 全部中文；子包内的 `README.md` / `BRIEF.md` / `ASSETS.md` 中文。
- 提交时不要带产物：`dist/`、`apps/*/dist/`、`apps/*/src-tauri/target/`、`promos/*/out/`、`promos/*/dist/`、`design-assets/`、`docs/screenshots/`、`.tmp*` 均已在 `.gitignore` 中。
- 跨包改动（比如调整设计 token）请一次性覆盖三处：桌面端 CSS/theme、官网 CSS、视频 `theme.ts`，并同步 `docs/design.md`。
