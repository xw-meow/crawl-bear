import React, { useEffect, useState } from "react";
import { continueRender, delayRender, Img, staticFile } from "remotion";

type OptionalArtProps = {
  /** Public path, e.g. "assets/generated/dafeiyu.webp". */
  src: string;
  /** Rendered while the file is missing — usually a hand-drawn SVG fallback. */
  fallback: React.ReactNode;
  style?: React.CSSProperties;
  alt?: string;
  timeoutMs?: number;
};

/**
 * 可选生图：文件存在就用它，不存在就回退到手绘占位。
 *
 * 和仓库里其它包的做法一致（桌面端 Mascot、官网 SmartImage 都会自动回退），
 * 这样生图流程（生成 → `pnpm --filter @crawl-bear/promo art`）不会阻塞渲染：
 * 生成图还没到位时，画面用的是 vector 占位；放进去之后立刻生效，无需改代码。
 */
export const OptionalArt: React.FC<OptionalArtProps> = ({
  src,
  fallback,
  style,
  alt,
  timeoutMs = 15000,
}) => {
  const [state, setState] = useState<"pending" | "ok" | "missing">("pending");
  const [handle] = useState(() =>
    delayRender(`optional art: ${src}`, { timeoutInMilliseconds: timeoutMs }),
  );

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    const settle = (next: "ok" | "missing") => {
      if (cancelled) return;
      setState(next);
      continueRender(handle);
    };
    img.onload = () => settle("ok");
    img.onerror = () => settle("missing");
    img.src = staticFile(src);
    return () => {
      cancelled = true;
    };
  }, [handle, src]);

  if (state !== "ok") return <>{fallback}</>;

  return <Img src={staticFile(src)} style={style} alt={alt ?? ""} />;
};
