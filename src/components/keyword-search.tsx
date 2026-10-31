import Link from "next/link";

export function KeywordSearch({
  query,
  category,
}: {
  query: string;
  category: string;
}) {
  const clearHref =
    category === "all" ? "/dashboard" : `/dashboard?category=${category}`;

  return (
    <form
      action="/dashboard"
      role="search"
      aria-label="뉴스 키워드 검색"
      className="ml-auto flex w-full items-center gap-2 sm:w-80"
    >
      {category !== "all" && (
        <input type="hidden" name="category" value={category} />
      )}
      <input
        // 검색 후 값이 바뀌면 입력창도 새 값으로 다시 그린다
        key={query}
        type="search"
        name="q"
        defaultValue={query}
        placeholder="키워드로 뉴스 검색"
        aria-label="검색어"
        className="min-w-0 flex-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500"
      />
      <button
        type="submit"
        className="shrink-0 rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:bg-indigo-500"
      >
        검색
      </button>
      {query && (
        <Link
          href={clearHref}
          className="shrink-0 text-sm text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          초기화
        </Link>
      )}
    </form>
  );
}
