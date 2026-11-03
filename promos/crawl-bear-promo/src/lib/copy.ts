/**
 * All on-screen copy for the promo film, in one place.
 * Editing this file is the fastest way to re-cut the film.
 * Tone follows docs/design.md §8: the bear speaks in first person, the viewer is 你.
 */

export const COPY = {
  brand: {
    zh: "超级爬爬熊",
    en: "CRAWLBEAR",
    tagline: "把网页里的宝贝，收进采集袋。",
  },

  /**
   * 引子：像发一条帖子那样，用作者口吻请大家花一分钟看看这个小工具。
   * 它不介绍功能，只负责把人留下来，然后交给 Hook。
   */
  prologue: {
    eyebrow: "vibecoding 小项目 · 求交流",
    title: ["可以花一分钟，", "看看我的小工具吗？"],
    body: [
      "最近用「大肥鱼」vibecoding 了一个能抓取网页媒体素材的小工具。",
      "想和大家一起交流学习 vibecoding。",
    ],
    signature: "—— 爬爬熊，第一次冒泡",
    photoCaption: "大肥鱼",
    bridge: "它是怎么来的？",
  },

  /**
   * 诞生：故事转折点。不是产品标题卡，而是「我决定自己写一个」之后小熊登场，
   * 品牌名和 slogan 都在这里作为故事的一部分出现。
   */
  birth: {
    eyebrow: "于是",
    setup: "干脆，自己写一个。",
    reveal: "于是，爬爬熊诞生了。",
    bubble: "以后这种事，交给我。",
    tagline: "把网页里的宝贝，收进采集袋。",
  },

  problem: {
    eyebrow: "起因",
    title: "最近，我总想把网页里的素材存下来。",
    titleLines: ["最近，我总想把", "网页里的素材存下来。"],
    sub: "但现实是：右键、截图、找地址……",
    pains: [
      "右键另存为：一张一张来",
      "截图：带边框，还糊",
      "视频：地址根本找不到",
      "音乐 / 字体：更没辙",
    ],
    windowTitle: "unsplash.com",
    bubble: "这也太费劲了…",
  },

  paste: {
    eyebrow: "其实只要一步",
    title: "贴上网址，剩下的我来。",
    placeholder: "粘贴网页地址或分享文字",
    url: "www.bilibili.com",
    cta: "开始翻找",
    sub: "不用记格式，https:// 自动补。",
    bubble: "交给我。",
    autoFillHint: "自动补 https://",
    steps: ["贴网址", "翻找", "收好"],
  },

  crawl: {
    eyebrow: "正在翻找",
    title: "钻进网页，一件件翻。",
    sub: "懒加载、CSS 背景、og:image，一个都不放过。",
    status: ["扫描页面…", "翻找图片…", "抓住视频…", "收下字体…"],
    done: "翻好了",
    counters: [
      { label: "图片", value: 45 },
      { label: "视频", value: 8 },
      { label: "音乐", value: 12 },
      { label: "字体", value: 6 },
    ],
    bubble: "找到啦！",
  },

  results: {
    eyebrow: "翻好了",
    title: "四类媒体，一次翻出来。",
    sub: "点开先预览，看准了再收。",
    pageTitle: "百度一下，你就知道",
    pageHost: "www.baidu.com · baidu.com/",
    badge: "12 件宝贝",
    filters: [
      { label: "全部", value: 12 },
      { label: "图片", value: 5 },
      { label: "视频", value: 2 },
      { label: "音乐", value: 3 },
      { label: "字体", value: 2 },
    ],
    selectAll: "全选当前",
    preview: "预览",
  },

  collect: {
    eyebrow: "挑好就收",
    title: "勾选，收进采集袋。",
    sub: "并发下载，按站点归档，随时可以取消。",
    bagLabel: "已选",
    bagUnit: "件",
    cta: "收进采集袋",
    toast: "收好了，8 件都在袋子里。",
    path: "~/Downloads/CrawlBear/bilibili.com",
    stamp: "已收",
    finding: "在 Finder 中显示",
  },

  sites: {
    eyebrow: "专属解析",
    title: "难啃的站点，交给专属解析。",
    sub: "最高清的那一档，它自己挑。",
    chips: ["最高清晰度", "1080P", "无水印", "HLS → MP4"],
    sites: [
      { name: "X / Twitter", note: "推特视频取最高档" },
      { name: "YouTube", note: "1080P H.264 合并 MP4" },
      { name: "Bilibili", note: "WBI 签名 · 跟随账号画质" },
      { name: "抖音", note: "无水印 1080P" },
    ],
    badge: "专属解析已启用",
  },

  privacy: {
    eyebrow: "本机运行",
    title: "你的收藏，不经过任何人。",
    sub: "没有账号，没有云端，没有遥测。",
    points: ["不需要注册", "数据不出这台 Mac", "Cookie 只留在本机"],
  },

  outro: {
    tagline: "把网页里的宝贝，收进采集袋。",
    url: "we.miework.cn/crawl-bear",
    cta: "下载 macOS 版",
    meta: "macOS 13+ · MIT 开源 · 免费",
    bubble: "装满啦！",
  },
} as const;

/** Card filenames used by the results / collect mock-ups. */
/**
 * 去外链版本：给抖音等对 URL 敏感的平台用。
 * 所有域名换成占位符 `xxxx.xx.com`，落版不再出现网址。
 */
export const COPY_NO_LINK = {
  ...COPY,
  problem: {
    ...COPY.problem,
    windowTitle: "xxxx.xx.com",
  },
  paste: {
    ...COPY.paste,
    url: "xxxx.xx.com",
  },
  results: {
    ...COPY.results,
    pageTitle: "一个普通网页",
    pageHost: "xxxx.xx.com",
  },
  collect: {
    ...COPY.collect,
    path: "~/Downloads/CrawlBear/xxxx.xx.com",
  },
  outro: {
    ...COPY.outro,
    url: "Mac 上搜索：超级爬爬熊",
  },
};

export type MediaKind = "image" | "video" | "music" | "font";
export type MediaTone = "sky" | "leaf" | "berry" | "paper";

export type MediaItem = {
  readonly kind: MediaKind;
  readonly name: string;
  readonly meta: string;
  readonly tone: MediaTone;
};

export const MEDIA_ITEMS: readonly MediaItem[] = [
  { kind: "video", name: "forest.mp4", meta: "example.com · 01:03", tone: "sky" },
  { kind: "music", name: "honey-bear.mp3", meta: "example.com · 03:04", tone: "leaf" },
  { kind: "font", name: "HannotateSC.woff2", meta: "fonts.example.com · 4.2 MB", tone: "paper" },
  { kind: "image", name: "mountain-lake.jpg", meta: "images.unsplash.com · 2048×1365", tone: "leaf" },
  { kind: "video", name: "panda.webm", meta: "example.com · 00:12", tone: "sky" },
  { kind: "image", name: "snow-forest.png", meta: "images.unsplash.com · 1600×1067", tone: "berry" },
  { kind: "music", name: "river.wav", meta: "example.com · 00:42", tone: "leaf" },
  { kind: "font", name: "PingFang.ttf", meta: "fonts.example.com · 3.1 MB", tone: "paper" },
];

/**
 * 去外链版的「脱敏替换文案」：
 * - 专属解析一幕不再出现任何平台名，改成中性的站点类型；
 * - 落版不再出现下载/网址，改成「私聊作者获取」。
 */
export const NO_LINK = {
  sites: [
    { name: "视频站点", note: "专属解析 · 自动取最高清晰度", icon: "video" },
    { name: "图集站点", note: "专属解析 · 一次收全", icon: "image" },
    { name: "音频站点", note: "专属解析 · 无水印保存", icon: "music" },
    { name: "其他站点", note: "解析不了？提 GitHub Issue", icon: "folder" },
  ],
  outro: {
    hint: "需要安装包？",
    cta: "私聊作者获取",
    meta: "macOS 13+ · 免费",
  },
} as const;

/** MEDIA_ITEMS 的去外链版本（卡片里的域名统一换成占位符）。 */
export const MEDIA_ITEMS_NO_LINK: readonly MediaItem[] = MEDIA_ITEMS.map((item) => ({
  ...item,
  meta: item.meta.replace(/(?:[a-z0-9-]+\.)+[a-z]{2,}/g, "xxxx.xx.com"),
}));
