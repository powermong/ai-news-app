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
    <article className="group relative flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 transition-[border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-900/5 motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-indigo-500/50 dark:hover:shadow-black/40">
      <DeleteNewsButton articleId={article.id} />
      <div className="flex items-center justify-between gap-3 pr-8">
        <span
          className={
            categoryName
              ? "shrink-0 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
              : "shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-neutral-800 dark:text-neutral-400"
          }
        >
          {categoryName ?? "미분류"}
        </span>
        <span className="min-w-0 truncate text-xs text-slate-500 dark:text-neutral-400">
          <span className="font-medium text-slate-700 dark:text-neutral-300">
            {article.source}
          </span>
          {date && <span className="ml-1.5 tabular-nums">{date}</span>}
        </span>
      </div>

      <h2 className="mt-4 line-clamp-2 break-keep text-[1.0625rem] font-semibold leading-snug tracking-tight text-slate-900 transition-colors duration-200 group-hover:text-indigo-700 dark:text-neutral-50 dark:group-hover:text-indigo-300">
        {article.titleKo ?? article.titleOriginal}
      </h2>
      <p className="mt-2.5 line-clamp-4 break-keep text-sm leading-[1.7] text-slate-600 dark:text-neutral-400">
        {article.summaryKo ?? article.summaryOriginal}
      </p>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-neutral-800">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group/link inline-flex items-center gap-1 rounded-sm text-sm font-medium text-slate-600 transition-colors hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:text-neutral-400 dark:hover:text-indigo-300"
        >
          원문 보기
          <span
            aria-hidden="true"
            className="transition-transform duration-200 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 motion-reduce:transition-none"
          >
            ↗
          </span>
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
    <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="h-5 w-20 rounded-full bg-slate-200 dark:bg-neutral-800" />
      <div className="mt-5 h-5 w-3/4 rounded bg-slate-200 dark:bg-neutral-800" />
      <div className="mt-4 h-3 w-full rounded bg-slate-200 dark:bg-neutral-800" />
      <div className="mt-2 h-3 w-full rounded bg-slate-200 dark:bg-neutral-800" />
      <div className="mt-2 h-3 w-2/3 rounded bg-slate-200 dark:bg-neutral-800" />
    </div>
  );
}
