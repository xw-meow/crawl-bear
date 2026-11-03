# CrawlBear 宣传短片 · 制作说明（BRIEF）

> 目标：54 秒、1920×1080 / 30fps 的产品宣传短片，用 Remotion 制作，可在 Remotion Studio 里逐帧预览与调整。
> 视觉唯一依据：仓库根目录 `docs/design.md`（品牌 token、文案、动效规范）。本文件只写「怎么把它变成视频」。

---

## 1. 影片定位

一只憨厚的小熊「爬爬」替你把网页里的图片、视频、音乐、字体一件件翻出来，收进采集袋。

- 情绪：**可靠、憨厚、有点笨拙但很努力**。不是黑客工具，不是冷冰冰的下载器。
- 视觉：奶油黄纸张 `#FFF7E8`、墨线描边 `#33261D`、硬投影（无模糊）、贴纸、手账、手绘。
- 文案声音：小熊是第一人称「我」，观众是「你」。动作词固定：**翻找**（爬取）、**收进采集袋**（下载）。

## 2. 技术基线

- 目录：`promos/crawl-bear-promo/`（pnpm workspace 子包，包名 `@crawl-bear/promo`）。
- Composition：`CrawlBearPromo`，`1920×1080`，`30fps`，总长 `1620` 帧 = 54s。
- 技术栈：React 18 + Remotion 4（**不要**引入 framer-motion / gsap / 任何新依赖；用 `remotion` 的 `spring` / `interpolate` / `useCurrentFrame`）。
- 时间轴由 `src/Promo.tsx` 持有，每个场景是一个 `<Sequence>`，**场景组件拿到的都是本地帧（从 0 开始）**。
- 背景（纸张 + 底纹 + 暗角）由 `Promo.tsx` 全局挂一次，**场景不要自己画背景**。
- 所有动画必须**确定性**：禁止 `Math.random()`，随机请用 `src/lib/anim.ts` 的 `seeded()` / `seededRange()`。
- 所有文字、颜色、描边、圆角、阴影必须取自 `src/theme.ts` 的 token（`COLORS` / `FONTS` / `INK` / `RADIUS` / `TYPE` / `shadow()`）。

## 3. 场景与帧窗口

| # | 场景 | 本地帧 | 时长 | 文件 | 负责人 |
|---|------|--------|------|------|--------|
| 1 | hook 钩子 | 0–149 | 5.0s | `src/scenes/Hook.tsx` | 已完成（风格基准） |
| 2 | problem 老办法 | 0–149 | 5.0s | `src/scenes/open/Problem.tsx` | open |
| 3 | paste 贴网址 | 0–149 | 5.0s | `src/scenes/open/Paste.tsx` | open |
| 4 | crawl 翻找中 | 0–239 | 8.0s | `src/scenes/core/Crawl.tsx` | core |
| 5 | results 结果页 | 0–239 | 8.0s | `src/scenes/core/Results.tsx` | core |
| 6 | collect 收进采集袋 | 0–209 | 7.0s | `src/scenes/close/Collect.tsx` | close |
| 7 | sites 专属解析 | 0–164 | 5.5s | `src/scenes/open/Sites.tsx` | open |
| 8 | privacy 本机运行 | 0–119 | 4.0s | `src/scenes/close/Privacy.tsx` | close |
| 9 | outro 落版 | 0–194 | 6.5s | `src/scenes/close/Outro.tsx` | close |

**转场约定**：相邻场景不做叠化。每个场景自己负责入场（0–20 帧内建立画面）与出场（最后 12–16 帧上移淡出/元素收起），接缝靠「贴纸砸入 + 纸片上移」保持节奏。场景首帧不得全黑/全空超过 6 帧，末帧不得保留会与下一场景打架的元素。

## 4. 组件库（都已实现，直接用）

全部从 `src/components/*` 导入。**不要修改这些共享组件**；需要新变体请在自己的场景文件里用 div 组合。

```tsx
// 标题系统：eyebrow 贴纸 + 逐行「写出来」擦除 + 蜂蜜马克笔下划线 + 副文案
<SceneTitle eyebrow="正在翻找" lines={["钻进网页，", "一件件翻。"]} sub="…"
  startFrame={6} titleSize={96} subSize={36} width={860} highlightLast />

// 熊（自动加载 public/assets/brand/bear-<mood>.webp）
<Mascot mood="crawl" height={620} enterAt={20} enterFrom="bottom" bob={10} sway={1.6}
  style={{ position: "absolute", right: 120, bottom: 60 }} />
// mood: hero | crawl | happy | empty | error | login

// 对话气泡
<Bubble text="交给我。" fontSize={34} tail="down" rotate={-1.5} />

// 卡片面板：墨线 + 硬投影；handDrawn 为手绘歪圆角
<InkPanel rotate={-0.6} padding={28} radius={RADIUS.md} shadowSize={8} handDrawn>{…}</InkPanel>

// 贴纸胶囊 / 计数圆点
<Sticker tone="honey" size="md" rotate={-2} icon={<Icon/>}>图片</Sticker>
<CountBubble value={12} size={32} />

// 按钮
<Button label="开始翻找" tone="berry" size="md" press={0.6} icon={<DownloadIcon size={30}/>} />

// 一体式搜索胶囊（内部自带输入文字 + 按钮）
<SearchCapsule width={1240} height={148} text={typedText} focused={1} press={0.4} />

// 蜂蜜进度条（百分比居中 + 流光）
<ProgressHoney width={940} height={76} progress={0.68} label="翻找中…" />

// 结果卡片（还原 App 真实卡片）
<MediaCard kind="video" name="forest.mp4" meta="example.com · 01:03" tone="sky"
  width={300} selected={false} stamped={false} />
// kind: image | video | music | font；tone: sky | leaf | berry | paper

// 结果页筛选 chip
<FilterChip label="图片" value={5} active icon={<ImageIcon size={22}/>} />

// 采集袋吸底栏
<BagBar selected={8} press={0} done={false} width={760} />

// 站点卡片（X / YouTube / Bilibili / 抖音，自带手绘风 logo）
<SiteBadge site="youtube" name="YouTube" note="1080P H.264 合并 MP4" width={380} active={0.6} />

// 品牌组合标
<Wordmark size={1} align="row" />

// 图标（线性、墨色、手绘感）
ImageIcon VideoIcon MusicIcon FontIcon GlobeIcon CheckIcon DownloadIcon
ArrowRightIcon LockIcon ShieldIcon CloudOffIcon SparkIcon BagIcon EyeIcon
FolderIcon CursorIcon PlusIcon MinusIcon XMark YouTubeMark BilibiliMark DouyinMark
// 用法：<ImageIcon size={40} color={COLORS.ink} strokeWidth={3} />

// 手绘装饰
PawPrint Sparkle MarkerUnderline ArrowDoodle CircleScribble TickMark CrossMark StampRing
// 用法：<PawPrint size={40} color={COLORS.fur} rotate={-8} />
//       <MarkerUnderline width={420} progress={0.8} />
//       <Sparkle size={36} color={COLORS.honey} />
//       <StampRing label="已收" color={COLORS.leaf} size={120} />
```

## 5. 动画工具箱（`src/lib/anim.ts`）

```ts
clamp lerp easeOut easeInOut easeOutBack ramp fadeIn fadeOut inOut
springAt(frame, startFrame, config)      // 通用 spring 0→1
SPRINGS.heavy / smooth / soft / bouncy / quick
entrance(frame, startFrame, SPRINGS.smooth) // {opacity, transform}
stickerSlam(frame, startFrame, rotation)    // 贴纸砸入 {opacity, transform}
float(frame, amplitude, periodFrames, phase) // 上下浮动
drift(frame, amplitude, periodFrames, phase) // 缓慢漂移
seeded(seed) / seededRange(seed, min, max)   // 确定性伪随机
blink(frame)                                  // 光标闪烁
countUp(frame, from, to, startFrame, duration) // 数字滚动
typed(frame, text, startFrame, charsPerFrame)  // 打字机
range(frame, [in0,in1], [out0,out1])
```
**动效原则**（design.md §7）：spring 为主，stagger 间隔 6–14 帧；入场从下方 20–40px 弹入；出场 12–16 帧收干净。禁止整屏粒子、连续闪烁。

## 6. 版式与字号（1920×1080）

- 安全边距 `SAFE = 120`，建议标题区 x 从 120 起，内容不越过 1800。
- 主标题 96–116px（`FONTS.display`，`Hannotate SC` 手札体，行高 1.16，字距 -1.5）
- 场景标题 76–96px；卡片/按钮 30–44px；正文 30–38px（`FONTS.body` / `PingFang SC`）；小字 22–26px；数字用 `FONTS.mono`。
- 一屏只讲一件事：`SceneTitle` 在左、主体视觉在右，或标题在上、主体在下的居中构图。**不要**三条以上并列信息块。
- 色彩比例：奶油底 65%、卡片 20%、墨线 10%、蜂蜜/浆果 5%。一屏里浆果红（`COLORS.berry`）只出现在一个主行动/强调元素上。

## 7. 文案

所有文案已写在 `src/lib/copy.ts`（`COPY` / `MEDIA_ITEMS`），**直接 import，不要改这个文件**（公共文件，改动前先确认）。需要新增句子请在自己的场景文件里本地定义常量，并在交付说明里写清楚。

## 8. 验收与自检

```bash
cd promos/crawl-bear-promo
npx tsc --noEmit          # 必须 0 error（只关心自己文件的报错，别人正在写的文件可能暂时报错）
```
- 不要运行 `npx remotion render` / `npx remotion still`（由维护者统一渲染校验，避免并行打包冲突）。
- 交付时在回复里写：实现了哪些场景、每个场景 3–5 个关键节拍（帧号）、用到的组件、是否有自造视觉。
- **文件所有权**：只改自己负责的场景文件（+ 自己目录下的新文件）。`src/theme.ts`、`src/lib/*`、`src/components/*`、`src/Promo.tsx`、`src/Root.tsx`、`src/scenes/Hook.tsx` 是公共文件，改了会影响所有场景；需要新增共享能力前先沟通。
