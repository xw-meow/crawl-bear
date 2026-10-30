use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum MediaKind {
    Image,
    Video,
    Audio,
    Font,
    Other,
}

impl MediaKind {

}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ResourceSource {
    Img,
    Picture,
    Video,
    Audio,
    CssBackground,
    CssFontFace,
    Link,
    Meta,
    Anchor,
    Performance,
    InlineStyle,
    Fallback,
    Other,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MediaResource {
    pub id: String,
    pub url: String,
    pub kind: MediaKind,
    pub source: ResourceSource,
    pub filename_hint: Option<String>,
    pub width: Option<u32>,
    pub height: Option<u32>,
    pub duration: Option<f64>,
    pub poster: Option<String>,
    pub alt: Option<String>,
    pub host: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CrawlRequest {
    pub url: String,
    pub kinds: Vec<MediaKind>,
    pub scroll: bool,
    pub max_items: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CrawlResult {
    pub page_url: String,
    pub final_url: String,
    pub title: String,
    pub host: String,
    pub resources: Vec<MediaResource>,
    pub counts: BTreeMap<String, usize>,
    pub warnings: Vec<String>,
    pub needs_login: bool,
    #[serde(default)]
    pub enhanced: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoginSite {
    pub id: String,
    pub label: String,
    pub url: String,
    pub domain: String,
    #[serde(default)]
    pub last_opened_at: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub download_dir: String,
    pub default_kinds: Vec<MediaKind>,
    pub concurrency: u8,
    pub scroll_page: bool,
    pub max_items: usize,
    #[serde(default)]
    pub sites: Vec<LoginSite>,
    #[serde(default = "default_language")]
    pub language: String,
}

fn default_language() -> String {
    "auto".to_string()
}

impl AppSettings {
    pub fn defaults() -> Self {
        let home = std::env::var("HOME").unwrap_or_else(|_| ".".to_string());
        let download_dir = std::env::var("CRAWLBear_DOWNLOAD_DIR")
            .unwrap_or_else(|_| format!("{home}/Downloads/CrawlBear"));
        Self {
            download_dir,
            default_kinds: vec![
                MediaKind::Image,
                MediaKind::Video,
                MediaKind::Audio,
                MediaKind::Font,
            ],
            concurrency: 3,
            scroll_page: true,
            max_items: 500,
            sites: Vec::new(),
            language: default_language(),
        }
    }

    pub fn normalized(mut self) -> Self {
        self.concurrency = self.concurrency.clamp(1, 5);
        self.max_items = self.max_items.clamp(50, 2000);
        if self.download_dir.trim().is_empty() {
            self.download_dir = Self::defaults().download_dir;
        }
        if self.default_kinds.is_empty() {
            self.default_kinds = Self::defaults().default_kinds;
        }
        if !matches!(self.language.as_str(), "auto" | "zh" | "en") {
            self.language = default_language();
        }
        self
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DownloadItem {
    pub id: String,
    pub url: String,
    pub kind: MediaKind,
    #[serde(default)]
    pub filename_hint: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DownloadRequest {
    pub page_url: String,
    pub items: Vec<DownloadItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DownloadFile {
    pub id: String,
    pub url: String,
    pub path: String,
    pub filename: String,
    pub size: u64,
    pub kind: MediaKind,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DownloadFailure {
    pub id: String,
    pub url: String,
    pub error: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DownloadSummary {
    pub folder: String,
    pub total: usize,
    pub success_count: usize,
    pub failed_count: usize,
    pub files: Vec<DownloadFile>,
    pub failures: Vec<DownloadFailure>,
    pub canceled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionInfo {
    pub url: String,
    pub domain: String,
    pub cookies: usize,
}

#[derive(Debug, Clone, Serialize)]
pub struct CrawlProgress {
    pub stage: String,
    pub message: String,
    pub percent: f64,
}

#[derive(Debug, Clone, Serialize)]
pub struct DownloadProgress {
    pub completed: usize,
    pub total: usize,
    pub current_id: Option<String>,
    pub current_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub current_received: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub current_total: Option<u64>,
}

#[derive(Debug, Clone, Serialize)]
pub struct DownloadItemEvent {
    pub id: String,
    pub status: String,
    pub path: Option<String>,
    pub error: Option<String>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn settings_are_clamped() {
        let mut settings = AppSettings::defaults();
        settings.concurrency = 99;
        settings.max_items = 1;
        let settings = settings.normalized();
        assert_eq!(settings.concurrency, 5);
        assert_eq!(settings.max_items, 50);
    }
}
