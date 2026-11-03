# 生图落位目录（gpt-image-2）

把你用 `promo/ASSETS.md` 里的提示词生成好的 **PNG** 放进这个目录，文件名要**完全一致**：

- P1 替换：`bear-hero@2k.png`、`bear-crawl@2k.png`、`bear-happy@2k.png`、`bear-error@2k.png`
- P2 新姿势：`bear-search@2k.png`、`bear-present@2k.png`、`bear-wink@2k.png`
- P3 质感：`paper-texture@2k.png`、`sticker-paw@2k.png`、`sticker-honey-jar@2k.png`、`stamp-collected@2k.png`

放好后在 `promo/` 下运行：

```bash
python3 scripts/apply_art.py --dry-run   # 先看看会处理哪些图
python3 scripts/apply_art.py             # 裁边 → 长边 2048 → WebP，并覆盖到 assets/brand/
```

P1 生成的图会自动替换 `public/assets/brand/bear-<mood>.webp`，**不用改代码**。
P2/P3 会输出到本目录下的 `.webp`，需要 Lead 接线后才能上片。
这个目录为空时影片照常渲染（用的是现有的 960px WebP），不需要占位图。

完整提示词、摆位与验收说明见 [`../../ASSETS.md`](../../ASSETS.md)。
