# CrawlBear 宣传短片 · 图像素材清单（gpt-image-2）

> 配套影片：`CrawlBearPromo` · 1920×1080 · 30fps · 54s（1620 帧）
> 生图工具：gpt-image-2（或其他支持透明底的图像模型）
> 落地目录：`promos/crawl-bear-promo/public/assets/generated/`
> 处理脚本：`promos/crawl-bear-promo/scripts/apply_art.py`（裁透明边 → 长边 ≤ 2048 → WebP → 覆盖 `public/assets/brand/`）
> 角色、配色、画风与仓库根 [`docs/assets.md`](../../docs/assets.md)、[`apps/website/ASSETS.md`](../../apps/website/ASSETS.md) 保持一致，本文只写「视频版」的差异。

---

## 0. 怎么用（3 步，10 分钟）

1. **生成**：按下面 §3 / §4 / §5 的提示词生图。每条提示词都是**完整可复制**的（已包含风格前缀 + 角色设定），直接整段粘进 gpt-image-2 即可；negative prompt 单独一栏，工具有独立输入框就贴进去，没有就接在提示词末尾。
2. **落位**：把生成的 **PNG** 放进 `promos/crawl-bear-promo/public/assets/generated/`，文件名必须和清单一致（例如 `bear-hero@2k.png`）。
3. **接入**：

```bash
cd promos/crawl-bear-promo

# ① 先空跑：确认文件名都对上、看看会改哪些文件
python3 scripts/apply_art.py --dry-run

# ② 真处理：裁掉透明边 → 长边缩到 2048 → 转 WebP
python3 scripts/apply_art.py

# ③ 类型检查（P1 不需要改任何代码）
npx tsc --noEmit
```

- **P1 生成后即生效**：脚本会直接覆盖 `public/assets/brand/bear-<mood>.webp`，`<Mascot>` 组件本来就读这几个文件，**不用改代码、不用重启 Studio**（Studio 里刷新一下即可）。
- **P2 / P3 需要接线**：脚本把结果写到 `public/assets/generated/*.webp`，加进画面需要在对应场景改一行代码（每条都附了建议片段）。
- 目录为空完全没关系：影片照常用现有 960px 的 WebP 渲染，`apply_art.py` 会打印「Nothing to process」并正常退出。
- 若 `python3` 缺 Pillow，用 DSH 运行时的解释器：
  `/Users/dengwei.daviant/.dsh/dsh-runtimes/dsh-primary-runtime/dependencies/python/bin/python3 scripts/apply_art.py`

**生成参数建议**

| 项 | 建议 |
| --- | --- |
| 角色图比例 | 1:1（正方形，2048×2048 最佳；工具只给 1536 或 1024 也能用，脚本按实际长边处理） |
| 纸纹比例 | 16:9（2048×1152 最佳） |
| 背景 | **透明底优先**（PNG with alpha）。工具不支持透明底时就用奶油底 `#FFF7E8`，`apply_art.py` 会自动把四角连通的奶油背景抠掉再裁边 |
| 构图 | 角色全身、居中、四周留出宽敞的透明边距，耳朵和爪子绝对不要出画 |
| 不要 | 不要文字、不要水印、不要 UI、不要投影/渐变/3D 质感 |
| 为什么 2048 | 成片里小熊最高约 720–760px，2K 源约等于 2 倍余量；以后导 4K 也不糊 |

---

## 1. 统一风格前缀（每条提示词里都已经包含，这里是便于你单独微调）

### 1.1 角色插画前缀（P1 / P2 用）

```
Hand-drawn comic illustration for a cozy macOS app mascot, designed for a 16:9
1920x1080 animated promo film. A chubby, honest-looking brown bear with round ears,
a cream muzzle, small oval eyes, thick warm-ink outlines (2.5px equivalent), flat
warm colors, soft paper texture, no gradients, no shadows, no text, no watermark.
Children's picture-book comic style, slightly wobbly hand-drawn linework, friendly
and a bit clumsy. Isolated character on a fully transparent background, generous
empty margin around the whole body, full body visible, nothing cropped.
Character: "Papa" the crawler bear — chubby body, honey-brown fur (#B97B43), cream
muzzle and belly (#F0D3A7), round black-ink eyes with tiny eyebrows, no clothes
except a small canvas satchel with a leaf-shaped buckle.
```

### 1.2 贴纸 / 道具前缀（P3 的 sticker / stamp 用）

```
Hand-drawn comic sticker for a cozy macOS app promo film, matching a children's
picture-book mascot world. Thick warm-ink outline (#33261D), flat warm colors, soft
paper texture, slightly wobbly hand-drawn linework, no gradients, no drop shadow,
no text, no watermark, no white die-cut border. Isolated on a fully transparent
background, centered, generous transparent margin.
```

### 1.3 纸纹前缀（P3 的 paper-texture 用）

```
Extremely subtle decorative paper texture for a cozy hand-drawn film: flat cream
paper #FFF7E8, very low contrast, calm, about 90% empty space, soft paper grain,
a few widely spaced tiny paw prints and honey-yellow dots, one or two thin wobbly
line swashes. No characters, no text, no logos, no photo frames, no large icons,
no gradients, no shadows, no dark areas, no visible borders. One single 16:9
background sheet designed to be stretched with "cover" (does not need to tile).
```

### 1.4 统一 negative prompt（所有角色图通用，每条也单独列了）

```
negative prompt: photorealistic, 3D render, CGI, glossy plastic, neon colors,
gradients, drop shadow, cast shadow, dark background, text, letters, words,
watermark, logo, signature, busy background, human hands, extra limbs,
extra fingers, realistic fur texture, scary expression, frame border,
UI screenshot, cropped character, cut-off ears, low resolution, jpeg artifacts
```

> 提示词里出现的「letter A type icon」「paw print」是图标/图形，不是文字；除此之外画面里不要有任何可读文字（文案全部由代码排版）。

---

## 2. 速查表（共 11 条：P1 4 张必做 · P2 3 张可选 · P3 4 张可选）

| # | 优先级 | 文件名（放进 `generated/`） | 尺寸 / 比例 | 用在哪一幕 | 建议摆位 | 生成后 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | **P1 必做** | `bear-hero@2k.png` | 2048×2048 / 1:1 / 透明 | hook 钩子 0:00–0:05（paste 0:10–0:15 复用） | hook 右侧高 720px；paste 右下 410px | 自动覆盖 `bear-hero.webp` |
| 2 | **P1 必做** | `bear-crawl@2k.png` | 2048×2048 / 1:1 / 透明 | crawl 翻找中 0:15–0:23 | 左下（left:90 / bottom:-10），高 560px | 自动覆盖 `bear-crawl.webp` |
| 3 | **P1 必做** | `bear-happy@2k.png` | 2048×2048 / 1:1 / 透明 | collect 0:31–0:38；outro 0:47.5–0:54 | collect 右下高 320px；outro 右侧高 620px | 自动覆盖 `bear-happy.webp` |
| 4 | **P1 必做** | `bear-error@2k.png` | 2048×2048 / 1:1 / 透明 | problem 老办法 0:05–0:10 | 左下（left:48 / bottom:46），高 430px | 自动覆盖 `bear-error.webp` |
| 5 | P2 可选 | `bear-search@2k.png` | 2048×2048 / 1:1 / 透明 | crawl 0:15–0:23（替换/交替 bear-crawl） | 左下，高 560–700px | 输出到 `generated/`，**需要接线** |
| 6 | P2 可选 | `bear-present@2k.png` | 2048×2048 / 1:1 / 透明 | collect 0:31–0:38（替换 bear-happy） | 右下，高 320–400px | 输出到 `generated/`，**需要接线** |
| 7 | P2 可选 | `bear-wink@2k.png` | 2048×2048 / 1:1 / 透明 | outro 落版 0:47.5–0:54（替换 bear-happy） | 右侧（right:190 / bottom:34），高 620px | 输出到 `generated/`，**需要接线** |
| 8 | P3 可选 | `paper-texture@2k.png` | 2048×1152 / 16:9 / 不透明 | 全片背景 0:00–0:54 | `cover` 铺满，无摆位 | 自动覆盖 `paper-pattern.webp` |
| 9 | P3 可选 | `sticker-paw@2k.png` | 1024×1024 / 1:1 / 透明 | 全片底部章节爪印 + outro 装饰 | 22–28px 小图标 | 输出到 `generated/`，**需要接线** |
| 10 | P3 可选 | `sticker-honey-jar@2k.png` | 1024×1024 / 1:1 / 透明 | outro 落版 / collect 完成装饰 | 宽 120–180px，放品牌块与小熊之间 | 输出到 `generated/`，**需要接线** |
| 11 | P3 可选 | `stamp-collected@2k.png` | 1024×1024 / 1:1 / 透明 | collect 盖章 0:34.9–0:36.3 | 卡片角 90–120px / 采集袋印章 108px | 输出到 `generated/`，**需要接线** |


> 补充：`apply_art.py` 的映射表里还支持 `bear-empty@2k.png` / `bear-login@2k.png`（现有空状态 / 登录 mood 的 2K 替换，姿势提示词见仓库根 `docs/assets.md` §3、§5）。宣传片主要用上面 4 个 mood，所以这两张不算在 11 条里；需要时按同样的风格前缀生成、同名放入 `generated/` 再跑脚本即可自动覆盖。

**分级含义**

- **P1 建议（4 张）**：成片里小熊最高显示 720px，现有 960px WebP 是缩小使用的，**不糊，片子现在就能直接出**；这 4 张是和现有 `mood` 一一对齐的 2K 母版，换上后细节更足（毛边、爪子、采集袋缝线更清楚），以后导 4K 或做海报也不虚，**零代码改动**。
- **P2 可选（3 张）**：给「翻找中 / 递卡片 / 落版」增加新姿势，画面更有叙事感；需要在对应场景里改一行接入（每条附了片段）。
- **P3 可选（4 张）**：纸纹质感和手账贴纸，属于锦上添花；不做也完全不影响成片。

---

## 3. P1 · 替换现有 4 个 mood（必做）

### 3.1 `bear-hero@2k.png` — 首屏主形象

| 项 | 内容 |
| --- | --- |
| 文件名 | `bear-hero@2k.png` → 输出 `public/assets/brand/bear-hero.webp` |
| 尺寸 / 比例 | 2048×2048，1:1，透明底 PNG |
| 用在哪一幕 | **hook 钩子（0:00–0:05，帧 0–149）**：画面右侧主视觉，当前代码 `<Mascot mood="hero" height={720} style={{right:236, bottom:54}} />`；**paste 贴网址（0:10–0:15）**再用一次：`height={420} style={{right:120, bottom:40}}` |
| 建议摆位 | hook：右侧 35% 区域、高 720px（占屏高约 2/3），左侧 55% 是标题安全区，角色居中、左右留白对称即可，右下角不要伸到画面底部 60px 内（章节爪印在 bottom:30）；paste：右下角小尺寸 420px，别挡住居中的搜索胶囊（胶囊 y≈372–528） |

**提示词（整段复制）**

```
Hand-drawn comic illustration for a cozy macOS app mascot, designed for a 16:9
1920x1080 animated promo film. A chubby, honest-looking brown bear with round ears,
a cream muzzle, small oval eyes, thick warm-ink outlines (2.5px equivalent), flat
warm colors, soft paper texture, no gradients, no shadows, no text, no watermark.
Children's picture-book comic style, slightly wobbly hand-drawn linework, friendly
and a bit clumsy. Isolated character on a fully transparent background, generous
empty margin around the whole body, full body visible, nothing cropped.
Character: "Papa" the crawler bear — chubby body, honey-brown fur (#B97B43), cream
muzzle and belly (#F0D3A7), round black-ink eyes with tiny eyebrows, no clothes
except a small canvas satchel with a leaf-shaped buckle.

Papa stands upright on two legs, facing the viewer with a warm open-mouth smile and
bright friendly eyes, three-quarter view. With one paw he holds his canvas satchel
open; the other paw is raised in a friendly wave. A few tiny flat media icons float
up out of the satchel: a photo, a play button, a music note and a small letter "A"
type icon (simple icons only, no other text). Full body, centered, slightly top-heavy
cute proportions, generous transparent margin, ears and paws fully inside the frame.
```

**Negative prompt**

```
negative prompt: photorealistic, 3D render, CGI, glossy plastic, neon colors,
gradients, drop shadow, cast shadow, dark background, text, letters, words,
watermark, logo, signature, busy background, human hands, extra limbs, extra fingers,
realistic fur texture, scary expression, frame border, UI screenshot, cropped
character, cut-off ears, low resolution
```

**接入**：跑 `python3 scripts/apply_art.py`，自动覆盖 `public/assets/brand/bear-hero.webp`，**无需改代码**。

---

### 3.2 `bear-crawl@2k.png` — 翻找中

| 项 | 内容 |
| --- | --- |
| 文件名 | `bear-crawl@2k.png` → 输出 `public/assets/brand/bear-crawl.webp` |
| 尺寸 / 比例 | 2048×2048，1:1，透明底 PNG |
| 用在哪一幕 | **crawl 翻找中（0:15–0:23，帧 450–689）**：画面布局是「标题左上 + 小熊左下 + 翻找面板右侧（x 920–1800）」 |
| 建议摆位 | 左下 `left:90, bottom:-10`，高 560px（当前代码数值）；图里纸堆向右伸没关系，但**左上方 60px 内别放高对比元素**（标题在 left:120/top:84），画面底部会压到 edge，最下面的脚爪可以被裁一点点 |

**提示词（整段复制）**

```
Hand-drawn comic illustration for a cozy macOS app mascot, designed for a 16:9
1920x1080 animated promo film. A chubby, honest-looking brown bear with round ears,
a cream muzzle, small oval eyes, thick warm-ink outlines (2.5px equivalent), flat
warm colors, soft paper texture, no gradients, no shadows, no text, no watermark.
Children's picture-book comic style, slightly wobbly hand-drawn linework, friendly
and a bit clumsy. Isolated character on a fully transparent background, generous
empty margin around the whole body, full body visible, nothing cropped.
Character: "Papa" the crawler bear — chubby body, honey-brown fur (#B97B43), cream
muzzle and belly (#F0D3A7), round black-ink eyes with tiny eyebrows, no clothes
except a small canvas satchel with a leaf-shaped buckle.

Papa kneels on the floor enthusiastically digging through a messy pile of blank paper
web pages, holding a large round magnifying glass in one paw and lifting a paper page
with the other. His canvas satchel lies open beside him with a few tiny media icons
spilling out: a photo, a play button, a music note and a small letter "A" type icon.
Motion lines around the magnifying glass, one small sweat drop, determined happy
expression, ears perked. Three-quarter view facing slightly to his left, full body,
generous transparent margin. The paper pages are drawn with wobbly linework and are
blank — no readable text on them.
```

**Negative prompt**

```
negative prompt: photorealistic, 3D render, CGI, glossy plastic, neon colors,
gradients, drop shadow, cast shadow, dark background, text, letters, words,
watermark, logo, signature, busy background, human hands, extra limbs, extra fingers,
realistic fur texture, scary expression, frame border, UI screenshot, cropped
character, cut-off ears, low resolution
```

**接入**：跑 `python3 scripts/apply_art.py`，自动覆盖 `public/assets/brand/bear-crawl.webp`，**无需改代码**。

---

### 3.3 `bear-happy@2k.png` — 收进采集袋完成

| 项 | 内容 |
| --- | --- |
| 文件名 | `bear-happy@2k.png` → 输出 `public/assets/brand/bear-happy.webp` |
| 尺寸 / 比例 | 2048×2048，1:1，透明底 PNG |
| 用在哪一幕 | **collect 收进采集袋（0:31–0:38，帧 930–1139）**：0:35 前后 BagBar 变「收好了，8 件都在袋子里」，小熊抱鼓鼓的采集袋从右下弹入；**outro 落版（0:47.5–0:54）**再用一次，高 620px 站右侧 |
| 建议摆位 | collect：`height={320}`, `right:16, bottom:12`（当前代码），贴在右下角、压在结果页面上方，别压住袋子上方 160px 的 BagBar；outro：`height={620}`, `right:190, bottom:34`，左侧留给品牌字标 / 网址 / 下载按钮 |

**提示词（整段复制）**

```
Hand-drawn comic illustration for a cozy macOS app mascot, designed for a 16:9
1920x1080 animated promo film. A chubby, honest-looking brown bear with round ears,
a cream muzzle, small oval eyes, thick warm-ink outlines (2.5px equivalent), flat
warm colors, soft paper texture, no gradients, no shadows, no text, no watermark.
Children's picture-book comic style, slightly wobbly hand-drawn linework, friendly
and a bit clumsy. Isolated character on a fully transparent background, generous
empty margin around the whole body, full body visible, nothing cropped.
Character: "Papa" the crawler bear — chubby body, honey-brown fur (#B97B43), cream
muzzle and belly (#F0D3A7), round black-ink eyes with tiny eyebrows, no clothes
except a small canvas satchel with a leaf-shaped buckle.

Papa hugs his canvas satchel, which is comically bulging and overflowing with tiny
flat media icons: a photo, a play button, a music note and a small letter "A" type
icon. Big joyful closed-eye smile, round cheeks, little star sparkles and paw-print
confetti around him, both feet slightly off the ground in a happy hop. Celebratory
but simple flat comic style, full body, centered, generous transparent margin, ears
and paws fully inside the frame, no cropping.
```

**Negative prompt**

```
negative prompt: photorealistic, 3D render, CGI, glossy plastic, neon colors,
gradients, drop shadow, cast shadow, dark background, text, letters, words,
watermark, logo, signature, busy background, human hands, extra limbs, extra fingers,
realistic fur texture, scary expression, frame border, UI screenshot, cropped
character, cut-off ears, low resolution
```

**接入**：跑 `python3 scripts/apply_art.py`，自动覆盖 `public/assets/brand/bear-happy.webp`，**无需改代码**。

---

### 3.4 `bear-error@2k.png` — 老办法的抓狂 / 需要登录

| 项 | 内容 |
| --- | --- |
| 文件名 | `bear-error@2k.png` → 输出 `public/assets/brand/bear-error.webp` |
| 尺寸 / 比例 | 2048×2048，1:1，透明底 PNG |
| 用在哪一幕 | **problem 老办法（0:05–0:10，帧 150–299）**：小熊被同一团绳子缠住，站在**左下**，右侧是失败的浏览器窗口、中下方是 4 张痛点贴纸 |
| 建议摆位 | `height={400}`, `left:48, bottom:40`（当前代码），会叠一点在浏览器窗口左下角前；「这也太费劲了…」气泡固定在其右侧 `left:158, top:512`，所以**小熊右上方 200px 内留空**别放复杂道具 |

**提示词（整段复制）**

```
Hand-drawn comic illustration for a cozy macOS app mascot, designed for a 16:9
1920x1080 animated promo film. A chubby, honest-looking brown bear with round ears,
a cream muzzle, small oval eyes, thick warm-ink outlines (2.5px equivalent), flat
warm colors, soft paper texture, no gradients, no shadows, no text, no watermark.
Children's picture-book comic style, slightly wobbly hand-drawn linework, friendly
and a bit clumsy. Isolated character on a fully transparent background, generous
empty margin around the whole body, full body visible, nothing cropped.
Character: "Papa" the crawler bear — chubby body, honey-brown fur (#B97B43), cream
muzzle and belly (#F0D3A7), round black-ink eyes with tiny eyebrows, no clothes
except a small canvas satchel with a leaf-shaped buckle.

Papa stands tangled in a soft tangle of thick yarn, holding a tiny brass key in one
paw, scratching his head with the other, with a sheepish apologetic smile and one
eyebrow raised. His canvas satchel hangs at his side, one ear slightly drooped.
Gentle humor, not scary, full body, centered, generous transparent margin, no
cropping.
```

**Negative prompt**

```
negative prompt: photorealistic, 3D render, CGI, glossy plastic, neon colors,
gradients, drop shadow, cast shadow, dark background, text, letters, words,
watermark, logo, signature, busy background, human hands, extra limbs, extra fingers,
realistic fur texture, scary expression, frame border, UI screenshot, cropped
character, cut-off ears, low resolution
```

**接入**：跑 `python3 scripts/apply_art.py`，自动覆盖 `public/assets/brand/bear-error.webp`，**无需改代码**。

---

## 4. P2 · 新姿势（可选，生成后**需要接线** 接线）

> 这 3 张没有现成的 mood 文件可覆盖，`apply_art.py` 会把处理好的 WebP 写到
> `promos/crawl-bear-promo/public/assets/generated/bear-<name>.webp`，需要在对应场景里用 `<Mascot src="…" />` 接入。
> 你也可以直接把本节交给维护者，附上「生图已完成」即可。

### 4.1 `bear-search@2k.png` — 举放大镜钻进网页纸堆

| 项 | 内容 |
| --- | --- |
| 文件名 | `bear-search@2k.png` → 输出 `public/assets/generated/bear-search.webp` |
| 尺寸 / 比例 | 2048×2048，1:1，透明底 PNG |
| 用在哪一幕 | **crawl 翻找中（0:15–0:23）**：替换 `bear-crawl` 或交替出现，表现「钻进网页里找」 |
| 建议摆位 | 左下 `left:90, bottom:-10`，高 560–700px；右侧是翻找面板（x 920 起），别让放大镜伸过画面中心线 |

**提示词（整段复制）**

```
Hand-drawn comic illustration for a cozy macOS app mascot, designed for a 16:9
1920x1080 animated promo film. A chubby, honest-looking brown bear with round ears,
a cream muzzle, small oval eyes, thick warm-ink outlines (2.5px equivalent), flat
warm colors, soft paper texture, no gradients, no shadows, no text, no watermark.
Children's picture-book comic style, slightly wobbly hand-drawn linework, friendly
and a bit clumsy. Isolated character on a fully transparent background, generous
empty margin around the whole body, full body visible, nothing cropped.
Character: "Papa" the crawler bear — chubby body, honey-brown fur (#B97B43), cream
muzzle and belly (#F0D3A7), round black-ink eyes with tiny eyebrows, no clothes
except a small canvas satchel with a leaf-shaped buckle.

Papa leans forward and dives both paws into a big pile of blank paper web pages,
pushing his head into the pile while holding a large round magnifying glass up to one
eye; loose blank pages fly into the air around him. Canvas satchel hangs on his
shoulder, curious determined smile, one eyebrow raised. Dynamic but tidy composition,
motion lines around the page pile, three-quarter view facing slightly left, full body,
generous transparent margin, no readable text on the pages.
```

**Negative prompt**

```
negative prompt: photorealistic, 3D render, CGI, glossy plastic, neon colors,
gradients, drop shadow, cast shadow, dark background, text, letters, words,
watermark, logo, signature, busy background, human hands, extra limbs, extra fingers,
realistic fur texture, scary expression, frame border, UI screenshot, cropped
character, cut-off ears, low resolution
```

**接入**：跑脚本后把下面这行交给维护者：

```tsx
<Mascot src="assets/generated/bear-search.webp" height={620} enterAt={18}
  style={{ position: "absolute", left: 90, bottom: -10 }} />
```

---

### 4.2 `bear-present@2k.png` — 双手捧一叠媒体卡片递向镜头

| 项 | 内容 |
| --- | --- |
| 文件名 | `bear-present@2k.png` → 输出 `public/assets/generated/bear-present.webp` |
| 尺寸 / 比例 | 2048×2048，1:1，透明底 PNG |
| 用在哪一幕 | **collect 收进采集袋（0:31–0:38）**：可以替换 `bear-happy`，或让两张图分先后出现（勾选阶段 present → 完成阶段 happy） |
| 建议摆位 | 右下 `right:16, bottom:12` 附近，高 320–400px；卡片朝画面中下方递出，指向采集袋（BagBar 在 left:960 居中、y≈880） |

**提示词（整段复制）**

```
Hand-drawn comic illustration for a cozy macOS app mascot, designed for a 16:9
1920x1080 animated promo film. A chubby, honest-looking brown bear with round ears,
a cream muzzle, small oval eyes, thick warm-ink outlines (2.5px equivalent), flat
warm colors, soft paper texture, no gradients, no shadows, no text, no watermark.
Children's picture-book comic style, slightly wobbly hand-drawn linework, friendly
and a bit clumsy. Isolated character on a fully transparent background, generous
empty margin around the whole body, full body visible, nothing cropped.
Character: "Papa" the crawler bear — chubby body, honey-brown fur (#B97B43), cream
muzzle and belly (#F0D3A7), round black-ink eyes with tiny eyebrows, no clothes
except a small canvas satchel with a leaf-shaped buckle.

Papa stands facing the viewer and presents a fanned stack of small flat media cards
to the camera with both paws: one photo card, one play-button card, one music-note
card, one small letter "A" type card. Proud warm smile, eyes slightly narrowed with
delight, satchel hanging on his shoulder. The cards are held at chest height, tilted
slightly toward the camera and toward the lower left. Full body, centered, generous
transparent margin, no cropping, no text besides the single tiny "A" type icon.
```

**Negative prompt**

```
negative prompt: photorealistic, 3D render, CGI, glossy plastic, neon colors,
gradients, drop shadow, cast shadow, dark background, text, letters, words,
watermark, logo, signature, busy background, human hands, extra limbs, extra fingers,
realistic fur texture, scary expression, frame border, UI screenshot, cropped
character, cut-off ears, low resolution
```

**接入**：跑脚本后把下面这行交给维护者：

```tsx
<Mascot src="assets/generated/bear-present.webp" height={320} enterAt={18}
  style={{ position: "absolute", right: 16, bottom: 12 }} />
```

---

### 4.3 `bear-wink@2k.png` — 眨眼竖大拇指

| 项 | 内容 |
| --- | --- |
| 文件名 | `bear-wink@2k.png` → 输出 `public/assets/generated/bear-wink.webp` |
| 尺寸 / 比例 | 2048×2048，1:1，透明底 PNG |
| 用在哪一幕 | **outro 落版（0:47.5–0:54）**：替换 `bear-happy`，与左侧 Wordmark、网址 `we.miework.cn/crawl-bear`、下载按钮同屏 |
| 建议摆位 | 右侧 `right:190, bottom:34`，高 620px；左侧 x 120 起是品牌块，两者互不遮挡 |

**提示词（整段复制）**

```
Hand-drawn comic illustration for a cozy macOS app mascot, designed for a 16:9
1920x1080 animated promo film. A chubby, honest-looking brown bear with round ears,
a cream muzzle, small oval eyes, thick warm-ink outlines (2.5px equivalent), flat
warm colors, soft paper texture, no gradients, no shadows, no text, no watermark.
Children's picture-book comic style, slightly wobbly hand-drawn linework, friendly
and a bit clumsy. Isolated character on a fully transparent background, generous
empty margin around the whole body, full body visible, nothing cropped.
Character: "Papa" the crawler bear — chubby body, honey-brown fur (#B97B43), cream
muzzle and belly (#F0D3A7), round black-ink eyes with tiny eyebrows, no clothes
except a small canvas satchel with a leaf-shaped buckle.

Papa stands with a confident friendly pose, giving a big thumbs-up with one paw and
winking with the other eye, a small open-mouth smile. Canvas satchel on his shoulder,
the other paw relaxed at his side. Charming, a little goofy, full body, centered,
generous transparent margin, ears and paws fully inside the frame, no cropping.
```

**Negative prompt**

```
negative prompt: photorealistic, 3D render, CGI, glossy plastic, neon colors,
gradients, drop shadow, cast shadow, dark background, text, letters, words,
watermark, logo, signature, busy background, human hands, extra limbs, extra fingers,
realistic fur texture, scary expression, frame border, UI screenshot, cropped
character, cut-off ears, low resolution
```

**接入**：跑脚本后把下面这行交给维护者：

```tsx
<Mascot src="assets/generated/bear-wink.webp" height={620} enterAt={14}
  style={{ position: "absolute", right: 190, bottom: 34 }} />
```

---

## 5. P3 · 质感与贴纸（可选）

### 5.1 `paper-texture@2k.png` — 全片纸纹底

| 项 | 内容 |
| --- | --- |
| 文件名 | `paper-texture@2k.png` → 输出 `public/assets/brand/paper-pattern.webp`（覆盖全片纸张底纹） |
| 尺寸 / 比例 | 2048×1152，16:9，不透明（带奶油底） |
| 用在哪一幕 | **全片背景（0:00–0:54）**：`PaperBackground` 以 `cover` 铺满、透明度约 0.45，之上还有暗角与暖光 |
| 说明 | 这是「单张铺满」的背景，不是平铺纹理，所以**不需要无缝**、也不要用重复图案；重点是干净、低对比，不能和正文抢注意力 |

**提示词（整段复制）**

```
Extremely subtle decorative paper texture for a cozy hand-drawn film: flat cream
paper #FFF7E8, very low contrast, calm, about 90% empty space, soft paper grain,
a few widely spaced tiny paw prints and honey-yellow dots, one or two thin wobbly
line swashes. No characters, no text, no logos, no photo frames, no large icons,
no gradients, no shadows, no dark areas, no visible borders. One single 16:9
background sheet designed to be stretched with "cover" (does not need to tile).
Muted warm brown doodles at 10-15% opacity, designed to sit behind UI and video
content without reducing readability.
```

**Negative prompt**

```
negative prompt: characters, bear, text, letters, words, watermark, logo, large
icons, photo frames, heavy grain, high contrast, dark areas, gradients, shadows,
borders, seams, tiling pattern, busy composition, saturated colors
```

**接入**：跑脚本自动覆盖 `public/assets/brand/paper-pattern.webp`，**无需改代码**。覆盖前想留底，先把现有的 `paper-pattern.webp` 复制到别处。

---

### 5.2 `sticker-paw@2k.png` — 爪印贴纸

| 项 | 内容 |
| --- | --- |
| 文件名 | `sticker-paw@2k.png` → 输出 `public/assets/generated/sticker-paw.webp` |
| 尺寸 / 比例 | 1024×1024，1:1，透明底 PNG |
| 用在哪一幕 | 全片底部**章节爪印**（`Promo.tsx` 的 `ChapterPaws`，现在由代码画 22px 小爪印，`bottom:30` 居中一排）+ outro 装饰 |
| 建议摆位 | 22–28px 小图标；未选中 0.32 透明度、选中放大 1.25 倍并染成浆果红 `#E2553C` |

**提示词（整段复制）**

```
Hand-drawn comic sticker for a cozy macOS app promo film, matching a children's
picture-book mascot world. Thick warm-ink outline (#33261D), flat warm colors, soft
paper texture, slightly wobbly hand-drawn linework, no gradients, no drop shadow,
no text, no watermark, no white die-cut border. Isolated on a fully transparent
background, centered, generous transparent margin.

A single round bear paw print sticker: four toe pads and one large main pad, thick
warm-ink outline, flat honey-yellow fill (#F9C74F) with a slightly darker honey edge
(#E3A82B), played at a tiny playful rotation. Sticker silhouette only, no shadow,
no background.
```

**Negative prompt**

```
negative prompt: photorealistic, 3D render, glossy plastic, neon colors, gradients,
drop shadow, cast shadow, text, letters, words, watermark, logo, busy background,
frame border, white die-cut border, realistic fur texture
```

**接入**：跑脚本后把下面这行交给维护者（替换 `ChapterPaws` 里的 `<PawPrint>`）：

```tsx
<Img src={staticFile("assets/generated/sticker-paw.webp")} style={{ width: 26 }} />
```

---

### 5.3 `sticker-honey-jar@2k.png` — 蜂蜜罐贴纸

| 项 | 内容 |
| --- | --- |
| 文件名 | `sticker-honey-jar@2k.png` → 输出 `public/assets/generated/sticker-honey-jar.webp` |
| 尺寸 / 比例 | 1024×1024，1:1，透明底 PNG |
| 用在哪一幕 | **outro 落版（0:47.5–0:54）**装饰，或 collect（0:31–0:38）完成时的贴纸点缀 |
| 建议摆位 | 宽 120–180px，旋转 ±6°。outro 里放在**左侧品牌块与右侧小熊之间的空处**（约 x 950–1150），别压住品牌字标和下载按钮；collect 里贴采集袋左上角外侧 |

**提示词（整段复制）**

```
Hand-drawn comic sticker for a cozy macOS app promo film, matching a children's
picture-book mascot world. Thick warm-ink outline (#33261D), flat warm colors, soft
paper texture, slightly wobbly hand-drawn linework, no gradients, no drop shadow,
no text, no watermark, no white die-cut border. Isolated on a fully transparent
background, centered, generous transparent margin.

A cozy hand-drawn sticker of a small honey jar: round glass jar with a wooden lid,
warm honey-yellow honey inside, one drip of honey running down the side, a simple
paw-print label icon (icon only, no letters). Thick warm-ink outline, flat warm
colors, slightly wobbly linework, sticker silhouette with a tiny playful rotation.
```

**Negative prompt**

```
negative prompt: photorealistic, 3D render, glossy plastic, neon colors, gradients,
drop shadow, cast shadow, text, letters, words, watermark, logo, busy background,
frame border, white die-cut border, realistic glass reflections
```

**接入**：跑脚本后把下面这行交给维护者：

```tsx
<Img src={staticFile("assets/generated/sticker-honey-jar.webp")}
  style={{ position: "absolute", right: 180, top: 200, width: 160, transform: "rotate(-6deg)" }} />
```

---

### 5.4 `stamp-collected@2k.png` — 「已收」印章贴纸

| 项 | 内容 |
| --- | --- |
| 文件名 | `stamp-collected@2k.png` → 输出 `public/assets/generated/stamp-collected.webp` |
| 尺寸 / 比例 | 1024×1024，1:1，透明底 PNG |
| 用在哪一幕 | **collect 收进采集袋（0:31–0:38）**：0:34.9–0:35.9（帧 1046 / 1056 / 1066 / 1076）4 张卡依次盖「已收」章；0:36.3（帧 1090）采集袋上再盖一个大的「收好」章 |
| 建议摆位 | 卡片中心 90–120px（`MediaCard` 的章画在卡片中上部），旋转 -8°～-12°；采集袋上的大章 108px，落在袋面左上（`left:494, top:800`）。「已收 / 收好」文字由代码排版，**图片里不要出现文字**（用爪印 + 勾代替） |
| 注意 | 现有 `StampRing` 组件已能用代码画这个章；这张贴纸属于可选质感升级 |

**提示词（整段复制）**

```
Hand-drawn comic sticker for a cozy macOS app promo film, matching a children's
picture-book mascot world. Thick warm-ink outline (#33261D), flat warm colors, soft
paper texture, slightly wobbly hand-drawn linework, no gradients, no drop shadow,
no text, no watermark. Isolated on a fully transparent background, centered,
generous transparent margin.

A hand-stamped rubber stamp impression sticker: an imperfect thick circular ring,
inside it a simple bear paw print above a bold hand-drawn check mark, stamped in
leaf green (#5E9C68) with slightly uneven dry-ink texture and a small playful
rotation. Rough hand-stamped edges, flat, no letters or words anywhere.
```

**Negative prompt**

```
negative prompt: photorealistic, 3D render, glossy plastic, neon colors, gradients,
drop shadow, cast shadow, text, letters, words, numbers, watermark, logo, busy
background, frame border, realistic ink splatter
```

**接入**：跑脚本后把下面这行交给维护者（放在卡片右上角）：

```tsx
<Img src={staticFile("assets/generated/stamp-collected.webp")}
  style={{ position: "absolute", right: 8, top: 8, width: 100, transform: "rotate(-10deg)" }} />
```

---

## 6. 不需要生成的（现成资源 / 代码绘制）

- **App 界面截图**：`promos/crawl-bear-promo/public/assets/shots/home|progress|results|settings.webp` 已经就位，只作 UI 还原的**对照参考**；片中的结果页、卡片、筛选栏全部由 `MediaCard` / `FilterChip` 等组件代码绘制，不贴截图。
- **品牌 logo / 圆角小图标**：`public/assets/brand/bear-logo.webp`（256px）现成，`Wordmark` / `BearMark` 组件直接读它。
- **底纹**：`public/assets/brand/paper-pattern.webp` 已有；P3 只是可选升级。
- **UI 元素全部由代码绘制**，不要生图：结果卡片、筛选 chip、按钮、搜索胶囊、蜂蜜进度条、采集袋吸底栏、站点卡片（X / YouTube / Bilibili / 抖音的手绘 logo 是 SVG）、印章、爪印、下划线、闪光、纸胶带、硬投影、奶油底与暗角。
- **所有文案**：文字由 `src/lib/copy.ts` + 代码排版，图片里一律不要出现文字（唯一例外是提示词里那些「letter A type icon」小图标）。
- **转场**：纸片上移 + 贴纸砸入 + 音效全部由代码/音频完成，不需要任何图片素材。

---

## 7. 接入与验收清单

```bash
cd promos/crawl-bear-promo

# 1) 空跑：确认清单里的文件名都能对上（不会写文件）
python3 scripts/apply_art.py --dry-run

# 2) 真处理：裁透明边 → 长边 ≤2048 → WebP
python3 scripts/apply_art.py

# 3) 类型检查（P1 自动生效，不需要改代码）
npx tsc --noEmit
```

`apply_art.py` 会做的事：

- 读 `public/assets/generated/` 里**文件名对得上**的 PNG；认不出的文件会列出并跳过，不会报错。
- 有透明通道就裁掉透明边；没有透明通道就自动把四角连通的奶油底抠成透明（再裁边）。
- 只缩小不放大：长边超过 2048 才缩放，所以 1024/1536 的生成图不会被拉糊。
- 转 WebP：角色图 quality 92 保留 alpha；纸纹 quality 88。
- P1 / P3 纸纹写进 `public/assets/brand/`；P2 / P3 贴纸写进 `public/assets/generated/`。
- 重复执行安全，输出会被覆盖；生成前想留底，先把 `public/assets/brand/*.webp` 复制一份到别处。

**验收自检**

- [ ] `bear-hero.webp` 等 4 个文件的长边变成 ~1400–2048（原来是 960）。
- [ ] 小熊边缘没有残留的奶油色描边/白边（若有，重新生成时用透明底再跑一遍）。
- [ ] 摆位不撞标题：画面**左侧 55% 是标题安全区**，小熊主体应落在右侧。
- [ ] 耳朵、爪子没有被裁掉（`Mascot` 用 `objectFit: contain`，图上留白会被裁掉，但角色本身不能被切）。
- [ ] P2 / P3 的图已把「文件名 + 建议用途」交给维护者。
- [ ] 渲染验收由维护者统一做；协作时不要并行跑 `npx remotion render` / `still`（打包缓存会冲突）。

**把 P2/P3 交给维护者的消息模板**

```
P2/P3 图已生成并跑完 apply_art.py：
- 文件：public/assets/generated/bear-search.webp（长边 2048，透明底）
- 建议用途：crawl 场景 0:15–0:23 右侧，高度约 700px
- 接线片段：<Mascot src="assets/generated/bear-search.webp" height={620} ... />
```
