import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { articles } from "@/db/schema";

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/news/[id]">,
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id)) {
    return Response.json({ error: "잘못된 뉴스 ID예요" }, { status: 400 });
  }

  try {
    const [deleted] = await db
      .delete(articles)
      .where(and(eq(articles.id, id), eq(articles.userId, userId)))
      .returning({ id: articles.id });
    if (!deleted) {
      return Response.json({ error: "뉴스를 찾을 수 없어요" }, { status: 404 });
    }
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "뉴스를 삭제하지 못했어요" }, { status: 500 });
  }
}
