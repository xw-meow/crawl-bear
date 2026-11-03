import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS, FONTS, RADIUS } from "../../theme";
import { COPY } from "../../lib/copy";
import { clamp, easeInOut, easeOut, float, springAt, SPRINGS, stickerSlam } from "../../lib/anim";
import { Mascot } from "../../components/Mascot";
import { Bubble } from "../../components/Bubble";
import { Wordmark } from "../../components/Wordmark";
import { Button } from "../../components/Button";
import { InkPanel } from "../../components/InkPanel";
import { DownloadIcon, GlobeIcon } from "../../components/Icons";
import { MarkerUnderline, PawPrint, Sparkle } from "../../components/Doodles";

const DURATION = 195;
const ZOOM_FROM = 130;

/**
 * Scene 9 · Outro — the end card.
 * Composition echoes the hook (brand block left, bear in a honey circle right),
 * then holds still on the full brand lock-up so the film can cut to black.
 */
export const Outro: React.FC = () => {
  const frame = useCurrentFrame();

  const circleIn = springAt(frame, 0, SPRINGS.heavy);
  const hug = easeInOut(clamp((frame - ZOOM_FROM) / (DURATION - ZOOM_FROM)));

  const wordmarkIn = springAt(frame, 8, SPRINGS.heavy);
  const taglineP = easeOut(clamp((frame - 22) / 20));
  const underlineP = easeOut(clamp((frame - 40) / 24));

  const urlIn = springAt(frame, 36, SPRINGS.smooth);
  const ctaIn = springAt(frame, 48, SPRINGS.bouncy);
  const metaIn = clamp((frame - 62) / 12);

  const sparklePop = (at: number) => springAt(frame, at, SPRINGS.bouncy);
  const sparkleOpacity = (at: number) => clamp((frame - at) / 6);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${1 + 0.02 * hug})`,
          transformOrigin: "50% 46%",
        }}
      >
        {/* honey desk circle behind the bear — same plain disc as the hook */}
        <div
          style={{
            position: "absolute",
            right: 168,
            top: 138,
            width: 720,
            height: 720,
            borderRadius: "50%",
            background: COLORS.paperDeep,
            opacity: 0.9 * clamp((frame + 2) / 9),
            transform: `scale(${0.86 + 0.14 * circleIn})`,
          }}
        />

        {/* bear, waving the full collection bag */}
        <Mascot
          mood="happy"
          height={620}
          enterAt={14}
          enterFrom="bottom"
          bob={9}
          bobPeriod={120}
          sway={1.4}
          style={{ position: "absolute", right: 190, bottom: 34 }}
        />

        <div
          style={{
            position: "absolute",
            right: 430,
            top: 330,
            ...stickerSlam(frame, 56, -1.5),
          }}
        >
          <Bubble
            text={COPY.outro.bubble}
            fontSize={38}
            tail="down-right"
            tailOffset={86}
            rotate={0}
          />
        </div>

        {/* brand lock-up */}
        <div
          style={{
            position: "absolute",
            left: 120,
            top: 250,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              opacity: clamp((frame - 8) / 8),
              transform: `translateY(${(1 - wordmarkIn) * 40}px) scale(${0.96 + 0.04 * Math.min(1, wordmarkIn)})`,
              transformOrigin: "0% 50%",
            }}
          >
            <Wordmark size={1.8} align="row" />
          </div>

          <div style={{ marginTop: 44, position: "relative" }}>
            <div
              style={{
                fontFamily: FONTS.display,
                fontWeight: 700,
                fontSize: 50,
                lineHeight: 1.16,
                letterSpacing: -1,
                color: COLORS.ink,
                whiteSpace: "nowrap",
                clipPath: `inset(-12% ${(1 - taglineP) * 100}% -14% 0)`,
                transform: `translateY(${(1 - taglineP) * 16}px)`,
              }}
            >
              {COPY.outro.tagline}
            </div>
            <MarkerUnderline
              width={700}
              progress={underlineP}
              thickness={14}
              style={{ position: "absolute", left: -4, bottom: -24, opacity: 0.95 }}
            />
          </div>

          <div
            style={{
              marginTop: 48,
              opacity: clamp((frame - 36) / 9),
              transform: `translateY(${(1 - urlIn) * 26}px) scale(${0.94 + 0.06 * Math.min(1, urlIn)})`,
              transformOrigin: "0% 50%",
            }}
          >
            <InkPanel
              padding="12px 28px"
              radius={RADIUS.pill}
              shadowSize={7}
              rotate={-1}
              style={{ display: "inline-flex", alignItems: "center", gap: 14 }}
            >
              <GlobeIcon size={30} color={COLORS.ink} strokeWidth={3} />
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 32,
                  color: COLORS.ink,
                  letterSpacing: 0.5,
                  lineHeight: 1.2,
                }}
              >
                {COPY.outro.url}
              </span>
            </InkPanel>
          </div>

          <div
            style={{
              marginTop: 34,
              opacity: clamp((frame - 48) / 8),
              transform: `scale(${0.86 + 0.14 * Math.min(1, ctaIn)})`,
              transformOrigin: "0% 50%",
            }}
          >
            <Button
              label={COPY.outro.cta}
              tone="berry"
              size="lg"
              icon={<DownloadIcon size={36} color="#FFFFFF" strokeWidth={4} />}
            />
          </div>

          <div
            style={{
              marginTop: 28,
              fontFamily: FONTS.body,
              fontSize: 26,
              color: COLORS.muted,
              letterSpacing: 0.5,
              opacity: 0.95 * metaIn,
              transform: `translateY(${(1 - metaIn) * 12}px)`,
            }}
          >
            {COPY.outro.meta}
          </div>
        </div>

        {/* a little hand-drawn punctuation — never more than a few marks */}
        <div
          style={{
            position: "absolute",
            left: 96,
            top: 206,
            opacity: 0.95 * sparkleOpacity(78),
            transform: `rotate(${float(frame, 7, 150, 0)}deg) scale(${sparklePop(78)})`,
          }}
        >
          <Sparkle size={42} color={COLORS.honey} />
        </div>
        <div
          style={{
            position: "absolute",
            left: 906,
            top: 470,
            opacity: 0.85 * sparkleOpacity(92),
            transform: `rotate(${float(frame, 9, 170, 2)}deg) scale(${sparklePop(92)})`,
          }}
        >
          <Sparkle size={26} color={COLORS.berry} />
        </div>
        <div
          style={{
            position: "absolute",
            left: 1000,
            top: 724,
            opacity: 0.36 * sparkleOpacity(104),
            transform: `rotate(${12 + float(frame, 5, 160, 1)}deg) scale(${sparklePop(104)})`,
          }}
        >
          <PawPrint size={38} color={COLORS.fur} />
        </div>
        <div
          style={{
            position: "absolute",
            left: 856,
            top: 956,
            opacity: 0.3 * sparkleOpacity(112),
            transform: `rotate(${-10 + float(frame, 5, 180, 3)}deg) scale(${sparklePop(112)})`,
          }}
        >
          <PawPrint size={28} color={COLORS.fur} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const OUTRO_DURATION = DURATION;
