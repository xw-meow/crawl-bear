import { CrawlBearError } from "./api";

export interface AppError {
  code: string;
  message: string;
}

const FALLBACKS: Record<string, string> = {
  invalid_url: "链接格式不正确，只支持 http / https 页面。",
  crawl_failed: "页面爬取失败，请稍后重试或换一个地址。",
  no_resources: "没有在这个页面发现可下载的媒体资源。",
  login_required: "该页面需要登录。请到「设置 → 登录站点」登录后重新爬取。",
  download_failed: "下载没有完成，请稍后重试。",
  no_selection: "还没有选择要下载的资源。",
  canceled: "下载已取消。",
  settings_failed: "设置读写失败，请稍后重试。",
  session_failed: "登录态读取失败，请稍后重试。",
  not_found: "文件或文件夹不存在，可能已经被移动。",
  internal_error: "本机服务遇到问题，请稍后重试。",
  not_tauri: "当前在浏览器中预览，桌面能力不可用。请用 npm run tauri dev 启动应用。",
  unknown: "遇到了一点问题，请稍后重试。",
};

export function toAppError(error: unknown): AppError {
  if (error instanceof CrawlBearError) {
    return {
      code: error.code,
      message: error.message?.trim() || FALLBACKS[error.code] || FALLBACKS.unknown,
    };
  }
  if (error instanceof Error && error.message) {
    return { code: "unknown", message: error.message };
  }
  if (typeof error === "string" && error.trim()) {
    return { code: "unknown", message: error };
  }
  return { code: "unknown", message: FALLBACKS.unknown };
}

export function isLoginRequired(error: AppError | null | undefined): boolean {
  return error?.code === "login_required";
}

export function isCanceled(error: AppError | null | undefined): boolean {
  return error?.code === "canceled";
}
