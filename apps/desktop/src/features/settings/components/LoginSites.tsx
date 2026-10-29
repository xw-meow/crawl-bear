import { useEffect, useRef, useState } from "react";
import { App as AntApp, Button } from "antd";
import { api, type LoginSite } from "../../../shared/api";
import { toAppError } from "../../../shared/errors";
import { displayUrl, normalizeHttpUrl } from "../../../shared/format";
import { Mascot } from "../../../shared/components/Mascot";
import {
  LinkIcon,
  LockIcon,
  PlusIcon,
  RefreshIcon,
  TrashIcon,
} from "../../../shared/components/Icons";

interface LoginSitesProps {
  sites: LoginSite[];
  active: boolean;
  prefillUrl: string;
  onPrefillConsumed: () => void;
  onChange: (sites: LoginSite[]) => void;
}

type CookieState = Record<string, number | null>;

function newSiteId(): string {
  return `site-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function LoginSites({
  sites,
  active,
  prefillUrl,
  onPrefillConsumed,
  onChange,
}: LoginSitesProps) {
  const { message, modal } = AntApp.useApp();
  const [addUrl, setAddUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [cookies, setCookies] = useState<CookieState>({});
  const addInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!prefillUrl) return;
    let pretty = prefillUrl;
    try {
      pretty = new URL(prefillUrl).origin;
    } catch {
      /* keep the raw value for non-standard input */
    }
    setAddUrl(pretty);
    onPrefillConsumed();
    window.setTimeout(() => addInputRef.current?.focus(), 120);
  }, [prefillUrl, onPrefillConsumed]);

  useEffect(() => {
    if (!active || sites.length === 0) return undefined;
    let cancelled = false;

    const refresh = async (showSpinner: boolean) => {
      if (showSpinner) setRefreshing(true);
      const entries = await Promise.all(
        sites.map(async (site) => {
          try {
            const info = await api.getSiteSession(site.url);
            return [site.id, info.cookies] as const;
          } catch {
            return [site.id, null] as const;
          }
        })
      );
      if (cancelled) return;
      setCookies((previous) => ({ ...previous, ...Object.fromEntries(entries) }));
      if (showSpinner) setRefreshing(false);
    };

    void refresh(true);
    const interval = window.setInterval(() => void refresh(false), 5000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, sites.map((site) => `${site.id}:${site.url}`).join("|")]);

  const handleAdd = async () => {
    const normalized = normalizeHttpUrl(addUrl);
    if (!normalized) {
      message.error("网址不对，例如 https://example.com。");
      return;
    }
    let domain = "";
    try {
      domain = new URL(normalized).host;
    } catch {
      message.error("网址格式不正确。");
      return;
    }
    if (sites.some((site) => site.domain === domain)) {
      message.info(`「${domain}」已经在列表里了。`);
      return;
    }

    setAdding(true);
    try {
      const site: LoginSite = {
        id: newSiteId(),
        label: domain,
        url: normalized,
        domain,
        last_opened_at: null,
      };
      onChange([...sites, site]);
      setAddUrl("");
      message.success(`加上了 ${domain}，记得保存设置。`);
      try {
        const info = await api.getSiteSession(normalized);
        setCookies((previous) => ({ ...previous, [site.id]: info.cookies }));
      } catch {
        /* Cookie lookup is best-effort. */
      }
    } finally {
      setAdding(false);
    }
  };

  const handleOpenLogin = async (site: LoginSite) => {
    setBusyId(site.id);
    try {
      const result = await api.openSiteLogin(site.url);
      message.success(result.message || "登录窗口已打开，登录后关掉窗口就行。");
      onChange(
        sites.map((item) =>
          item.id === site.id
            ? { ...item, last_opened_at: Math.floor(Date.now() / 1000) }
            : item
        )
      );
      window.setTimeout(async () => {
        try {
          const info = await api.getSiteSession(site.url);
          setCookies((previous) => ({ ...previous, [site.id]: info.cookies }));
        } catch {
          /* best effort */
        }
      }, 1800);
    } catch (error) {
      message.error(toAppError(error).message);
    } finally {
      setBusyId(null);
    }
  };

  const handleClear = async (site: LoginSite) => {
    setBusyId(site.id);
    try {
      const info = await api.clearSiteSession(site.url);
      setCookies((previous) => ({ ...previous, [site.id]: info.cookies }));
      message.success(`清掉了 ${site.domain} 的登录态。`);
    } catch (error) {
      message.error(toAppError(error).message);
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = (site: LoginSite) => {
    onChange(sites.filter((item) => item.id !== site.id));
    setCookies((previous) => {
      const next = { ...previous };
      delete next[site.id];
      return next;
    });
    message.info(`移除了 ${site.domain}，保存后生效。`);
  };

  const handleCloseWindow = async () => {
    try {
      await api.closeSiteLogin();
      message.info("登录窗口已关闭。");
    } catch (error) {
      message.error(toAppError(error).message);
    }
  };

  const refreshAll = () => {
    setRefreshing(true);
    void (async () => {
      const entries = await Promise.all(
        sites.map(async (site) => {
          try {
            const info = await api.getSiteSession(site.url);
            return [site.id, info.cookies] as const;
          } catch {
            return [site.id, null] as const;
          }
        })
      );
      setCookies((previous) => ({ ...previous, ...Object.fromEntries(entries) }));
      setRefreshing(false);
    })();
  };

  return (
    <section className="panel settings-card" aria-labelledby="loginSitesTitle">
      <div className="panel__head">
        <h2 id="loginSitesTitle">登录站点</h2>
        <div className="settings-card__tools">
          <button type="button" className="rb-text-link" onClick={refreshAll}>
            <RefreshIcon size={12} className={refreshing ? "is-spinning" : undefined} />
            刷新
          </button>
          <button type="button" className="rb-text-link" onClick={() => void handleCloseWindow()}>
            关闭登录窗口
          </button>
        </div>
      </div>

      <div className="site-add">
        <form
          className="site-add-pill"
          onSubmit={(event) => {
            event.preventDefault();
            void handleAdd();
          }}
        >
          <span className="site-add-pill__icon" aria-hidden="true">
            <LinkIcon size={16} />
          </span>
          <input
            ref={addInputRef}
            className="site-add-pill__input"
            value={addUrl}
            placeholder="https://example.com"
            spellCheck={false}
            autoComplete="off"
            onChange={(event) => setAddUrl(event.target.value)}
            aria-label="添加登录站点地址"
          />
          <Button
            type="primary"
            htmlType="submit"
            className="site-add-pill__button"
            icon={<PlusIcon size={15} />}
            loading={adding}
          >
            添加
          </Button>
        </form>
      </div>

      {sites.length === 0 ? (
        <div className="site-empty">
          <Mascot mood="login" size={128} still />
          <p>要翻找登录后的内容，先加个站点。</p>
        </div>
      ) : (
        <ul className="site-list">
          {sites.map((site) => {
            const count = cookies[site.id];
            return (
              <li key={site.id} className="site-row">
                <div className="site-row__head">
                  <div className="site-row__main">
                    <p className="site-row__title">
                      <LockIcon size={13} />
                      <strong>{site.domain}</strong>
                    </p>
                    <p className="site-row__url" title={site.url}>
                      {displayUrl(site.url, 56)}
                    </p>
                  </div>
                  <span className="site-row__cookies">
                    {typeof count === "number" ? `${count} 个 Cookie` : "Cookie 读取中…"}
                  </span>
                </div>
                <div className="site-row__actions">
                  <Button
                    size="small"
                    className="rb-btn rb-btn--text rb-btn--sm"
                    loading={busyId === site.id}
                    onClick={() => void handleOpenLogin(site)}
                  >
                    打开登录
                  </Button>
                  <Button
                    size="small"
                    className="rb-btn rb-btn--text rb-btn--sm"
                    disabled={busyId === site.id}
                    onClick={() =>
                      modal.confirm({
                        title: `清除 ${site.domain} 的 Cookie？`,
                        content: "会删除该站点在本机保存的 Cookie，下次需要重新登录。",
                        okText: "清除",
                        cancelText: "取消",
                        centered: true,
                        okButtonProps: { danger: true },
                        onOk: () => void handleClear(site),
                      })
                    }
                  >
                    清除
                  </Button>
                  <button
                    type="button"
                    className="site-row__remove"
                    aria-label={`移除 ${site.domain}`}
                    title="从列表移除"
                    onClick={() => handleRemove(site)}
                  >
                    <TrashIcon size={15} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
