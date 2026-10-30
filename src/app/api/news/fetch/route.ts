import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { fetchFeeds } from "@/lib/rss/fetch-feeds";

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

  // 이미 저장된 URL은 (user_id, url) unique 제약으로 건너뛴다
  const inserted =
    unique.length === 0
      ? []
      : await db
          .insert(articles)
          .values(
            unique.map((item) => ({
              ...item,
              userId,
              // 임시: Claude 요약이 붙기 전까지 RSS 원문 요약을 넣어 둔다
              summaryKo: item.summaryOriginal,
            })),
          )
          .onConflictDoNothing()
          .returning({ id: articles.id });

  return Response.json({
    fetched: unique.length,
    inserted: inserted.length,
    skipped: unique.length - inserted.length,
    errors,
  });
}
