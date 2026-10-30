import { useCallback, useEffect, useState } from "react";
import { App as AntApp } from "antd";
import { isTauri } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { api, type AppSettings } from "../shared/api";
import { toAppError, type AppError } from "../shared/errors";
import { Masthead, type AppView } from "./Masthead";
import { CrawlerView } from "../features/crawler/CrawlerView";
import { SettingsView } from "../features/settings/SettingsView";

export default function App() {
  const { message, modal } = AntApp.useApp();
  const [inTauriApp] = useState(() => isTauri());

  const [view, setView] = useState<AppView>("crawler");
  const [resetSignal, setResetSignal] = useState(0);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState<AppError | null>(null);
  const [prefillUrl, setPrefillUrl] = useState("");
  const [settingsWarm, setSettingsWarm] = useState(false);

  const loadSettings = useCallback(async () => {
    if (!inTauriApp) {
      setSettingsLoading(false);
      setSettingsError({
        code: "not_tauri",
        message: "当前在浏览器中预览，桌面能力不可用。",
      });
      return;
    }
    setSettingsLoading(true);
    try {
      const next = await api.settings();
      setSettings(next);
      setSettingsError(null);
    } catch (error) {
      setSettingsError(toAppError(error));
      message.error("读取设置失败，请重试。");
    } finally {
      setSettingsLoading(false);
    }
  }, [inTauriApp, message]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  /* Pre-mount Settings after first paint so switching to it never has to
     render the whole page (sliders, extension panel, login list) in one frame. */
  useEffect(() => {
    if (settingsLoading || settingsWarm) return undefined;
    const timer = window.setTimeout(() => setSettingsWarm(true), 500);
    return () => window.clearTimeout(timer);
  }, [settingsLoading, settingsWarm]);

  const showAbout = useCallback(() => {
    modal.info({
      title: "关于超级爬爬熊",
      centered: true,
      okText: "知道了",
      className: "about-modal",
      content: (
        <div className="about-modal__body">
          <p className="about-modal__name">超级爬爬熊 · CrawlBear</p>
          <p>一款开源的网页媒体翻找小工具，只在你的电脑上只读工作。</p>
          <p>
            我们鼓励把它用于学习与个人素材整理，不提倡、也不鼓励用于任何不当用途。
            请遵守目标网站的服务条款与著作权法律，只保存你有权使用的内容。
          </p>
          <p className="about-modal__version">v0.3.2</p>
        </div>
      ),
    });
  }, [modal]);

  /* Native app menu: only 设置 / 关于. */
  useEffect(() => {
    if (!inTauriApp) return undefined;
    let disposed = false;
    let unlisten: (() => void) | undefined;
    listen<string>("app-menu", (event) => {
      if (event.payload === "settings") setView("settings");
      else if (event.payload === "about") showAbout();
    })
      .then((off) => {
        if (disposed) off();
        else unlisten = off;
      })
      .catch(() => {
        /* listener API unavailable in preview. */
      });
    return () => {
      disposed = true;
      unlisten?.();
    };
  }, [inTauriApp, showAbout]);

  /* The app is a tool, not a document: no browser context menu, no text selection. */
  useEffect(() => {
    const block = (event: MouseEvent) => event.preventDefault();
    document.addEventListener("contextmenu", block, { capture: true });
    return () => document.removeEventListener("contextmenu", block, { capture: true });
  }, []);

  const openSettings = (prefill?: string) => {
    if (prefill) setPrefillUrl(prefill);
    setView("settings");
  };

  const handleSaved = (next: AppSettings) => {
    setSettings(next);
    setSettingsError(null);
    message.success("设置已保存。");
  };

  const navigate = (next: AppView) => {
    if (next === "crawler") {
      // Re-entering 翻找 always starts from a clean home page.
      setResetSignal((value) => value + 1);
    }
    setView(next);
  };

  return (
    <div className="rb-app">
      <div className="paper-dots" aria-hidden="true" />
      <a className="skip-link" href="#main">
        跳到主要内容
      </a>

      <Masthead view={view} onNavigate={navigate} />

      <main className="app-main" id="main">
        <div className="view-slot view-slot--crawler" hidden={view !== "crawler"}>
          <CrawlerView
            settings={settings}
            settingsLoading={settingsLoading}
            resetSignal={resetSignal}
            onOpenSettings={openSettings}
          />
        </div>

        <div className="view-slot view-slot--settings" hidden={view !== "settings"}>
          {(settingsWarm || view === "settings") && (
            <SettingsView
              active={view === "settings"}
              inTauriApp={inTauriApp}
              settings={settings}
              loading={settingsLoading}
              error={settingsError}
              prefillUrl={prefillUrl}
              onPrefillConsumed={() => setPrefillUrl("")}
              onSaved={handleSaved}
              onRefresh={() => void loadSettings()}
            />
          )}
        </div>
      </main>
    </div>
  );
}
