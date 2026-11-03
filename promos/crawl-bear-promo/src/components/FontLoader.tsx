import React, { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";

/**
 * Font gate.
 * The display face (Hannotate SC / 手札体) ships with macOS, so on this machine
 * it is already available. A bundled ZCOOL KuaiLe fallback covers other machines.
 * We block rendering until both are settled so no frame renders with the wrong face.
 */
export const FontLoader: React.FC = () => {
  const [handle] = useState(() => delayRender("Loading display fonts", { timeoutInMilliseconds: 30000 }));

  useEffect(() => {
    const style = document.createElement("style");
    style.setAttribute("data-promo-fonts", "true");
    style.textContent = `
      @font-face {
        font-family: "ZCOOL KuaiLe";
        src: url(${staticFile("fonts/ZCOOLKuaiLe-Regular.ttf")}) format("truetype");
        font-display: block;
        font-weight: 400 700;
      }
      html, body { margin: 0; padding: 0; background: #FFF7E8; }
      * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
    `;
    document.head.appendChild(style);

    const load = async () => {
      try {
        await document.fonts.load('700 80px "Hannotate SC"');
        await document.fonts.load('400 40px "ZCOOL KuaiLe"');
        await document.fonts.ready;
      } catch {
        // Fall back silently: the stack degrades to PingFang SC.
      } finally {
        continueRender(handle);
      }
    };
    void load();
  }, [handle]);

  return null;
};
