//! Shared HTTP helpers that respect the macOS system proxy.

use std::time::Duration;

/// macOS system proxy, or standard proxy environment variables.
pub fn system_proxy() -> Option<String> {
    for key in ["HTTPS_PROXY", "https_proxy", "ALL_PROXY", "all_proxy"] {
        if let Ok(value) = std::env::var(key) {
            let value = value.trim();
            if !value.is_empty() {
                return Some(value.to_string());
            }
        }
    }

    #[cfg(target_os = "macos")]
    {
        let output = std::process::Command::new("scutil")
            .arg("--proxy")
            .output()
            .ok()?;
        let text = String::from_utf8_lossy(&output.stdout);
        let get = |key: &str| {
            text.lines().find_map(|line| {
                let (name, value) = line.split_once(':')?;
                (name.trim() == key).then(|| value.trim().to_string())
            })
        };
        if get("HTTPSEnable").as_deref() == Some("1") {
            if let (Some(host), Some(port)) = (get("HTTPSProxy"), get("HTTPSPort")) {
                return Some(format!("http://{host}:{port}"));
            }
        }
        if get("HTTPEnable").as_deref() == Some("1") {
            if let (Some(host), Some(port)) = (get("HTTPProxy"), get("HTTPPort")) {
                return Some(format!("http://{host}:{port}"));
            }
        }
    }
    None
}

pub fn client(timeout: Duration) -> Result<reqwest::Client, String> {
    client_with_user_agent(crate::core::webview::SAFARI_USER_AGENT, timeout)
}

pub fn client_with_user_agent(
    user_agent: &str,
    timeout: Duration,
) -> Result<reqwest::Client, String> {
    let mut builder = reqwest::Client::builder()
        .user_agent(user_agent)
        .timeout(timeout)
        .gzip(true);
    if let Some(proxy) = system_proxy() {
        builder = builder.proxy(
            reqwest::Proxy::all(&proxy)
                .map_err(|error| format!("系统代理配置无效（{proxy}）: {error}"))?,
        );
    }
    builder
        .build()
        .map_err(|error| format!("无法初始化网络请求: {error}"))
}
