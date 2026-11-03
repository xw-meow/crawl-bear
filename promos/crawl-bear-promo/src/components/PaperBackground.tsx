import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { COLORS } from "../theme";
import { float } from "../lib/anim";

/**
 * The cream paper backdrop. Mounted once, globally, by Promo.tsx — scenes must
 * not render their own background, so the film keeps one continuous sheet.
 */
export const PaperBackground: React.FC<{ breathing?: boolean }> = ({ breathing = true }) => {
  const frame = useCurrentFrame();
  const scale = 1.02 + (breathing ? float(frame, 0.006, 300) : 0);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paper, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          backgroundImage: `url(${staticFile("assets/brand/paper-pattern.webp")})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.45,
          transform: `scale(${scale})`,
        }}
      />
      {/* warm vignette — keeps the eye on the centre, barely perceptible */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(118% 96% at 50% 42%, rgba(255,247,232,0) 38%, rgba(216,181,131,0.34) 100%)",
        }}
      />
      {/* faint top light */}
      <AbsoluteFill
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 26%)",
        }}
      />
    </AbsoluteFill>
  );
};
