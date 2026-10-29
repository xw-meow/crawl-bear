import { Button } from "antd";
import {
  ArrowRightIcon,
  CloseIcon,
  GlobeIcon,
} from "../../../shared/components/Icons";

interface CrawlFormProps {
  url: string;
  crawling: boolean;
  onUrlChange: (value: string) => void;
  onCrawl: () => void;
}

export function CrawlForm({ url, crawling, onUrlChange, onCrawl }: CrawlFormProps) {
  return (
    <form
      className="search-pill"
      onSubmit={(event) => {
        event.preventDefault();
        onCrawl();
      }}
    >
      <span className="search-pill__icon" aria-hidden="true">
        <GlobeIcon size={20} />
      </span>
      <label className="visually-hidden" htmlFor="crawlUrl">
        网页地址
      </label>
      <input
        id="crawlUrl"
        className="search-pill__input"
        value={url}
        placeholder="粘贴网页地址，或带链接的分享文字"
        spellCheck={false}
        autoComplete="off"
        disabled={crawling}
        onChange={(event) => onUrlChange(event.target.value)}
      />
      {url && !crawling && (
        <button
          type="button"
          className="search-pill__clear"
          aria-label="清空地址"
          onClick={() => onUrlChange("")}
        >
          <CloseIcon size={15} />
        </button>
      )}
      <Button
        type="primary"
        htmlType="submit"
        className="search-pill__go"
        loading={crawling}
        disabled={!url.trim()}
      >
        {crawling ? "翻找中…" : "开始翻找"}
        {!crawling && <ArrowRightIcon size={17} />}
      </Button>
    </form>
  );
}
