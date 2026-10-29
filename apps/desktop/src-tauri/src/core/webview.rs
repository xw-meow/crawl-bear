//! WebView compatibility shims shared by the crawl worker and site-login windows.
//!
//! Tauri's default WKWebView user agent omits the `Safari/…` token. A number of
//! sites sniff for it and answer with a degraded / downgrade page. Presenting a
//! normal desktop Safari UA keeps content negotiation predictable without
//! altering cookies, authentication or page behaviour.

/// Desktop Safari user agent used for remote pages.
pub const SAFARI_USER_AGENT: &str = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15";

/// Injected before any page script in the hidden crawl window.
///
/// Hidden WKWebView windows never receive display refreshes, so
/// `requestAnimationFrame` callbacks do not fire and JavaScript-rendered or
/// lazy-loaded content stays in its initial loading state. Mapping rAF onto a
/// short timer lets the DOM settle while the window remains invisible.
pub const CRAWL_INIT_SCRIPT: &str = r#"
(function () {
  try {
    window.requestAnimationFrame = function (cb) {
      return setTimeout(function () {
        cb((window.performance && performance.now) ? performance.now() : Date.now());
      }, 16);
    };
    window.cancelAnimationFrame = function (id) { clearTimeout(id); };
  } catch (e) {}
})();
"#;
