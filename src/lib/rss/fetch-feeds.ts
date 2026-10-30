import Parser from "rss-parser";
import { RSS_SOURCES, type RssSource } from "./sources";

const WINDOW_MS = 24 * 60 * 60 * 1000;

const parser = new Parser({
  timeout: 10_000,
  headers: { "User-Agent": "ai-news-collector/1.0" },
});

export type FeedItem = {
  url: string;
  source: string;
  titleOriginal: string;
  summaryOriginal: string | null;
  publishedAt: Date;
};

export type FeedError = { source: string; message: string };

// 같은 기사가 해시·추적 파라미터만 다른 URL로 들어와도 같은 URL로 취급한다
function normalizeUrl(raw: string) {
  try {
    const url = new URL(raw);
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
      if (key.startsWith("utm_")) url.searchParams.delete(key);
    }
    return url.toString();
  } catch {
    return raw;
  }
}

async function fetchSource(source: RssSource, since: Date) {
  const feed = await parser.parseURL(source.feedUrl);
  const items: FeedItem[] = [];

  for (const item of feed.items) {
    const link = item.link?.trim();
    const url = link ? normalizeUrl(link) : null;
    const title = item.title?.trim();
    const publishedAt = item.isoDate ? new Date(item.isoDate) : null;

    // 발행일을 알 수 없으면 24시간 기준을 적용할 수 없으므로 건너뛴다
    if (!url || !title || !publishedAt || Number.isNaN(publishedAt.getTime())) {
      continue;
    }
    if (publishedAt < since) continue;

    items.push({
      url,
      source: source.name,
      titleOriginal: title,
      summaryOriginal: item.contentSnippet?.trim() || null,
      publishedAt,
    });
  }

  return items;
}

// 소스 하나가 실패해도 나머지는 계속 처리한다
export async function fetchFeeds(now = new Date()) {
  const since = new Date(now.getTime() - WINDOW_MS);
  const results = await Promise.allSettled(
    RSS_SOURCES.map((source) => fetchSource(source, since)),
  );

  const items: FeedItem[] = [];
  const errors: FeedError[] = [];

  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      items.push(...result.value);
    } else {
      errors.push({
        source: RSS_SOURCES[i].name,
        message:
          result.reason instanceof Error
            ? result.reason.message
            : String(result.reason),
      });
    }
  });

  return { items, errors, sourceCount: RSS_SOURCES.length };
}
