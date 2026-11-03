import React from "react";
import { Composition } from "remotion";
import { Promo } from "./Promo";
import { DURATION, FPS, HEIGHT, WIDTH } from "./theme";
import type { PromoVariant } from "./lib/variant";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CrawlBearPromo"
        component={Promo}
        durationInFrames={DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ variant: "standard" as PromoVariant }}
      />
      <Composition
        id="CrawlBearPromoNoLink"
        component={Promo}
        durationInFrames={DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ variant: "noLink" as PromoVariant }}
      />
    </>
  );
};
