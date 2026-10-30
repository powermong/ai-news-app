import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { Suspense } from "react";
import { CategoryBar, type CategoryChip } from "@/components/category-bar";
import { FetchNewsButton } from "@/components/fetch-news-button";
import { NewsCard, NewsCardSkeleton } from "@/components/news-card";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";

// 로그인 게이트 뒤에서만 렌더링되므로 instant navigation 검증에서 제외한다
export const instant = false;

export const metadata = { title: "대시보드 · AI 뉴스 수집기" };

export default function DashboardPage(props: PageProps<"/dashboard">) {
  return (
    <div className="flex-1 bg-slate-50 dark:bg-neutral-950">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-neutral-100">
            AI 뉴스 수집기
          </h1>
          <div className="flex items-center gap-4">
            <FetchNewsButton />
            <UserButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent searchParams={props.searchParams} />
        </Suspense>
      </main>
    </div>
  );
}

async function DashboardContent({
  searchParams,
}: {
  searchParams: PageProps<"/dashboard">["searchParams"];
}) {
  const { userId } = await auth();
  if (!userId) return null;

  const { category } = await searchParams;
  const param = typeof category === "string" ? category : "all";

  const userCategories = await db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(categories.id);

  const counts = await db
    .select({ categoryId: articles.categoryId, count: sql<number>`count(*)::int` })
    .from(articles)
    .where(eq(articles.userId, userId))
    .groupBy(articles.categoryId);

  const countOf = (id: number | null) =>
    counts.find((c) => c.categoryId === id)?.count ?? 0;
  const total = counts.reduce((sum, c) => sum + c.count, 0);

  const chips: CategoryChip[] = [
    { key: "all", label: "전체", count: total },
    ...userCategories.map((c) => ({
      key: String(c.id),
      label: c.name,
      count: countOf(c.id),
    })),
    { key: "uncategorized", label: "미분류", count: countOf(null) },
  ];

  // 존재하지 않는 값이면 전체로 취급한다
  const selected = chips.some((c) => c.key === param) ? param : "all";

  const filter =
    selected === "all"
      ? undefined
      : selected === "uncategorized"
        ? isNull(articles.categoryId)
        : eq(articles.categoryId, Number(selected));

  const rows = await db
    .select()
    .from(articles)
    .where(and(eq(articles.userId, userId), filter))
    .orderBy(
      sql`${articles.publishedAt} desc nulls last`,
      desc(articles.fetchedAt),
    );

  const categoryName = new Map(userCategories.map((c) => [c.id, c.name]));

  return (
    <>
      <CategoryBar chips={chips} selected={selected} />
      {rows.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg font-semibold text-slate-900 dark:text-neutral-100">
            {total === 0
              ? "아직 가져온 뉴스가 없어요"
              : "이 카테고리에는 뉴스가 없어요"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((article) => (
            <NewsCard
              key={article.id}
              article={article}
              categoryName={
                article.categoryId
                  ? (categoryName.get(article.categoryId) ?? null)
                  : null
              }
            />
          ))}
        </div>
      )}
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <NewsCardSkeleton key={i} />
      ))}
    </div>
  );
}
