import { motion, useReducedMotion } from "framer-motion";
import type { CrawlProgress } from "../../../shared/api";

const STAGE_LABELS: Record<string, string> = {
  loading: "正在打开页面",
  extracting: "正在翻找资源",
  done: "翻找完成",
};

interface CrawlProgressPanelProps {
  progress: CrawlProgress | null;
}

export function CrawlProgressPanel({ progress }: CrawlProgressPanelProps) {
  const reduceMotion = useReducedMotion();
  const percent = Math.max(0, Math.min(100, Math.round(progress?.percent ?? 0)));
  const stage = progress?.stage ?? "loading";

  return (
    <div className="crawl-progress" role="status" aria-live="polite">
      <div className="crawl-progress__head">
        <span className="crawl-progress__stage">{STAGE_LABELS[stage] ?? "翻找中"}</span>
        <span className="crawl-progress__message">
          {progress?.message || "正在打开页面并扫描媒体资源…"}
        </span>
      </div>

      <div className="crawl-progress__track">
        <motion.span
          className="crawl-progress__fill"
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 120, damping: 22, mass: 0.8 }
          }
        />
        <motion.span
          key={percent}
          className="crawl-progress__percent"
          initial={reduceMotion ? false : { scale: 0.86, opacity: 0.4 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 18 }}
        >
          {percent}%
        </motion.span>
      </div>
    </div>
  );
}
