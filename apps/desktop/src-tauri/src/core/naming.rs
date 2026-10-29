use std::path::{Path, PathBuf};

pub fn sanitize_filename(input: &str, max_chars: usize) -> String {
    let mut out = String::new();
    for ch in input.chars() {
        if "\\/:*?\"<>|".contains(ch) || ch.is_control() {
            out.push('_');
        } else {
            out.push(ch);
        }
        if out.chars().count() >= max_chars {
            break;
        }
    }
    let trimmed = out.trim().trim_matches('.').to_string();
    if trimmed.is_empty() { "media".to_string() } else { trimmed }
}

pub fn filename_from_url(url: &url::Url) -> Option<String> {
    let last = url.path_segments()?.filter(|s| !s.is_empty()).last()?;
    let decoded = percent_encoding::percent_decode_str(last)
        .decode_utf8_lossy()
        .to_string();
    if decoded.is_empty() { None } else { Some(decoded) }
}

pub fn extension_from_url(url: &url::Url) -> Option<String> {
    let name = filename_from_url(url)?;
    Path::new(&name)
        .extension()
        .and_then(|ext| ext.to_str())
        .map(|ext| ext.to_ascii_lowercase())
}

pub fn extension_for_content_type(content_type: &str) -> Option<&'static str> {
    let mime = content_type.split(';').next().unwrap_or("").trim().to_ascii_lowercase();
    match mime.as_str() {
        "image/jpeg" => Some("jpg"),
        "image/png" => Some("png"),
        "image/webp" => Some("webp"),
        "image/gif" => Some("gif"),
        "image/avif" => Some("avif"),
        "image/svg+xml" => Some("svg"),
        "image/x-icon" | "image/vnd.microsoft.icon" => Some("ico"),
        "video/mp4" => Some("mp4"),
        "video/webm" => Some("webm"),
        "video/quicktime" => Some("mov"),
        "video/x-matroska" => Some("mkv"),
        "audio/mpeg" => Some("mp3"),
        "audio/mp4" | "audio/x-m4a" => Some("m4a"),
        "audio/wav" | "audio/x-wav" => Some("wav"),
        "audio/ogg" => Some("ogg"),
        "audio/flac" => Some("flac"),
        "font/woff" => Some("woff"),
        "font/woff2" => Some("woff2"),
        "font/ttf" | "application/x-font-ttf" => Some("ttf"),
        "font/otf" | "application/x-font-opentype" => Some("otf"),
        _ => None,
    }
}

pub fn unique_path(folder: &Path, stem: &str, ext: &str) -> PathBuf {
    let mut candidate = folder.join(format!("{stem}.{ext}"));
    let mut i = 1usize;
    while candidate.exists() && i < 1000 {
        candidate = folder.join(format!("{stem} ({i}).{ext}"));
        i += 1;
    }
    candidate
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn sanitizes_reserved_characters() {
        assert_eq!(sanitize_filename("a/b:c*?", 64), "a_b_c__");
        assert_eq!(sanitize_filename("   ", 64), "media");
    }

    #[test]
    fn maps_common_content_types() {
        assert_eq!(extension_for_content_type("image/jpeg; charset=binary"), Some("jpg"));
        assert_eq!(extension_for_content_type("video/mp4"), Some("mp4"));
        assert_eq!(extension_for_content_type("audio/mpeg"), Some("mp3"));
        assert_eq!(extension_for_content_type("font/woff2"), Some("woff2"));
        assert_eq!(extension_for_content_type("text/html"), None);
    }

    #[test]
    fn filename_from_url_decodes_percent_encoding() {
        let url = url::Url::parse("https://cdn.example.com/a/%E7%85%A7%E7%89%87.png?x=1").unwrap();
        assert_eq!(filename_from_url(&url).as_deref(), Some("照片.png"));
        assert_eq!(extension_from_url(&url).as_deref(), Some("png"));
    }
}
