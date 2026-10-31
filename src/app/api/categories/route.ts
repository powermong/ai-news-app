import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { validateCategoryName } from "@/lib/categories";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const checked = validateCategoryName(body?.name);
  if ("error" in checked) {
    return Response.json({ error: checked.error }, { status: 400 });
  }
  const { name } = checked;

  // (user_id, name) unique 제약으로 중복을 걸러낸다
  const [created] = await db
    .insert(categories)
    .values({ userId, name })
    .onConflictDoNothing()
    .returning();

  if (!created) {
    return Response.json({ error: "이미 있는 카테고리예요" }, { status: 409 });
  }

  return Response.json(created, { status: 201 });
}
