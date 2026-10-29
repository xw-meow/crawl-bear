# 构建用图像资产

这个目录由 `python3 scripts/prepare_assets.py` 生成，请不要手动编辑：

- `bear-<mood>.webp`：小熊插画（透明背景，960px，来自 `design-assets/bear-<mood>.png`）
- `paper-pattern.webp`：页面底纹（单张 cover 铺满视口，不平铺）
- `bear-logo.webp`：顶栏品牌图标

缺图时 `Mascot` 组件会自动回退到内置 SVG，不影响构建与使用。
