import { Button, Progress } from "antd";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type {
  DownloadProgress,
  DownloadSummary,
  MediaKind,
  MediaResource,
} from "../../../shared/api";
import { KIND_LABELS, formatSize, prettyPath } from "../../../shared/format";
import {
  BagIcon,
  DownloadIcon,
  FolderIcon,
  kindIcon,
} from "../../../shared/components/Icons";

interface DownloadBarProps {
  selected: MediaResource[];
  downloading: boolean;
  canceling: boolean;
  progress: DownloadProgress | null;
  summary: DownloadSummary | null;
  downloadDir: string | null;
  onDownload: () => void;
  onCancel: () => void;
  onReveal: (path: string) => void;
}

function breakdown(selected: MediaResource[]): { kind: MediaKind; count: number }[] {
  const counts = new Map<MediaKind, number>();
  for (const resource of selected) {
    counts.set(resource.kind, (counts.get(resource.kind) ?? 0) + 1);
  }
  return [...counts.entries()].map(([kind, count]) => ({ kind, count }));
}

export function DownloadBar({
  selected,
  downloading,
  canceling,
  progress,
  summary,
  downloadDir,
  onDownload,
  onCancel,
  onReveal,
}: DownloadBarProps) {
  const reduceMotion = useReducedMotion();
  const count = selected.length;
  const parts = breakdown(selected);
  const itemFraction =
    progress?.current_total && progress.current_total > 0
      ? Math.min(1, (progress.current_received ?? 0) / progress.current_total)
      : 0;
  const percent =
    progress && progress.total > 0
      ? Math.min(
          100,
          Math.round(((progress.completed + itemFraction) / progress.total) * 100),
        )
      : 0;

  const folder = prettyPath(summary?.folder || downloadDir || "~/Downloads/CrawlBear");

  return (
    <motion.div
      className="download-bar"
      role="region"
      aria-label="批量下载"
      initial={reduceMotion ? false : { y: 90, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { y: 90, opacity: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
    >
      <div className="download-bar__inner">
        <motion.span
          key={count}
          className="download-bar__seal"
          data-empty={count === 0 || undefined}
          initial={reduceMotion ? false : { scale: 0.82 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 520, damping: 18 }}
        >
          <BagIcon size={16} />
          <strong>{count}</strong>
        </motion.span>

        <div className="download-bar__main">
          <p className="download-bar__title">
            已选 <strong>{count}</strong> 件
            {parts.length > 0 && (
              <span className="download-bar__kinds">
                {parts.map(({ kind, count: kindCount }) => {
                  const Icon = kindIcon(kind);
                  return (
                    <span key={kind} className="download-bar__kind">
                      <Icon size={12} />
                      {KIND_LABELS[kind]} {kindCount}
                    </span>
                  );
                })}
              </span>
            )}
          </p>
          <p className="download-bar__note" aria-live="polite">
            {downloading ? (
              progress ? (
                <>
                  <span className="download-bar__current">
                    {progress.current_name || "正在准备…"}
                  </span>
                  <span>
                    {progress.current_total
                      ? `${formatSize(progress.current_received ?? 0)} / ${formatSize(progress.current_total)}`
                      : `${progress.completed}/${progress.total}`}{" "}
                    · {percent}%
                  </span>
                </>
              ) : (
                "正在准备下载…"
              )
            ) : summary ? (
              <span>
                {summary.canceled ? "已取消" : "收好了"}
                {` · 成功 ${summary.success_count} 件`}
                {summary.failed_count > 0 ? ` · 失败 ${summary.failed_count} 件` : ""}
                <span className="download-bar__folder" title={summary.folder}>
                  {" "}
                  → {folder}
                </span>
              </span>
            ) : (
              <span title={folder}>收进 {folder}</span>
            )}
          </p>
        </div>

        <div className="download-bar__actions">
          <AnimatePresence initial={false}>
            {downloading && (
              <motion.span
                key="cancel"
                initial={reduceMotion ? false : { opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
              >
                <Button
                  className="rb-btn rb-btn--ghost"
                  onClick={onCancel}
                  loading={canceling}
                  disabled={canceling}
                >
                  {canceling ? "正在取消…" : "先不收了"}
                </Button>
              </motion.span>
            )}
            {summary && !downloading && (
              <motion.span
                key="reveal"
                initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Button
                  className="rb-btn rb-btn--ghost"
                  icon={<FolderIcon size={15} />}
                  onClick={() => onReveal(summary.folder)}
                >
                  在 Finder 中显示
                </Button>
              </motion.span>
            )}
          </AnimatePresence>
          <motion.div whileHover={count === 0 || downloading ? undefined : { y: -2 }} whileTap={{ y: 1 }}>
            <Button
              type="primary"
              className="rb-btn rb-btn--primary download-bar__download"
              onClick={onDownload}
              loading={downloading}
              disabled={count === 0}
            >
              {downloading ? "正在收…" : "收进采集袋"}
              {!downloading && <DownloadIcon size={17} />}
            </Button>
          </motion.div>
        </div>
      </div>

      {downloading && (
        <div className="download-bar__progress">
          <Progress percent={percent} showInfo={false} size="small" status="active" />
        </div>
      )}

      {summary && !downloading && summary.failures.length > 0 && (
        <details className="download-bar__failures">
          <summary>有 {summary.failed_count} 件没收到，看看原因</summary>
          <ul>
            {summary.failures.map((failure) => (
              <li key={failure.id}>
                <span className="download-bar__failure-url" title={failure.url}>
                  {failure.url}
                </span>
                <span>{failure.error}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </motion.div>
  );
}
