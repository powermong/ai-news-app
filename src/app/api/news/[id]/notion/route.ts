import { auth } from "@clerk/nextjs/server";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import { saveArticleToNotion } from "@/lib/notion/save-article";

export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/news/[id]/notion">,
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id)) {
    return Response.json({ error: "잘못된 기사 ID예요" }, { status: 400 });
  }

  const [article] = await db
    .select()
    .from(articles)
    .where(and(eq(articles.id, id), eq(articles.userId, userId)));
  if (!article) {
    return Response.json({ error: "기사를 찾을 수 없어요" }, { status: 404 });
  }

  // 이미 저장된 기사는 다시 만들지 않는다
  if (article.notionPageId) {
    return Response.json({ notionPageId: article.notionPageId });
  }

  let categoryName: string | null = null;
  if (article.categoryId) {
    const [category] = await db
      .select({ name: categories.name })
      .from(categories)
      .where(
        and(
          eq(categories.id, article.categoryId),
          eq(categories.userId, userId),
        ),
      );
    categoryName = category?.name ?? null;
  }

  let notionPageId: string;
  try {
    notionPageId = await saveArticleToNotion(article, categoryName);
  } catch (error) {
    console.error("Notion 저장 실패", error);
    return Response.json(
      { error: "Notion에 저장하지 못했어요. 잠시 후 다시 시도해 주세요" },
      { status: 502 },
    );
  }

  await db
    .update(articles)
    .set({ notionPageId })
    .where(
      and(
        eq(articles.id, id),
        eq(articles.userId, userId),
        isNull(articles.notionPageId),
      ),
    );

  return Response.json({ notionPageId }, { status: 201 });
}
