import { auth } from "@clerk/nextjs/server";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { getOrSeedCategories } from "@/lib/categories";
import {
  processArticle,
  UNCATEGORIZED,
  type ProcessedArticle,
} from "@/lib/claude/process-article";
import { fetchFeeds } from "@/lib/rss/fetch-feeds";

// 기사마다 Claude를 한 번씩 호출하므로 기본 제한보다 넉넉하게 둔다
export const maxDuration = 60;

const CONCURRENCY = 4;
// 이전 수집에서 Claude 처리에 실패한 기사를 한 번에 다시 시도하는 최대 건수
const RETRY_LIMIT = 20;

type Job = {
  key: string;
  titleOriginal: string;
  summaryOriginal: string | null;
};

// 동시 실행 수를 제한해 rate limit을 피한다. 한 건이 실패해도 나머지는 계속한다.
async function runPool<T>(items: T[], worker: (item: T) => Promise<void>) {
  const queue = [...items];
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
      for (let item = queue.shift(); item; item = queue.shift()) {
        await worker(item);
      }
    }),
  );
}

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { items, errors, sourceCount } = await fetchFeeds();

  if (errors.length === sourceCount) {
    return Response.json(
      { error: "모든 RSS 소스를 가져오지 못했어요", errors },
      { status: 502 },
    );
  }

  // 같은 URL을 두 번 넣으면 한 INSERT 안에서 충돌하므로 미리 걸러낸다
  const unique = [...new Map(items.map((item) => [item.url, item])).values()];

  // 이미 저장된 URL은 Claude를 다시 호출하지 않는다
  const stored =
    unique.length === 0
      ? []
      : await db
          .select({ url: articles.url })
          .from(articles)
          .where(
            and(
              eq(articles.userId, userId),
              inArray(
                articles.url,
                unique.map((item) => item.url),
              ),
            ),
          );
  const storedUrls = new Set(stored.map((row) => row.url));
  const fresh = unique.filter((item) => !storedUrls.has(item.url));

  // 이전에 Claude 처리에 실패해 번역이 비어 있는 기사
  const retry = await db
    .select({
      id: articles.id,
      titleOriginal: articles.titleOriginal,
      summaryOriginal: articles.summaryOriginal,
    })
    .from(articles)
    .where(and(eq(articles.userId, userId), isNull(articles.titleKo)))
    .limit(RETRY_LIMIT);

  const categoryList = await getOrSeedCategories(userId);
  const categoryIds = new Map(categoryList.map((c) => [c.name, c.id]));
  const categoryNames = categoryList.map((c) => c.name);

  const jobs: Job[] = [
    ...fresh.map((item) => ({ key: `new:${item.url}`, ...item })),
    ...retry.map((row) => ({ key: `retry:${row.id}`, ...row })),
  ];

  const results = new Map<string, ProcessedArticle>();
  const failures: string[] = [];

  await runPool(jobs, async (job) => {
    try {
      results.set(job.key, await processArticle(job, categoryNames));
    } catch (error) {
      console.error("Claude 처리 실패:", job.titleOriginal, error);
      failures.push(job.titleOriginal);
    }
  });

  const toCategoryId = (result: ProcessedArticle) =>
    result.category === UNCATEGORIZED
      ? null
      : (categoryIds.get(result.category) ?? null);

  // 처리에 실패한 새 기사는 원문 그대로 저장하고, 다음 수집 때 다시 시도한다
  const inserted =
    fresh.length === 0
      ? []
      : await db
          .insert(articles)
          .values(
            fresh.map((item) => {
              const result = results.get(`new:${item.url}`);
              return {
                ...item,
                userId,
                titleKo: result?.titleKo ?? null,
                summaryKo: result?.summaryKo ?? item.summaryOriginal,
                categoryId: result ? toCategoryId(result) : null,
              };
            }),
          )
          .onConflictDoNothing()
          .returning({ id: articles.id });

  for (const row of retry) {
    const result = results.get(`retry:${row.id}`);
    if (!result) continue;
    await db
      .update(articles)
      .set({
        titleKo: result.titleKo,
        summaryKo: result.summaryKo,
        categoryId: toCategoryId(result),
      })
      .where(and(eq(articles.id, row.id), eq(articles.userId, userId)));
  }

  return Response.json({
    fetched: unique.length,
    inserted: inserted.length,
    skipped: unique.length - fresh.length,
    processed: results.size,
    failed: failures.length,
    errors,
  });
}
