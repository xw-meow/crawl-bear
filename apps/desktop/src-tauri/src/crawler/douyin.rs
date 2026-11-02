//! Normalize Douyin (TikTok China) video and image posts.
//!
//! Douyin's desktop pages are a shell that loads the player through signed
//! requests, so a plain HTTP fetch often only sees "视频数据加载中".  The mobile
//! share page (`iesdouyin.com/share/video/<id>`) server-renders the post info
//! into `window._ROUTER_DATA`, but only for a real mobile browser session.
//!
//! We therefore open that share page in a hidden iPhone-sized WebView, wait for
//! `videoInfoRes`, and turn it into direct resources:
//! - video posts -> the no-watermark MP4 play URL (`playwm` -> `play`)
//! - image/note posts -> each image URL
//!
//! The direct URLs are persistent (video_id based; the CDN redirect is resolved
//! at download time), so they can flow through the generic download pipeline.

use crate::core::models::{MediaKind, MediaResource, ResourceSource};
use crate::core::webview::CRAWL_INIT_SCRIPT;
use crate::crawler::browser::eval_json;
use serde::Deserialize;
use serde_json::Value;
use std::collections::HashSet;
use std::time::Duration;
use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};
use url::Url;

/// Douyin's share page only returns post data for a mobile browser UA.
const DOUYIN_MOBILE_UA: &str = "Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1";
const DOUYIN_WORKER_LABEL: &str = "douyin-worker";
const SHARE_BASE: &str = "https://www.iesdouyin.com/share/video/";

#[derive(Debug, Clone, Default)]
pub struct DouyinMedia {
    pub title: String,
    pub author: String,
    pub duration: Option<f64>,
    pub width: Option<u32>,
    pub height: Option<u32>,
    pub cover: Option<String>,
    pub video_url: Option<String>,
    pub images: Vec<String>,
}

#[derive(Debug, Default, Deserialize)]
struct RawMedia {
    #[serde(default)]
    error: String,
    #[serde(default)]
    title: String,
    #[serde(default)]
    author: String,
    #[serde(default)]
    duration_ms: f64,
    #[serde(default)]
    width: u32,
    #[serde(default)]
    height: u32,
    #[serde(default)]
    play: Vec<String>,
    #[serde(default)]
    download: Vec<String>,
    #[serde(default)]
    cover: Vec<String>,
    #[serde(default)]
    images: Vec<Vec<String>>,
}

fn host_of(url: &Url) -> String {
    url.host_str()
        .unwrap_or("")
        .trim_start_matches("www.")
        .to_ascii_lowercase()
}

/// `v.douyin.com/...` is the only form that needs a redirect to get an id.
pub fn is_short_link(raw: &str) -> bool {
    Url::parse(raw)
        .ok()
        .and_then(|url| url.host_str().map(str::to_ascii_lowercase))
        .map(|host| host == "v.douyin.com")
        .unwrap_or(false)
}

pub fn is_douyin_url(raw: &str) -> bool {
    Url::parse(raw)
        .ok()
        .and_then(|url| url.host_str().map(str::to_string))
        .map(|host| {
            let host = host.to_ascii_lowercase();
            host == "douyin.com"
                || host.ends_with(".douyin.com")
                || host == "iesdouyin.com"
                || host.ends_with(".iesdouyin.com")
        })
        .unwrap_or(false)
}

fn numeric_id(raw: &str) -> Option<String> {
    let value = raw.trim();
    (!value.is_empty() && value.chars().all(|ch| ch.is_ascii_digit())).then(|| value.to_string())
}

/// Parse an aweme id from `/video/<id>`, `/note/<id>`, `/share/video/<id>`
/// or `?modal_id=<id>`.
pub fn video_id(raw: &str) -> Option<String> {
    let url = Url::parse(raw).ok()?;
    if !is_douyin_url(raw) {
        return None;
    }
    if let Some(id) = url
        .query_pairs()
        .find(|(key, _)| key == "modal_id" || key == "vid")
        .and_then(|(_, value)| numeric_id(&value))
    {
        return Some(id);
    }
    let segments: Vec<&str> = url.path_segments()?.collect();
    let marker = segments
        .iter()
        .position(|segment| matches!(*segment, "video" | "note" | "share"))?;
    segments
        .iter()
        .skip(marker + 1)
        .find_map(|segment| numeric_id(segment))
}

/// Resolve a `v.douyin.com` share link through its redirect.
async fn resolve_video_id(client: &reqwest::Client, raw: &str) -> Result<String, String> {
    if let Some(id) = video_id(raw) {
        return Ok(id);
    }
    if !is_douyin_url(raw) {
        return Err("这不是一个抖音链接。".to_string());
    }
    let response = client
        .get(raw)
        .timeout(Duration::from_secs(20))
        .header("Referer", "https://www.douyin.com/")
        .send()
        .await
        .map_err(|error| format!("无法打开抖音分享链接: {error}"))?;
    let final_url = response.url().to_string();
    video_id(&final_url).ok_or_else(|| "无法从抖音分享链接里识别视频 ID。".to_string())
}

fn preferred_url(urls: &[String]) -> Option<String> {
    let usable = |url: &&String| url.starts_with("http://") || url.starts_with("https://");
    urls.iter()
        .filter(usable)
        .find(|url| !url.contains(".webp"))
        .or_else(|| urls.iter().filter(usable).next())
        .cloned()
        .map(|url| {
            if url.starts_with("http://") {
                format!("https://{}", &url["http://".len()..])
            } else {
                url
            }
        })
}

/// Douyin descriptions can be a whole article.  Keep the first line, short
/// enough for the results header and the saved filename.
fn display_title(description: &str) -> String {
    let first_line = description
        .lines()
        .map(str::trim)
        .find(|line| !line.is_empty())
        .unwrap_or("");
    let trimmed: String = first_line.chars().take(80).collect();
    if trimmed.is_empty() {
        "抖音作品".to_string()
    } else {
        trimmed
    }
}

fn media_from_raw(raw: RawMedia) -> Result<DouyinMedia, String> {
    let error = raw.error.trim();
    if !error.is_empty() {
        return Err(format!("抖音没有返回可下载内容：{error}"));
    }

    let images: Vec<String> = raw
        .images
        .iter()
        .filter_map(|urls| preferred_url(urls))
        .collect();
    let video_url = if images.is_empty() {
        preferred_url(&raw.play)
            .or_else(|| preferred_url(&raw.download))
            .map(|url| url.replace("playwm", "play"))
    } else {
        None
    };
    if video_url.is_none() && images.is_empty() {
        return Err("抖音没有返回可下载的视频或图片。".to_string());
    }

    let title = display_title(&raw.title);
    Ok(DouyinMedia {
        title,
        author: raw.author.trim().to_string(),
        duration: (raw.duration_ms > 0.0).then_some(raw.duration_ms / 1000.0),
        width: (raw.width > 0).then_some(raw.width),
        height: (raw.height > 0).then_some(raw.height),
        cover: preferred_url(&raw.cover),
        video_url,
        images,
    })
}

fn ready_js() -> &'static str {
    r#"JSON.stringify((() => {
      try {
        const ld = window._ROUTER_DATA && window._ROUTER_DATA.loaderData;
        if (ld) {
          for (const key of Object.keys(ld)) {
            const res = ld[key] && ld[key].videoInfoRes;
            if (res && (((res.item_list || []).length) || ((res.filter_list || []).length))) return true;
          }
        }
        const video = document.querySelector('video');
        return !!(video && video.currentSrc);
      } catch (e) {
        return false;
      }
    })())"#
}

fn extract_js() -> &'static str {
    r#"(() => {
      try {
        const ld = window._ROUTER_DATA && window._ROUTER_DATA.loaderData;
        if (ld) {
          for (const key of Object.keys(ld)) {
            const res = ld[key] && ld[key].videoInfoRes;
            if (!res) continue;
            const item = (res.item_list || [])[0];
            if (!item) {
              const filter = (res.filter_list || [])[0];
              return JSON.stringify({ error: (filter && (filter.detail_msg || filter.filter_reason)) || '作品不存在或不可见' });
            }
            const video = item.video || {};
            const play = (video.play_addr && video.play_addr.url_list) || [];
            const download = (video.download_addr && video.download_addr.url_list) || [];
            const cover = (video.cover && video.cover.url_list) || (video.origin_cover && video.origin_cover.url_list) || [];
            const images = (item.images || []).map(img => (img && img.url_list) || []).filter(list => list.length);
            return JSON.stringify({
              title: item.desc || '',
              author: (item.author && item.author.nickname) || '',
              duration_ms: video.duration || 0,
              width: video.width || 0,
              height: video.height || 0,
              play: play,
              download: download,
              cover: cover,
              images: images
            });
          }
        }
        const video = document.querySelector('video');
        if (video && video.currentSrc) {
          const coverMeta = document.querySelector('meta[property="og:image"]');
          const title = (document.title || '').replace(' - 抖音', '').trim();
          return JSON.stringify({
            title: title,
            author: '',
            duration_ms: 0,
            width: 0,
            height: 0,
            play: [video.currentSrc],
            cover: coverMeta && coverMeta.content ? [coverMeta.content] : [],
            images: []
          });
        }
        return JSON.stringify({ error: '抖音页面没有加载出作品数据' });
      } catch (e) {
        return JSON.stringify({ error: String(e) });
      }
    })()"#
}

/// `play_addr` normally asks for 720P.  The same endpoint accepts 1080P for
/// most posts; probe it and keep 720P as a fallback when it does not.
async fn preferred_play_url(client: &reqwest::Client, base: &str) -> String {
    let hd = base.replace("ratio=720p", "ratio=1080p");
    if hd != base {
        if let Ok(response) = client
            .get(&hd)
            .timeout(Duration::from_secs(20))
            .header("Referer", "https://www.douyin.com/")
            .header("Range", "bytes=0-0")
            .send()
            .await
        {
            if response.status().is_success() || response.status().as_u16() == 206 {
                return hd;
            }
        }
    }
    base.to_string()
}

async fn extract_media(
    app: &AppHandle,
    client: &reqwest::Client,
    aweme_id: &str,
) -> Result<DouyinMedia, String> {
    if let Some(old) = app.get_webview_window(DOUYIN_WORKER_LABEL) {
        let _ = old.close();
    }
    let share_url = format!("{SHARE_BASE}{aweme_id}/");
    let url = Url::parse(&share_url).map_err(|error| format!("抖音链接无效: {error}"))?;
    let win = WebviewWindowBuilder::new(app, DOUYIN_WORKER_LABEL, WebviewUrl::External(url))
        .title("正在解析抖音")
        .inner_size(480.0, 900.0)
        .visible(false)
        .skip_taskbar(true)
        .user_agent(DOUYIN_MOBILE_UA)
        .initialization_script(CRAWL_INIT_SCRIPT)
        .build()
        .map_err(|error| format!("无法创建抖音解析窗口: {error}"))?;

    let result = async {
        let deadline = std::time::Instant::now() + Duration::from_secs(20);
        loop {
            if let Ok(value) = eval_json(&win, ready_js(), Duration::from_secs(3)).await {
                if value.as_bool() == Some(true) {
                    break;
                }
            }
            if std::time::Instant::now() > deadline {
                let _ = win.close();
                return Err("抖音页面加载超时，可能需要登录或链接已失效。".to_string());
            }
            tokio::time::sleep(Duration::from_millis(300)).await;
        }

        let value = eval_json(&win, extract_js(), Duration::from_secs(10))
            .await
            .map_err(|error| format!("读取抖音数据失败: {}", error.message))?;
        let payload = match value {
            Value::String(inner) => serde_json::from_str::<Value>(&inner)
                .map_err(|error| format!("抖音数据无法解析: {error}"))?,
            other => other,
        };
        let raw: RawMedia = serde_json::from_value(payload)
            .map_err(|error| format!("抖音数据格式变化: {error}"))?;
        let mut media = media_from_raw(raw)?;
        if let Some(video_url) = &media.video_url {
            media.video_url = Some(preferred_play_url(client, video_url).await);
        }
        Ok(media)
    }
    .await;

    let _ = win.close();
    result
}

fn host_for_resource(url: &str) -> String {
    Url::parse(url)
        .ok()
        .map(|parsed| host_of(&parsed))
        .filter(|host| !host.is_empty())
        .unwrap_or_else(|| "douyin.com".to_string())
}

/// Images and fonts loaded by Douyin's own UI (buttons, favicon, twemoji,
/// tracking pixels) are not page content.
fn is_page_chrome(resource: &MediaResource) -> bool {
    let host = resource.host.to_ascii_lowercase();
    host.ends_with("douyinstatic.com")
        || host.ends_with("byteimg.com")
        || host.ends_with("bytedance.com")
        || host.ends_with("bytescm.com")
        || host.ends_with("baidu.com")
        || host.ends_with("snssdk.com")
}

/// Replace raw Douyin DASH/video fragments with clean video/image resources.
/// Returns the post title when the page was enhanced.
pub async fn normalize_video_resources(
    app: &AppHandle,
    page_url: &str,
    resources: &mut Vec<MediaResource>,
) -> Result<Option<String>, String> {
    if !is_douyin_url(page_url) {
        return Ok(None);
    }
    // User pages, search pages and live rooms have no single post to parse.
    if video_id(page_url).is_none() && !is_short_link(page_url) {
        return Ok(None);
    }
    let client =
        crate::core::net::client_with_user_agent(DOUYIN_MOBILE_UA, Duration::from_secs(25))
            .map_err(|error| format!("无法初始化抖音请求: {error}"))?;
    let aweme_id = resolve_video_id(&client, page_url).await?;
    let media = extract_media(app, &client, &aweme_id).await?;

    // Drop UI chrome, tracking pixels and raw stream fragments; keep the
    // post cover, author avatars and related-video covers found on the page.
    resources.retain(|resource| !is_page_chrome(resource));
    let mut existing: HashSet<String> = resources.iter().map(|r| r.url.clone()).collect();
    let mut added = false;

    // The post cover is a real asset even though the desktop page loads it
    // through CSS rather than an <img> tag.
    if media.video_url.is_some() {
        if let Some(cover) = &media.cover {
            if existing.insert(cover.clone()) {
                resources.push(MediaResource {
                    id: format!("douyin-{aweme_id}-cover"),
                    url: cover.clone(),
                    kind: MediaKind::Image,
                    source: ResourceSource::Link,
                    filename_hint: Some(format!("{} - 封面", media.title)),
                    width: media.width,
                    height: media.height,
                    duration: None,
                    poster: None,
                    alt: Some(media.title.clone()),
                    host: host_for_resource(cover),
                });
                added = true;
            }
        }
    }

    if let Some(video_url) = &media.video_url {
        if existing.insert(video_url.clone()) {
            resources.push(MediaResource {
                id: format!("douyin-{aweme_id}-video"),
                url: video_url.clone(),
                kind: MediaKind::Video,
                source: ResourceSource::Link,
                filename_hint: Some(media.title.clone()),
                width: media.width,
                height: media.height,
                duration: media.duration,
                poster: media.cover.clone(),
                alt: (!media.author.is_empty()).then(|| media.author.clone()),
                host: host_for_resource(video_url),
            });
            added = true;
        }
    }

    for (index, image_url) in media.images.iter().enumerate() {
        if !existing.insert(image_url.clone()) {
            continue;
        }
        resources.push(MediaResource {
            id: format!("douyin-{aweme_id}-image-{}", index + 1),
            url: image_url.clone(),
            kind: MediaKind::Image,
            source: ResourceSource::Link,
            filename_hint: Some(format!("{} - {}", media.title, index + 1)),
            width: None,
            height: None,
            duration: None,
            poster: None,
            alt: (!media.author.is_empty()).then(|| media.author.clone()),
            host: host_for_resource(image_url),
        });
        added = true;
    }

    if !added {
        return Err("抖音作品里没有找到可下载的媒体。".to_string());
    }
    Ok(Some(media.title))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_douyin_ids() {
        assert_eq!(
            video_id("https://www.douyin.com/video/7701943810087013673").as_deref(),
            Some("7701943810087013673")
        );
        assert_eq!(
            video_id("https://www.iesdouyin.com/share/video/7701943810087013673/?region=CN")
                .as_deref(),
            Some("7701943810087013673")
        );
        assert_eq!(
            video_id("https://www.douyin.com/jingxuan?modal_id=7701943810087013673").as_deref(),
            Some("7701943810087013673")
        );
        assert_eq!(
            video_id("https://www.douyin.com/note/7560000000000000000").as_deref(),
            Some("7560000000000000000")
        );
        assert_eq!(video_id("https://v.douyin.com/QBSW9wzOk38"), None);
        assert_eq!(video_id("https://example.com/video/123"), None);
    }

    #[test]
    fn recognizes_douyin_hosts() {
        assert!(is_douyin_url("https://v.douyin.com/abc"));
        assert!(is_douyin_url("https://www.iesdouyin.com/share/video/1"));
        assert!(!is_douyin_url("https://douyin.com.evil.test/video/1"));
        assert!(is_short_link("https://v.douyin.com/abc"));
        assert!(!is_short_link("https://www.douyin.com/video/1"));
    }

    #[test]
    fn builds_no_watermark_video_media() {
        let raw = RawMedia {
            title: "测试视频".to_string(),
            author: "作者".to_string(),
            duration_ms: 288_065.0,
            width: 1080,
            height: 1920,
            play: vec![
                "https://aweme.snssdk.com/aweme/v1/playwm/?ratio=720p&video_id=abc".to_string(),
            ],
            cover: vec!["https://p.example/cover.webp".to_string()],
            ..Default::default()
        };
        let media = media_from_raw(raw).unwrap();
        assert_eq!(media.title, "测试视频");
        assert_eq!(media.duration, Some(288.065));
        assert_eq!(
            media.video_url.as_deref(),
            Some("https://aweme.snssdk.com/aweme/v1/play/?ratio=720p&video_id=abc")
        );
        assert!(media.images.is_empty());
    }

    #[test]
    fn builds_image_post_media_and_prefers_jpeg() {
        let raw = RawMedia {
            title: "图集".to_string(),
            images: vec![
                vec![
                    "https://p.example/a.webp".to_string(),
                    "https://p.example/a.jpeg".to_string(),
                ],
                vec!["https://p.example/b.webp".to_string()],
            ],
            ..Default::default()
        };
        let media = media_from_raw(raw).unwrap();
        assert_eq!(
            media.images,
            vec![
                "https://p.example/a.jpeg".to_string(),
                "https://p.example/b.webp".to_string()
            ]
        );
        assert!(media.video_url.is_none());
    }

    #[test]
    fn keeps_only_the_first_title_line() {
        let raw = RawMedia {
            title: "第一行标题\n\n后面是很长的正文 ".to_string() + &"内容".repeat(100),
            play: vec!["https://aweme.snssdk.com/aweme/v1/playwm/?video_id=1".to_string()],
            ..Default::default()
        };
        let media = media_from_raw(raw).unwrap();
        assert_eq!(media.title, "第一行标题");
    }

    #[test]
    fn reports_filter_errors() {
        let raw = RawMedia {
            error: "作品已删除".to_string(),
            ..Default::default()
        };
        assert!(media_from_raw(raw).unwrap_err().contains("作品已删除"));
    }
}
