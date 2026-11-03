# 生图落位目录

按 [`../../ASSETS.md`](../../ASSETS.md) 生成图片，PNG 放进这里，文件名保持一致：

- `dafeiyu@2k.png` —— 引子拍立得里的大肥鱼

放好后：

```bash
cd promos/crawl-bear-promo
pnpm art          # 或 python3 scripts/apply_art.py
```

会裁透明边、长边缩到 2048、转成 `dafeiyu.webp`；引子用 `OptionalArt` 自动探测，**不用改代码**。
这个目录为空时影片照常渲染（用内置手绘鲸鱼占位），不需要放占位图。
