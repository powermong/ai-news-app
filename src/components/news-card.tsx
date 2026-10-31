import { DeleteNewsButton } from "@/components/delete-news-button";
import { SaveNotionButton } from "@/components/save-notion-button";
import type { Article } from "@/db/schema";

function formatDate(date: Date | null) {
  if (!date) return null;
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replace(/\.\s*/g, ".")
    .replace(/\.$/, "");
}

export function NewsCard({
  article,
  categoryName,
}: {
  article: Article;
  categoryName: string | null;
}) {
  const date = formatDate(article.publishedAt ?? article.fetchedAt);

  return (
    <article className="relative flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
      <DeleteNewsButton articleId={article.id} />
      <div className="flex items-center justify-between gap-2 pr-8">
        <span
          className={
            categoryName
              ? "rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
              : "rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-neutral-800 dark:text-neutral-400"
          }
        >
          {categoryName ?? "미분류"}
        </span>
        <span className="text-xs text-slate-500 dark:text-neutral-500">
          {article.source} · {date}
        </span>
      </div>

      <h2 className="mt-3 line-clamp-2 break-keep text-lg font-semibold leading-snug text-slate-900 dark:text-neutral-100">
        {article.titleKo ?? article.titleOriginal}
      </h2>
      <p className="mt-2 line-clamp-4 break-keep text-sm leading-relaxed text-slate-600 dark:text-neutral-400">
        {article.summaryKo ?? article.summaryOriginal}
      </p>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-neutral-800">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-slate-600 hover:text-indigo-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:text-neutral-400 dark:hover:text-indigo-400"
        >
          원문 보기 ↗
        </a>
        <SaveNotionButton
          articleId={article.id}
          saved={Boolean(article.notionPageId)}
        />
      </div>
    </article>
  );
}

export function NewsCardSkeleton() {
  return (
    <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="h-5 w-20 rounded-full bg-slate-200 dark:bg-neutral-800" />
      <div className="mt-5 h-5 w-3/4 rounded bg-slate-200 dark:bg-neutral-800" />
      <div className="mt-4 h-3 w-full rounded bg-slate-200 dark:bg-neutral-800" />
      <div className="mt-2 h-3 w-full rounded bg-slate-200 dark:bg-neutral-800" />
      <div className="mt-2 h-3 w-2/3 rounded bg-slate-200 dark:bg-neutral-800" />
    </div>
  );
}
