import { useState } from "react";
import type { ComponentType } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRightIcon,
  CheckIcon,
  DownloadIcon,
  EyeIcon,
  GithubIcon,
  GlobeIcon,
  LayersIcon,
  LockIcon,
  PawIcon,
  ShieldIcon,
  SparkIcon,
} from "./components/Icons";
import { SmartImage } from "./components/SmartImage";

const REPO = "https://github.com/xw-meow/crawl-bear";
const RELEASES = `${REPO}/releases`;
const README = `${REPO}#readme`;
const INSTALL = `${REPO}/blob/main/docs/INSTALL-macOS.md`;

type Feature = {
  icon: ComponentType<{ size?: number }>;
  title: string;
  body: string;
};

const FEATURES: Feature[] = [
  {
    icon: GlobeIcon,
    title: "任意网站",
    body: "粘贴网址或分享文字，自动补齐 https，不用记格式。",
  },
  {
    icon: LayersIcon,
    title: "四类媒体",
    body: "图片、视频、音乐、字体一次翻出来，按类型筛选计数。",
  },
  {
    icon: EyeIcon,
    title: "即点即看",
    body: "点卡片先预览：大图、视频播放、字体样张都在弹窗里。",
  },
  {
    icon: LockIcon,
    title: "登录复用",
    body: "需要登录的站点在独立窗口手动登录，Cookie 只留在本机。",
  },
  {
    icon: DownloadIcon,
    title: "批量收袋",
    body: "并发下载、随时取消，HLS/DASH 自动合并 MP4，按域名归档。",
  },
  {
    icon: SparkIcon,
    title: "专站解析",
    body: "X、YouTube 等站点自动挑最高清晰度，结果页会亮起专属解析标签。",
  },
];

const STEPS = [
  {
    number: "01",
    title: "贴上网页地址",
    body: "首页只有一个输入框，粘贴、回车，剩下的交给小熊。",
  },
  {
    number: "02",
    title: "小熊翻找",
    body: "页面在后台被滚动、扫描，图片、视频、音乐、字体一件件落进结果页。",
  },
  {
    number: "03",
    title: "收进采集袋",
    body: "筛选、预览、勾选，批量保存到你的文件夹，按站点自动归档。",
  },
];

const asset = (path: string) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;

const SHOTS = [
  { id: "home", label: "首页", src: asset("/assets/shots/home.webp"), caption: "一个输入框，一屏就够" },
  { id: "results", label: "结果页", src: asset("/assets/shots/results.webp"), caption: "分类筛选，勾选后批量收袋" },
  { id: "settings", label: "设置", src: asset("/assets/shots/settings.webp"), caption: "保存位置、扩展、并发与登录站点" },
];

const TECH = [
  "Tauri 2",
  "Rust",
  "React 18",
  "TypeScript",
  "Vite",
  "framer-motion",
  "FFmpeg 扩展",
  "系统代理",
];

export default function App() {
  const reduceMotion = useReducedMotion();
  const [shot, setShot] = useState(SHOTS[1]);

  return (
    <div className="site">
      <div className="paper" aria-hidden="true" />

      <header className="nav">
        <a className="nav__brand" href="#top" aria-label="超级爬爬熊 CrawlBear 首页">
          <img src={asset("/assets/brand/bear-logo.webp")} alt="" />
          <span>
            <strong>超级爬爬熊</strong>
            <em>CrawlBear</em>
          </span>
        </a>
        <nav className="nav__links" aria-label="主导航">
          <a href="#features">功能</a>
          <a href="#smart">解析</a>
          <a href="#screens">界面</a>
          <a href="#tech">技术</a>
          <a href="#install">安装</a>
          <a href="#download">下载</a>
        </nav>
        <a className="nav__github" href={REPO} target="_blank" rel="noreferrer">
          <GithubIcon size={18} />
          GitHub
        </a>
      </header>

      <main id="top">
        <section className="hero">
          <motion.div
            className="hero__copy"
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
          >
            <span className="eyebrow">
              <PawIcon size={13} />
              macOS · 本机运行 · MIT 开源
            </span>
            <h1>
              把网页里的宝贝，
              <br />
              <span className="mark">收进采集袋。</span>
            </h1>
            <p className="hero__lede">
              输入一个网址，把图片、视频、音乐、字体全部分类找出来。
            </p>
            <div className="hero__actions">
              <a className="btn btn--primary" href={RELEASES} target="_blank" rel="noreferrer">
                <DownloadIcon size={18} />
                下载 macOS 版
              </a>
              <a className="btn" href={REPO} target="_blank" rel="noreferrer">
                <GithubIcon size={17} />
                查看源码
              </a>
            </div>
          </motion.div>

          <motion.div
            className="hero__art"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
          >
            <span className="hero__blob" aria-hidden="true" />
            <SmartImage
              className="hero__bear"
              primary={asset("/assets/generated/hero.png")}
              fallback={asset("/assets/brand/bear-hero.webp")}
              alt="小熊爬爬抱着采集袋挥手"
            />
            <span className="sticker sticker--jpg">JPG</span>
            <span className="sticker sticker--mp4">MP4</span>
            <span className="sticker sticker--mp3">MP3</span>
            <span className="sticker sticker--font">WOFF2</span>
            <span className="hero__spark" aria-hidden="true">
              <SparkIcon size={26} />
            </span>
          </motion.div>
        </section>

        <section className="section" id="features">
          <div className="section__head">
            <span className="eyebrow">
              <SparkIcon size={12} />
              能做什么
            </span>
            <h2>一次翻遍网页里的媒体</h2>
          </div>

          <div className="features">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.article
                  key={feature.title}
                  className="feature"
                  initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.35, delay: index * 0.04 }}
                  whileHover={reduceMotion ? undefined : { y: -4 }}
                >
                  <span className="feature__icon">
                    <Icon size={20} />
                  </span>
                  <h3>{feature.title}</h3>
                  <p>{feature.body}</p>
                </motion.article>
              );
            })}
          </div>
        </section>

        <section className="section split" id="preview">
          <motion.div
            className="split__art"
            initial={reduceMotion ? false : { opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.4 }}
          >
            <SmartImage
              primary={asset("/assets/generated/preview.png")}
              fallback={asset("/assets/brand/bear-happy.webp")}
              alt="小熊抱着装满媒体文件的采集袋"
            />
            <span className="split__tag">先看，再收</span>
          </motion.div>
          <motion.div
            className="split__copy"
            initial={reduceMotion ? false : { opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.4, delay: 0.08 }}
          >
            <span className="eyebrow">
              <EyeIcon size={12} />
              预览
            </span>
            <h2>点一下，先看再收。</h2>
            <ul className="checks">
              <li>
                <CheckIcon size={15} />
                图片 / 视频 / 音频 / 字体分别适配
              </li>
              <li>
                <CheckIcon size={15} />
                保留尺寸、时长、域名等元信息
              </li>
              <li>
                <CheckIcon size={15} />
                预览不会向网站回传任何操作
              </li>
            </ul>
          </motion.div>
        </section>

        <section className="section split" id="smart">
          <motion.div
            className="split__art"
            initial={reduceMotion ? false : { opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.4 }}
          >
            <SmartImage
              primary={asset("/assets/generated/resolver.png")}
              fallback={asset("/assets/brand/bear-crawl.webp")}
              alt="小熊拿着放大镜和工具，正在调校一枚媒体解析齿轮"
            />
            <span className="split__tag">最高清晰度</span>
          </motion.div>
          <motion.div
            className="split__copy"
            initial={reduceMotion ? false : { opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.4, delay: 0.08 }}
          >
            <span className="eyebrow">
              <SparkIcon size={12} />
              专属解析
            </span>
            <h2>难啃的站点，交给专属解析。</h2>
            <ul className="checks">
              <li>
                <CheckIcon size={15} />
                X 视频自动取最高档，避开低清 HLS 变体
              </li>
              <li>
                <CheckIcon size={15} />
                YouTube 走应用内解析，不依赖外部下载器
              </li>
              <li>
                <CheckIcon size={15} />
                遇到难抓取的站点？{" "}
                <a
                  className="checks__link"
                  href={`${REPO}/issues`}
                  target="_blank"
                  rel="noreferrer"
                >
                  在 GitHub 提 Issue
                </a>
                ，我们会逐步支持。
              </li>
            </ul>
          </motion.div>
        </section>

        <section className="section" id="how">
          <div className="section__head">
            <span className="eyebrow">
              <PawIcon size={12} />
              使用方法
            </span>
            <h2>三步，收工。</h2>
          </div>
          <div className="steps">
            {STEPS.map((step) => (
              <article className="step" key={step.number}>
                <span className="step__number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section" id="screens">
          <div className="section__head">
            <span className="eyebrow">
              <LayersIcon size={12} />
              界面
            </span>
            <h2>安静、干净、有点憨。</h2>
            <p>固定顶栏，页面不跳；结果页独立滚动，翻找与整理互不打扰。</p>
          </div>

          <div className="shots">
            <div className="shots__tabs" role="tablist" aria-label="界面预览">
              {SHOTS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={shot.id === item.id}
                  className="shots__tab"
                  onClick={() => setShot(item)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="shots__frame">
              <div className="shots__chrome" aria-hidden="true">
                <span />
                <span />
                <span />
                <em>{shot.caption}</em>
              </div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.img
                  key={shot.id}
                  src={shot.src}
                  alt={`${shot.label}界面截图`}
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.24 }}
                />
              </AnimatePresence>
            </div>
          </div>
        </section>

        <section className="tech" id="tech">
          <div className="tech__inner">
            <div>
              <span className="eyebrow eyebrow--light">
                <ShieldIcon size={12} />
                技术
              </span>
              <h2>
                桌面级的小工具，
                <br />
                不是网页套壳。
              </h2>
              <a className="btn btn--light" href={`${REPO}/tree/main/docs`} target="_blank" rel="noreferrer">
                阅读架构文档
                <ArrowRightIcon size={16} />
              </a>
            </div>
            <ul className="tech__chips">
              {TECH.map((chip) => (
                <li key={chip}>{chip}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section install" id="install">
          <div className="install__card">
            <div className="install__copy">
              <span className="eyebrow">
                <DownloadIcon size={12} />
                安装
              </span>
              <h2>第一次打开，按这三步来。</h2>
              <p className="install__lede">
                我们没有预算购买 Apple Developer Program（$99/年），所以安装包没有做
                Apple 公证。macOS 首次打开会拦一下。
              </p>
              <ol className="install__steps">
                <li>
                  <span>1</span>
                  <div>
                    <strong>下载并打开 .pkg 安装包</strong>
                    <p>在 GitHub Releases 下载后，右键点按安装包 →「打开」。</p>
                  </div>
                </li>
                <li>
                  <span>2</span>
                  <div>
                    <strong>去隐私设置里放行</strong>
                    <p>
                      如果提示无法验证开发者，打开「系统设置 → 隐私与安全性」，
                      点「仍要打开」。
                    </p>
                  </div>
                </li>
                <li>
                  <span>3</span>
                  <div>
                    <strong>仍提示“已损坏”？执行一次命令</strong>
                    <p>
                      打开终端运行：
                      <code>xattr -dr com.apple.quarantine ~/Downloads/CrawlBear-macOS.pkg</code>
                      然后重新打开安装包。
                    </p>
                  </div>
                </li>
              </ol>
              <p className="install__privacy">
                <ShieldIcon size={15} />
                隐私：不上传媒体、无遥测；Cookie 和设置只留在本机；只访问你选择的下载目录。
                不需要相机、麦克风或屏幕录制权限。
              </p>
              <div className="install__actions">
                <a className="btn" href={INSTALL} target="_blank" rel="noreferrer">
                  查看完整安装说明
                  <ArrowRightIcon size={16} />
                </a>
              </div>
            </div>
            <div className="install__art">
              <SmartImage
                primary={asset("/assets/generated/install.png")}
                fallback={asset("/assets/brand/bear-login.webp")}
                alt="小熊抱着安装包裹，旁边是盾牌和门"
              />
              <span className="split__tag">本机优先</span>
            </div>
          </div>
        </section>

        <section className="download" id="download">
          <div className="download__card">
            <img className="download__logo" src={asset("/assets/brand/bear-logo.webp")} alt="" />
            <div>
              <span className="eyebrow">
                <DownloadIcon size={12} />
                获取
              </span>
              <h2>准备好翻找了吗？</h2>
              <p>
                从 GitHub 获取源码或下载 macOS 版本。如果 Releases 暂时没有安装包，
                可以按 <a href={README} target="_blank" rel="noreferrer">README</a> 的步骤自行构建。
              </p>
              <p className="download__note">
                首次安装？先看{" "}
                <a href="#install">安装步骤与隐私说明</a>。
              </p>
              <div className="download__actions">
                <a className="btn btn--primary" href={RELEASES} target="_blank" rel="noreferrer">
                  <DownloadIcon size={18} />
                  前往 GitHub Releases
                </a>
                <a className="btn" href={REPO} target="_blank" rel="noreferrer">
                  <GithubIcon size={17} />
                  给个 Star
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer__brand">
          <img src={asset("/assets/brand/bear-logo.webp")} alt="" />
          <div>
            <strong>超级爬爬熊 · CrawlBear</strong>
            <p>只读翻找，本机保存。</p>
          </div>
        </div>
        <nav className="footer__links" aria-label="页脚链接">
          <a href={REPO} target="_blank" rel="noreferrer">
            源码
          </a>
          <a href={`${REPO}/blob/main/LICENSE`} target="_blank" rel="noreferrer">
            MIT License
          </a>
          <a href="#features">功能</a>
          <a href="#download">下载</a>
        </nav>
        <p className="footer__note">
          仅用于保存你有权使用的内容，请遵守目标网站条款与著作权法律。
        </p>
      </footer>
    </div>
  );
}
