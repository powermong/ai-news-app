import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { validateCategoryName } from "@/lib/categories";

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/categories/[id]">,
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id)) {
    return Response.json({ error: "잘못된 카테고리 ID예요" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const checked = validateCategoryName(body?.name);
  if ("error" in checked) {
    return Response.json({ error: checked.error }, { status: 400 });
  }
  const { name } = checked;

  // (user_id, name) unique 제약 위반은 중복 이름이다
  try {
    const [updated] = await db
      .update(categories)
      .set({ name })
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning();
    if (!updated) {
      return Response.json(
        { error: "카테고리를 찾을 수 없어요" },
        { status: 404 },
      );
    }
    return Response.json(updated);
  } catch (e) {
    if (isUniqueViolation(e)) {
      return Response.json(
        { error: "이미 있는 카테고리예요" },
        { status: 409 },
      );
    }
    throw e;
  }
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/categories/[id]">,
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id)) {
    return Response.json({ error: "잘못된 카테고리 ID예요" }, { status: 400 });
  }

  // articles.category_id는 on delete set null이라 기사는 미분류로 이동한다
  const [deleted] = await db
    .delete(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
    .returning();
  if (!deleted) {
    return Response.json(
      { error: "카테고리를 찾을 수 없어요" },
      { status: 404 },
    );
  }
  return Response.json({ ok: true });
}

function isUniqueViolation(e: unknown) {
  const err = e as { code?: string; cause?: { code?: string } };
  return err?.code === "23505" || err?.cause?.code === "23505";
}
