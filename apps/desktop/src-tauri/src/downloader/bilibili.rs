//! Bilibili page-video extraction.
//!
//! Bilibili plays DASH streams.  Its web player asks
//! `/x/player/wbi/playurl` for signed stream URLs, using WBI query signing
//! (`wts` + `w_rid`), and the CDN requires a `bilibili.com` referer.  We
//! reproduce that flow with the app's own cookies, so a signed-in user gets the
//! same quality as the website while anonymous users still get the public
//! 480P/360P streams.  Video and audio tracks are muxed into MP4 by the shared
//! resolver downloader.
//!
//! Short links (`b23.tv`) are resolved by following the redirect to the
//! canonical `/video/BV...` page.

use crate::core::md5;
use crate::downloader::resolvers::{PageVideoResolver, ResolvedMedia, StreamAsset};
use crate::session;
use async_trait::async_trait;
use serde_json::Value;
use std::collections::BTreeMap;
use std::time::Duration;
use tauri::AppHandle;
use url::Url;

const VIDEO_BASE: &str = "https://www.bilibili.com/video/";
const API_VIEW: &str = "https://api.bilibili.com/x/web-interface/view";
const API_NAV: &str = "https://api.bilibili.com/x/web-interface/nav";
const API_PLAYURL: &str = "https://api.bilibili.com/x/player/playurl";
const API_WBI_PLAYURL: &str = "https://api.bilibili.com/x/player/wbi/playurl";
const BILIBILI_REFERER: &str = "https://www.bilibili.com/";

/// Bilibili's fixed permutation for deriving the 32-char WBI mixin key.
const MIXIN_KEY_TAB: [usize; 64] = [
    46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49, 33, 9, 42, 19, 29,
    28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25,
    54, 21, 56, 59, 6, 63, 57, 62, 11, 36, 20, 34, 44, 52,
];

/// What a Bilibili URL points at.  `page` is 1-based (`?p=2`).
#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct VideoRef {
    pub bvid: Option<String>,
    pub aid: Option<u64>,
    pub page: usize,
}

#[derive(Debug, Clone)]
pub(crate) struct PageMeta {
    pub cid: u64,
    pub page: usize,
    pub part: String,
    pub duration: f64,
    pub width: Option<u32>,
    pub height: Option<u32>,
}

#[derive(Debug, Clone)]
pub(crate) struct VideoMeta {
    pub bvid: String,
    pub title: String,
    pub pic: String,
    pub pages: Vec<PageMeta>,
}

impl VideoMeta {
    /// Selected part, falling back to the first part when `?p=` is out of range.
    pub fn page(&self, number: usize) -> Option<&PageMeta> {
        self.pages
            .get(number.saturating_sub(1))
            .or_else(|| self.pages.first())
    }
}

fn host_of(url: &Url) -> String {
    url.host_str()
        .unwrap_or("")
        .trim_start_matches("www.")
        .to_ascii_lowercase()
}

fn is_bilibili_host(host: &str) -> bool {
    host == "bilibili.com" || host.ends_with(".bilibili.com")
}

/// Parse `/video/BV...`, `/video/av...` and `?p=` from any Bilibili page URL.
pub(crate) fn video_ref(raw: &str) -> Option<VideoRef> {
    let url = Url::parse(raw).ok()?;
    if !is_bilibili_host(&host_of(&url)) {
        return None;
    }
    let segments: Vec<&str> = url.path_segments()?.collect();
    let marker = segments.iter().position(|segment| *segment == "video")?;
    let id = *segments.get(marker + 1)?;
    let (bvid, aid) = if let Some(rest) = id.strip_prefix("BV") {
        if rest.len() < 10 || !rest.chars().all(|ch| ch.is_ascii_alphanumeric()) {
            return None;
        }
        (Some(id.to_string()), None)
    } else if let Some(rest) = id.strip_prefix("av") {
        (None, Some(rest.parse::<u64>().ok()?))
    } else {
        return None;
    };
    let page = url
        .query_pairs()
        .find(|(key, _)| key == "p")
        .and_then(|(_, value)| value.parse::<usize>().ok())
        .filter(|page| *page > 0)
        .unwrap_or(1);
    Some(VideoRef { bvid, aid, page })
}

/// `https://b23.tv/...` share links need a redirect before they carry an id.
pub(crate) fn is_short_link(raw: &str) -> bool {
    let Ok(url) = Url::parse(raw) else {
        return false;
    };
    let host = url.host_str().unwrap_or("").to_ascii_lowercase();
    host == "b23.tv" || host.ends_with(".b23.tv")
}

fn https_poster(raw: &str) -> String {
    if raw.starts_with("http://") {
        format!("https://{}", &raw["http://".len()..])
    } else {
        raw.to_string()
    }
}

fn http_client() -> Result<reqwest::Client, String> {
    crate::core::net::client_with_user_agent(
        crate::core::webview::SAFARI_USER_AGENT,
        Duration::from_secs(30),
    )
}

fn cookie_header(app: &AppHandle) -> String {
    session::cookie_header_for(app, BILIBILI_REFERER)
}

async fn get_json(client: &reqwest::Client, url: &str, cookie: &str) -> Result<Value, String> {
    let mut request = client
        .get(url)
        .timeout(Duration::from_secs(20))
        .header("Referer", BILIBILI_REFERER)
        .header("Accept", "application/json, text/plain, */*")
        .header("Accept-Language", "zh-CN,zh;q=0.9,en;q=0.6");
    if !cookie.is_empty() {
        request = request.header("Cookie", cookie);
    }
    let response = request
        .send()
        .await
        .map_err(|error| format!("无法访问 B 站接口: {error}"))?;
    if !response.status().is_success() {
        return Err(format!("B 站接口返回 HTTP {}。", response.status()));
    }
    response
        .json::<Value>()
        .await
        .map_err(|error| format!("B 站接口数据无法解析: {error}"))
}

fn api_error(code: i64, message: &str) -> String {
    let message = if message.trim().is_empty() {
        "未知错误"
    } else {
        message.trim()
    };
    match code {
        -101 => "B 站要求登录后才能获取这个视频，请先在「设置 → 登录管理」登录 B 站。".to_string(),
        -10403 => format!("这个视频需要大会员或充电后才能观看（{code}：{message}）。"),
        -404 | -400 => "视频不存在、已删除，或当前网络无法访问 B 站。".to_string(),
        -352 => {
            "B 站风控拦截了请求，请稍后重试，并在「设置 → 登录管理」打开 B 站登录。".to_string()
        }
        _ => format!("B 站返回错误（{code}：{message}）。"),
    }
}

/// Fetch title/parts from the public view API.  Works anonymously; with a
/// signed-in cookie it also unlocks the account's quality tier on playurl.
pub(crate) async fn fetch_meta(app: &AppHandle, video: &VideoRef) -> Result<VideoMeta, String> {
    let client = http_client()?;
    let cookie = cookie_header(app);
    fetch_meta_with(&client, &cookie, video).await
}

async fn fetch_meta_with(
    client: &reqwest::Client,
    cookie: &str,
    video: &VideoRef,
) -> Result<VideoMeta, String> {
    let endpoint = match (&video.bvid, video.aid) {
        (Some(bvid), _) => format!("{API_VIEW}?bvid={bvid}"),
        (None, Some(aid)) => format!("{API_VIEW}?aid={aid}"),
        _ => return Err("无法识别这个 B 站视频链接。".to_string()),
    };
    let data = get_json(client, &endpoint, cookie).await?;
    parse_meta(&data)
}

fn parse_meta(data: &Value) -> Result<VideoMeta, String> {
    let code = data["code"].as_i64().unwrap_or(-1);
    if code != 0 {
        let message = data["message"].as_str().unwrap_or("");
        return Err(api_error(code, message));
    }
    let body = &data["data"];
    let bvid = body["bvid"].as_str().unwrap_or("").trim().to_string();
    if bvid.is_empty() {
        return Err("B 站没有返回视频编号。".to_string());
    }
    let title = body["title"].as_str().unwrap_or("").trim().to_string();
    let title = if title.is_empty() {
        "B 站视频".to_string()
    } else {
        title
    };
    let pic = body["pic"].as_str().unwrap_or("");

    let default_width = body["dimension"]["width"]
        .as_u64()
        .map(|value| value as u32);
    let default_height = body["dimension"]["height"]
        .as_u64()
        .map(|value| value as u32);

    let mut pages = Vec::new();
    if let Some(items) = body["pages"].as_array() {
        for (index, page) in items.iter().enumerate() {
            let Some(cid) = page["cid"].as_u64() else {
                continue;
            };
            let width = page["dimension"]["width"]
                .as_u64()
                .map(|value| value as u32)
                .or(default_width);
            let height = page["dimension"]["height"]
                .as_u64()
                .map(|value| value as u32)
                .or(default_height);
            pages.push(PageMeta {
                cid,
                page: page["page"].as_u64().unwrap_or(index as u64 + 1) as usize,
                part: page["part"].as_str().unwrap_or("").trim().to_string(),
                duration: page["duration"].as_f64().unwrap_or(0.0),
                width,
                height,
            });
        }
    }
    if pages.is_empty() {
        let cid = body["cid"]
            .as_u64()
            .ok_or_else(|| "B 站视频缺少分 P 信息。".to_string())?;
        pages.push(PageMeta {
            cid,
            page: 1,
            part: title.clone(),
            duration: body["duration"].as_f64().unwrap_or(0.0),
            width: default_width,
            height: default_height,
        });
    }

    Ok(VideoMeta {
        bvid,
        title,
        pic: https_poster(pic),
        pages,
    })
}

/// 32-char WBI mixin key from the `img_url` / `sub_url` file names.
fn mixin_key(img_url: &str, sub_url: &str) -> Option<String> {
    let file_stem = |raw: &str| {
        raw.rsplit('/')
            .next()?
            .split('.')
            .next()
            .filter(|stem| !stem.is_empty())
            .map(str::to_string)
    };
    let raw = format!("{}{}", file_stem(img_url)?, file_stem(sub_url)?);
    let chars: Vec<char> = raw.chars().collect();
    let mut key = String::with_capacity(32);
    for index in MIXIN_KEY_TAB {
        key.push(*chars.get(index)?);
        if key.chars().count() == 32 {
            break;
        }
    }
    (key.chars().count() == 32).then_some(key)
}

/// `encodeURIComponent` behaviour for the ASCII parameters WBI signs.
fn uri_encode(value: &str) -> String {
    let mut encoded = String::with_capacity(value.len());
    for byte in value.bytes() {
        match byte {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => {
                encoded.push(byte as char)
            }
            _ => encoded.push_str(&format!("%{byte:02X}")),
        }
    }
    encoded
}

fn query_string(params: &[(&str, String)]) -> String {
    params
        .iter()
        .map(|(key, value)| format!("{key}={}", uri_encode(value)))
        .collect::<Vec<_>>()
        .join("&")
}

fn signed_query(params: &[(&str, String)], mixin: &str) -> String {
    let sorted: BTreeMap<&str, &String> = params.iter().map(|(key, value)| (*key, value)).collect();
    let query = sorted
        .iter()
        .map(|(key, value)| format!("{key}={}", uri_encode(value)))
        .collect::<Vec<_>>()
        .join("&");
    let w_rid = md5::hex(format!("{query}{mixin}").as_bytes());
    format!("{query}&w_rid={w_rid}")
}

fn now_seconds() -> String {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|duration| duration.as_secs())
        .unwrap_or(0)
        .to_string()
}

fn play_params(meta: &VideoMeta, page: &PageMeta, fnval: &str) -> Vec<(&'static str, String)> {
    vec![
        ("bvid", meta.bvid.clone()),
        ("cid", page.cid.to_string()),
        ("qn", "127".to_string()),
        ("fnval", fnval.to_string()),
        ("fnver", "0".to_string()),
        ("fourk", "1".to_string()),
    ]
}

async fn fetch_wbi_playurl(
    client: &reqwest::Client,
    cookie: &str,
    params: &[(&str, String)],
) -> Result<Value, String> {
    let nav = get_json(client, API_NAV, cookie).await?;
    let img_url = nav["data"]["wbi_img"]["img_url"]
        .as_str()
        .ok_or_else(|| "B 站没有返回 WBI 参数。".to_string())?;
    let sub_url = nav["data"]["wbi_img"]["sub_url"]
        .as_str()
        .ok_or_else(|| "B 站没有返回 WBI 参数。".to_string())?;
    let mixin = mixin_key(img_url, sub_url).ok_or_else(|| "B 站 WBI 参数格式变化。".to_string())?;

    let mut signed: Vec<(&str, String)> = params.to_vec();
    signed.push(("wts", now_seconds()));
    let query = signed_query(&signed, &mixin);
    get_json(client, &format!("{API_WBI_PLAYURL}?{query}"), cookie).await
}

/// Parse one playurl response into the best video/audio pair.  Falls back to
/// the progressive `durl` list when DASH is unavailable.
fn parse_formats(data: &Value) -> Result<Formats, String> {
    let code = data["code"].as_i64().unwrap_or(-1);
    if code != 0 {
        let message = data["message"].as_str().unwrap_or("");
        return Err(api_error(code, message));
    }
    let body = &data["data"];

    let video_tracks = body["dash"]["video"]
        .as_array()
        .cloned()
        .unwrap_or_default();
    if !video_tracks.is_empty() {
        let video = pick_video_track(&video_tracks)
            .ok_or_else(|| "B 站没有返回可下载的视频轨。".to_string())?;
        let audio_tracks = body["dash"]["audio"]
            .as_array()
            .cloned()
            .unwrap_or_default();
        return Ok(Formats {
            video,
            audio: pick_audio_track(&audio_tracks),
        });
    }

    if let Some(durl) = body["durl"].as_array().and_then(|items| items.first()) {
        if let Some(url) = durl["url"].as_str() {
            return Ok(Formats {
                video: StreamAsset {
                    url: url.to_string(),
                    size: durl["size"].as_u64(),
                },
                audio: None,
            });
        }
    }

    Err("B 站没有返回可下载的视频流（可能是付费、地区限制或需要登录）。".to_string())
}

struct Formats {
    video: StreamAsset,
    audio: Option<StreamAsset>,
}

fn track_url(track: &Value) -> Option<String> {
    track["baseUrl"]
        .as_str()
        .or_else(|| track["base_url"].as_str())
        .or_else(|| {
            track["backupUrl"]
                .as_array()
                .and_then(|urls| urls.first())
                .and_then(|url| url.as_str())
        })
        .filter(|url| !url.is_empty())
        .map(str::to_string)
}

fn track_height(track: &Value) -> Option<u64> {
    track["height"].as_u64()
}

fn is_h264(track: &Value) -> bool {
    let codecs = track["codecs"].as_str().unwrap_or("");
    let codecid = track["codecid"].as_u64().unwrap_or(0);
    codecs.starts_with("avc") || codecid == 7
}

/// Prefer H.264 (plays everywhere) among the highest resolutions, capped at
/// 1080P; Bilibili only exposes 4K as HEVC/AV1, which is a poor default for a
/// downloaded file.
fn pick_video_track(tracks: &[Value]) -> Option<StreamAsset> {
    let usable = |track: &&Value| track_url(track).is_some();
    let mut candidates: Vec<&Value> = tracks
        .iter()
        .filter(usable)
        .filter(|track| {
            track_height(track)
                .map(|height| height <= 1080)
                .unwrap_or(true)
        })
        .collect();
    if candidates.is_empty() {
        candidates = tracks.iter().filter(usable).collect();
    }
    candidates.sort_by_key(|track| {
        (
            is_h264(track),
            track_height(track).unwrap_or(0),
            track["bandwidth"].as_u64().unwrap_or(0),
        )
    });
    candidates.last().and_then(|track| {
        Some(StreamAsset {
            url: track_url(track)?,
            size: track["size"].as_u64(),
        })
    })
}

fn pick_audio_track(tracks: &[Value]) -> Option<StreamAsset> {
    tracks
        .iter()
        .filter_map(|track| {
            Some((
                track["bandwidth"].as_u64().unwrap_or(0),
                track_url(track)?,
                track["size"].as_u64(),
            ))
        })
        .max_by_key(|(bandwidth, _, _)| *bandwidth)
        .map(|(_, url, size)| StreamAsset { url, size })
}

async fn fetch_formats(
    client: &reqwest::Client,
    cookie: &str,
    meta: &VideoMeta,
    page: &PageMeta,
) -> Result<Formats, String> {
    let mut reasons: Vec<String> = Vec::new();

    let params = play_params(meta, page, "4048");
    match fetch_wbi_playurl(client, cookie, &params).await {
        Ok(data) => match parse_formats(&data) {
            Ok(formats) => return Ok(formats),
            Err(error) => reasons.push(error),
        },
        Err(error) => reasons.push(error),
    }

    // Unsigned endpoint: still accepted for some videos and networks.
    let plain = format!("{API_PLAYURL}?{}", query_string(&params));
    match get_json(client, &plain, cookie).await {
        Ok(data) => match parse_formats(&data) {
            Ok(formats) => return Ok(formats),
            Err(error) => reasons.push(error),
        },
        Err(error) => reasons.push(error),
    }

    // Progressive MP4 fallback (single file with audio).
    let progressive = play_params(meta, page, "1");
    let plain = format!("{API_PLAYURL}?{}", query_string(&progressive));
    match get_json(client, &plain, cookie).await {
        Ok(data) => match parse_formats(&data) {
            Ok(formats) => return Ok(formats),
            Err(error) => reasons.push(error),
        },
        Err(error) => reasons.push(error),
    }

    Err(reasons
        .pop()
        .unwrap_or_else(|| "B 站没有返回可下载的视频流。".to_string()))
}

async fn follow_short_link(client: &reqwest::Client, raw: &str) -> Result<String, String> {
    let response = client
        .get(raw)
        .timeout(Duration::from_secs(20))
        .header("Referer", BILIBILI_REFERER)
        .send()
        .await
        .map_err(|error| format!("无法打开 B 站短链接: {error}"))?;
    let final_url = response.url().to_string();
    if response.status().is_success() && video_ref(&final_url).is_some() {
        return Ok(final_url);
    }
    Err("B 站短链接无效或已过期，请打开视频页后复制完整地址。".to_string())
}

pub struct BilibiliResolver;

#[async_trait]
impl PageVideoResolver for BilibiliResolver {
    fn id(&self) -> &'static str {
        "bilibili-dash"
    }

    fn supports(&self, url: &str) -> bool {
        video_ref(url).is_some() || is_short_link(url)
    }

    async fn resolve(&self, app: &AppHandle, url: &str) -> Result<ResolvedMedia, String> {
        let client = http_client()?;
        let canonical = if is_short_link(url) {
            follow_short_link(&client, url).await?
        } else {
            url.to_string()
        };
        let video =
            video_ref(&canonical).ok_or_else(|| "无法识别这个 B 站视频链接。".to_string())?;
        let cookie = cookie_header(app);
        let meta = fetch_meta_with(&client, &cookie, &video).await?;
        let page = meta
            .page(video.page)
            .ok_or_else(|| "这个视频没有可用的分 P。".to_string())?;
        let formats = fetch_formats(&client, &cookie, &meta, page).await?;

        Ok(ResolvedMedia {
            page_url: format!("{VIDEO_BASE}{}?p={}", meta.bvid, page.page),
            video: formats.video,
            audio: formats.audio,
            container: "mp4".to_string(),
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn parses_video_urls() {
        let video =
            video_ref("https://www.bilibili.com/video/BV1upXzBxEkp/?spm_id_from=333").unwrap();
        assert_eq!(video.bvid.as_deref(), Some("BV1upXzBxEkp"));
        assert_eq!(video.aid, None);
        assert_eq!(video.page, 1);

        let video = video_ref("https://www.bilibili.com/video/BV1upXzBxEkp?p=3").unwrap();
        assert_eq!(video.page, 3);

        let video = video_ref("https://m.bilibili.com/video/av12345").unwrap();
        assert_eq!(video.aid, Some(12345));
        assert_eq!(video.bvid, None);

        assert_eq!(
            video_ref("https://www.bilibili.com/bangumi/play/ep123"),
            None
        );
        assert_eq!(video_ref("https://youtube.com/watch?v=abc"), None);
        assert_eq!(video_ref("https://www.bilibili.com/video/not-an-id"), None);
    }

    #[test]
    fn recognizes_short_links() {
        assert!(is_short_link("https://b23.tv/abc123"));
        assert!(is_short_link("https://m.b23.tv/abc123"));
        assert!(!is_short_link(
            "https://www.bilibili.com/video/BV1upXzBxEkp"
        ));
    }

    #[test]
    fn derives_wbi_mixin_key() {
        let key = mixin_key(
            "https://i0.hdslb.com/bfs/wbi/7cd084941338484aae1ad9425b84077c.png",
            "https://i0.hdslb.com/bfs/wbi/4932caff0ff746eab6f01bf08b70ac45.png",
        )
        .unwrap();
        assert_eq!(key, "ea1db124af3c7062474693fa704f4ff8");
    }

    #[test]
    fn signs_wbi_query_with_sorted_params() {
        let params = vec![
            ("bvid", "BV1upXzBxEkp".to_string()),
            ("cid", "37115856555".to_string()),
            ("qn", "127".to_string()),
            ("fnval", "4048".to_string()),
            ("fnver", "0".to_string()),
            ("fourk", "1".to_string()),
            ("wts", "1793590000".to_string()),
        ];
        assert_eq!(
            signed_query(&params, "ea1db124af3c7062474693fa704f4ff8"),
            "bvid=BV1upXzBxEkp&cid=37115856555&fnval=4048&fnver=0&fourk=1&qn=127&wts=1793590000&w_rid=4c6396b5c19d9ee00a58a8cd28c9fd6c"
        );
    }

    #[test]
    fn parses_multipart_metadata() {
        let data = json!({
            "code": 0,
            "data": {
                "bvid": "BV1upXzBxEkp",
                "aid": 116322511952695u64,
                "title": "测试视频",
                "pic": "http://i1.hdslb.com/bfs/archive/cover.jpg",
                "dimension": { "width": 3840, "height": 2160 },
                "pages": [
                    { "cid": 111, "page": 1, "part": "上集", "duration": 120, "dimension": { "width": 1920, "height": 1080 } },
                    { "cid": 222, "page": 2, "part": "下集", "duration": 90 }
                ]
            }
        });
        let meta = parse_meta(&data).unwrap();
        assert_eq!(meta.bvid, "BV1upXzBxEkp");
        assert_eq!(meta.pic, "https://i1.hdslb.com/bfs/archive/cover.jpg");
        assert_eq!(meta.pages.len(), 2);
        assert_eq!(meta.page(2).unwrap().cid, 222);
        assert_eq!(meta.page(2).unwrap().part, "下集");
        // Missing per-page dimension inherits the video-level one.
        assert_eq!(meta.page(2).unwrap().width, Some(3840));
        // Out-of-range part numbers fall back to the first page.
        assert_eq!(meta.page(9).unwrap().cid, 111);
    }

    #[test]
    fn reports_api_errors() {
        let data = json!({ "code": -404, "message": "啥都木有", "data": null });
        assert!(parse_meta(&data).unwrap_err().contains("视频不存在"));
        let data = json!({ "code": 0, "data": { "bvid": "BV1", "cid": 7, "title": "x" } });
        let meta = parse_meta(&data).unwrap();
        assert_eq!(meta.pages[0].cid, 7);
    }

    #[test]
    fn picks_h264_and_best_audio() {
        let tracks = vec![
            json!({ "baseUrl": "https://cdn/360.m4s", "height": 360, "codecs": "avc1.64001E", "bandwidth": 200_000 }),
            json!({ "baseUrl": "https://cdn/1080.m4s", "height": 1080, "codecs": "hev1.1.6.L120.90", "bandwidth": 2_000_000 }),
            json!({ "baseUrl": "https://cdn/720.m4s", "height": 720, "codecs": "avc1.64001F", "bandwidth": 1_200_000 }),
            json!({ "backupUrl": ["https://backup/4k.m4s"], "height": 2160, "codecs": "av01.0.00M.10.0", "bandwidth": 8_000_000 }),
        ];
        let chosen = pick_video_track(&tracks).unwrap();
        // H.264 720P beats HEVC 1080P for out-of-the-box playback.
        assert_eq!(chosen.url, "https://cdn/720.m4s");

        let audio = vec![
            json!({ "baseUrl": "https://cdn/a-low.m4s", "bandwidth": 65_680 }),
            json!({ "baseUrl": "https://cdn/a-high.m4s", "bandwidth": 182_620 }),
        ];
        assert_eq!(
            pick_audio_track(&audio).unwrap().url,
            "https://cdn/a-high.m4s"
        );
    }

    #[test]
    fn parses_dash_and_progressive_formats() {
        let dash = json!({
            "code": 0,
            "data": {
                "dash": {
                    "video": [{ "baseUrl": "https://cdn/v.m4s", "height": 720, "codecs": "avc1", "bandwidth": 1 }],
                    "audio": [{ "baseUrl": "https://cdn/a.m4s", "bandwidth": 1 }]
                }
            }
        });
        let formats = parse_formats(&dash).unwrap();
        assert_eq!(formats.video.url, "https://cdn/v.m4s");
        assert_eq!(formats.audio.unwrap().url, "https://cdn/a.m4s");

        let progressive = json!({
            "code": 0,
            "data": { "durl": [{ "url": "https://cdn/all.mp4", "size": 1234 }] }
        });
        let formats = parse_formats(&progressive).unwrap();
        assert_eq!(formats.video.url, "https://cdn/all.mp4");
        assert_eq!(formats.video.size, Some(1234));
        assert!(formats.audio.is_none());
    }

    #[tokio::test]
    #[ignore = "network integration test"]
    async fn extracts_the_reported_video() {
        let client = http_client().expect("client");
        let video = video_ref("https://www.bilibili.com/video/BV1upXzBxEkp/").expect("video ref");
        let meta = fetch_meta_with(&client, "", &video)
            .await
            .expect("metadata");
        assert_eq!(meta.bvid, "BV1upXzBxEkp");
        assert!(!meta.title.is_empty());

        let page = meta.page(1).expect("first part");
        let formats = fetch_formats(&client, "", &meta, page)
            .await
            .expect("formats");
        assert!(formats.video.url.starts_with("https://"));
        assert!(formats.audio.is_some(), "DASH video is video-only");

        // The downloader sends the page URL as Referer; the CDN must accept it.
        let response = client
            .get(&formats.video.url)
            .header(
                "Referer",
                format!("https://www.bilibili.com/video/{}", meta.bvid),
            )
            .header("Range", "bytes=0-1023")
            .send()
            .await
            .expect("cdn request");
        assert!(
            response.status().is_success() || response.status().as_u16() == 206,
            "unexpected CDN status {}",
            response.status()
        );
    }

    #[tokio::test]
    #[ignore = "network integration test"]
    async fn resolves_b23_short_link() {
        let client = http_client().expect("client");
        let canonical = follow_short_link(&client, "https://b23.tv/BV1upXzBxEkp")
            .await
            .expect("short link");
        assert!(canonical.contains("/video/BV1upXzBxEkp"), "got {canonical}");
    }
}
