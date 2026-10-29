import { useEffect, useState } from "react";
import { App as AntApp, Button, Progress } from "antd";
import { listen } from "@tauri-apps/api/event";
import {
  api,
  type ExtensionProgress,
  type ExtensionStatus,
} from "../../../shared/api";
import { toAppError } from "../../../shared/errors";
import { formatSize } from "../../../shared/format";

interface ExtensionsPanelProps {
  active: boolean;
  inTauriApp: boolean;
}

export function ExtensionsPanel({ active, inTauriApp }: ExtensionsPanelProps) {
  const { message, modal } = AntApp.useApp();
  const [extensions, setExtensions] = useState<ExtensionStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [installing, setInstalling] = useState<string | null>(null);
  const [progress, setProgress] = useState<ExtensionProgress | null>(null);

  const load = async () => {
    if (!inTauriApp) return;
    setLoading(true);
    try {
      setExtensions((await api.listExtensions()) ?? []);
    } catch (error) {
      message.error(toAppError(error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (active) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    if (!inTauriApp) return undefined;
    let disposed = false;
    let stop: (() => void) | undefined;
    void listen<ExtensionProgress>("extension-progress", (event) => {
      if (!disposed) setProgress(event.payload);
    }).then((unlisten) => {
      if (disposed) unlisten();
      else stop = unlisten;
    });
    return () => {
      disposed = true;
      stop?.();
    };
  }, [inTauriApp]);

  const install = async (extension: ExtensionStatus) => {
    if (!inTauriApp) {
      message.error("浏览器预览模式无法安装扩展。");
      return;
    }
    setInstalling(extension.id);
    setProgress(null);
    try {
      await api.installExtension(extension.id);
      message.success(`${extension.name} 装好了。`);
      setExtensions((await api.listExtensions()) ?? []);
    } catch (error) {
      message.error(toAppError(error).message);
    } finally {
      setInstalling(null);
      setProgress(null);
    }
  };

  const remove = (extension: ExtensionStatus) => {
    modal.confirm({
      title: `移除 ${extension.name}？`,
      content: "移除后，依赖它的下载（如 YouTube 音视频合并、HLS）会暂时不可用。",
      okText: "移除",
      cancelText: "先留着",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setExtensions((await api.removeExtension(extension.id)) ?? []);
          message.success(`${extension.name} 已移除。`);
        } catch (error) {
          message.error(toAppError(error).message);
          throw error;
        }
      },
    });
  };

  const percent = progress?.total
    ? Math.min(100, Math.round((progress.received / progress.total) * 100))
    : 0;

  return (
    <section className="panel settings-card extensions-card" aria-labelledby="extensionsTitle">
      <div className="panel__head">
        <h2 id="extensionsTitle">扩展</h2>
      </div>

      {extensions.map((extension) => {
        const busy = installing === extension.id;
        const stage = progress?.stage;
        return (
          <div className="extension-row" key={extension.id}>
            <div className="extension-row__head">
              <div>
                <p className="extension-row__name">
                  {extension.name}
                  <span className="extension-row__version">v{extension.installed_version || extension.version}</span>
                  <span
                    className="extension-row__state"
                    data-installed={extension.installed || undefined}
                  >
                    {extension.installed ? "已安装" : "未安装"}
                  </span>
                </p>
                <p className="extension-row__desc">{extension.description}</p>
              </div>
              <div className="extension-row__actions">
                {extension.installed ? (
                  <>
                    <span className="extension-row__meta">
                      {formatSize(extension.size_bytes)} · {extension.license}
                    </span>
                    <Button
                      className="rb-btn rb-btn--text rb-btn--sm"
                      disabled={busy}
                      onClick={() => remove(extension)}
                    >
                      移除
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="extension-row__meta">
                      下载约 {formatSize(extension.download_size)}
                    </span>
                    <Button
                      type="primary"
                      className="rb-btn rb-btn--primary rb-btn--sm"
                      loading={busy}
                      disabled={!extension.can_install || !inTauriApp}
                      onClick={() => void install(extension)}
                    >
                      下载安装
                    </Button>
                  </>
                )}
              </div>
            </div>

            {busy && (
              <div className="extension-row__progress">
                <Progress
                  percent={stage === "installing" || stage === "done" ? 100 : percent}
                  showInfo={false}
                  size="small"
                  status="active"
                />
                <span>
                  {stage === "installing" || stage === "done"
                    ? "正在解压并校验…"
                    : progress
                      ? `${formatSize(progress.received)} / ${
                          progress.total ? formatSize(progress.total) : "…"
                        }`
                      : "正在连接…"}
                </span>
              </div>
            )}
          </div>
        );
      })}

      {!loading && extensions.length === 0 && (
        <p className="extension-row__desc">
          {inTauriApp ? "正在读取扩展列表…" : "浏览器预览模式下不显示扩展。"}
        </p>
      )}
    </section>
  );
}
