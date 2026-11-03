import React from "react";
import { COLORS, INK } from "../theme";

type PaperTapeProps = {
  width?: number;
  height?: number;
  rotate?: number;
  tone?: string;
  style?: React.CSSProperties;
  /** 0 → 1, so scenes can "press" the tape on. */
  progress?: number;
};

/**
 * 和纸胶带（washi tape）：半透明蜂蜜色纸带 + 墨线虚边，
 * 用来把便签、拍立得"贴"在纸上。
 */
export const PaperTape: React.FC<PaperTapeProps> = ({
  width = 220,
  height = 56,
  rotate = -6,
  tone = COLORS.honey,
  style,
  progress = 1,
}) => (
  <div
    style={{
      width,
      height,
      background: tone,
      opacity: 0.62 * progress,
      border: `${INK.hairline}px dashed ${COLORS.ink}`,
      transform: `rotate(${rotate}deg) scaleX(${0.82 + 0.18 * progress})`,
      // 两端做成手撕的斜角
      clipPath: "polygon(2% 0%, 100% 4%, 98% 100%, 0% 96%)",
      ...style,
    }}
  />
);

export default PaperTape;
