# CrawlBear 宣传短片 · 生图清单

**已全部就位，无需再生成。** 唯一的生图（引子拍立得里的大肥鱼）已经放进项目；其余素材复用仓库现有插画或由代码绘制。

---

## 1. `dafeiyu@2k.png` ✅ 已生成并接入

- 尺寸：1:1 透明底 PNG（当前 1254×1254）
- 用在哪：引子（0:00–0:06）右侧拍立得照片里，按约 450px 居中显示
- 放哪：`promos/crawl-bear-promo/public/assets/generated/`

```
Hand-drawn comic illustration for a cozy macOS app promo film, designed to sit inside a polaroid photo frame.

Character: a chubby, friendly blue whale — the mascot the community calls "Da Fei Yu". Round chubby body, flat sky-blue back (#7FB6C9), cream underbelly (#F0D3A7), thick warm-ink outlines (#33261D), closed happy eye with a small smile, one soft blush, two thin water spouts above the head, a chubby tail fluke on the right side, one tiny pectoral fin, two tiny bubbles nearby.

Style: children's picture-book comic, slightly wobbly hand-drawn linework, flat warm colors, soft paper texture, no gradients, no shadows.

Composition: isolated on a fully transparent background, centered, facing slightly left, generous transparent margin, full body visible, nothing cropped.

No text, no letters, no logo, no watermark, no frame border. Avoid: photorealistic, 3D render, CGI, glossy plastic, neon colors, dark background, drop shadow, human hands, extra fins, scary expression, low resolution.
```

以后想换图：把新图按同名 `dafeiyu@2k.png` 放进上面的目录，跑 `cd promos/crawl-bear-promo && pnpm art` 即可。
引子用 `OptionalArt` 探测这张图：文件在就用图，不在就回退手绘鲸鱼占位，**不需要改代码**。

---

## 不用生成的

- **小熊**（hero / crawl / happy / error 等）、**纸纹**、**logo**：复用 `promos/crawl-bear-promo/public/assets/brand/` 里已有的插画
- **界面**（搜索胶囊、进度条、结果卡片、采集袋、站点卡等）：全部由 React 代码绘制
- **App 截图**：仓库已有（`public/assets/shots/`），只作画面还原的参考
