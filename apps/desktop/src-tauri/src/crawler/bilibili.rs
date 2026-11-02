//! Normalize Bilibili video resources.
//!
//! A Bilibili page exposes cover images plus DASH fragments (`.m4s`) that are
//! useless on their own.  The view API gives us the canonical title, every
//! part (`?p=`) and its cid, so the results page can show one clean video entry
//! per part, and the downloader resolver can pick the stream when the user
//! saves it.

use crate::core::models::{MediaKind, MediaResource, ResourceSource};
use crate::downloader::bilibili;
use std::collections::HashSet;
use tauri::AppHandle;

fn is_dash_fragment(resource: &MediaResource) -> bool {
    resource.kind == MediaKind::Video
        && (resource.host.ends_with("bilivideo.com")
            || resource.host.ends_with("bilivideo.cn")
            || resource.host.ends_with("hdslb.com")
            || resource.url.contains(".m4s"))
}

fn part_label(page: &bilibili::PageMeta) -> String {
    page.part.trim().to_string()
}

fn video_resource(
    meta: &bilibili::VideoMeta,
    page: &bilibili::PageMeta,
    multi_part: bool,
) -> MediaResource {
    let part = part_label(page);
    let filename_hint = if multi_part {
        if part.is_empty() {
            format!("{} - P{}", meta.title, page.page)
        } else {
            format!("{} - P{} {}", meta.title, page.page, part)
        }
    } else {
        meta.title.clone()
    };
    MediaResource {
        id: format!("bilibili-{}-p{}", meta.bvid, page.page),
        url: format!(
            "https://www.bilibili.com/video/{}?p={}",
            meta.bvid, page.page
        ),
        kind: MediaKind::Video,
        source: ResourceSource::Link,
        filename_hint: Some(filename_hint),
        width: page.width,
        height: page.height,
        duration: (page.duration > 0.0).then_some(page.duration),
        poster: (!meta.pic.is_empty()).then(|| meta.pic.clone()),
        alt: (!part.is_empty()).then_some(part),
        host: "bilibili.com".to_string(),
    }
}

/// Returns the clean video title when the page was enhanced.
pub async fn normalize_video_resources(
    app: &AppHandle,
    page_url: &str,
    resources: &mut Vec<MediaResource>,
) -> Option<String> {
    let video = bilibili::video_ref(page_url)?;
    let meta = bilibili::fetch_meta(app, &video).await.ok()?;

    // Drop raw DASH/CDN fragments; the canonical page entry replaces them.
    resources.retain(|resource| !is_dash_fragment(resource));

    let multi_part = meta.pages.len() > 1;
    let mut existing: HashSet<String> = resources.iter().map(|r| r.url.clone()).collect();
    let mut added = false;
    for page in &meta.pages {
        let resource = video_resource(&meta, page, multi_part);
        if !existing.insert(resource.url.clone()) {
            continue;
        }
        resources.push(resource);
        added = true;
    }
    added.then(|| meta.title.clone())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn page(cid: u64, number: usize, part: &str) -> bilibili::PageMeta {
        bilibili::PageMeta {
            cid,
            page: number,
            part: part.to_string(),
            duration: 90.0,
            width: Some(1920),
            height: Some(1080),
        }
    }

    fn meta(title: &str, pages: Vec<bilibili::PageMeta>) -> bilibili::VideoMeta {
        bilibili::VideoMeta {
            bvid: "BV1upXzBxEkp".to_string(),
            title: title.to_string(),
            pic: "https://i1.hdslb.com/cover.jpg".to_string(),
            pages,
        }
    }

    #[test]
    fn builds_one_clean_entry_for_single_part() {
        let meta = meta("测试视频", vec![page(1, 1, "正片")]);
        let resource = video_resource(&meta, &meta.pages[0], false);
        assert_eq!(
            resource.url,
            "https://www.bilibili.com/video/BV1upXzBxEkp?p=1"
        );
        assert_eq!(resource.filename_hint.as_deref(), Some("测试视频"));
        assert_eq!(
            resource.poster.as_deref(),
            Some("https://i1.hdslb.com/cover.jpg")
        );
        assert_eq!(resource.duration, Some(90.0));
        assert_eq!(resource.kind, MediaKind::Video);
    }

    #[test]
    fn labels_each_part_of_a_multipart_video() {
        let meta = meta("比赛回放", vec![page(1, 1, "第一局"), page(2, 2, "第二局")]);
        let first = video_resource(&meta, &meta.pages[0], true);
        let second = video_resource(&meta, &meta.pages[1], true);
        assert_eq!(first.filename_hint.as_deref(), Some("比赛回放 - P1 第一局"));
        assert_eq!(
            second.filename_hint.as_deref(),
            Some("比赛回放 - P2 第二局")
        );
        assert_ne!(first.id, second.id);
    }

    #[test]
    fn drops_dash_fragments_only() {
        let fragment = MediaResource {
            id: "1".to_string(),
            url: "https://xy.bilivideo.com/upgcxcode/a.m4s".to_string(),
            kind: MediaKind::Video,
            source: ResourceSource::Performance,
            filename_hint: None,
            width: None,
            height: None,
            duration: None,
            poster: None,
            alt: None,
            host: "xy.bilivideo.com".to_string(),
        };
        let mut image = fragment.clone();
        image.kind = MediaKind::Image;
        image.host = "i0.hdslb.com".to_string();
        assert!(is_dash_fragment(&fragment));
        assert!(!is_dash_fragment(&image));
    }
}
