import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { UNCATEGORIZED } from "@/lib/claude/process-article";

const MAX_NAME_LENGTH = 30;

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!name) {
    return Response.json({ error: "카테고리 이름을 입력해 주세요" }, { status: 400 });
  }
  if (name.length > MAX_NAME_LENGTH) {
    return Response.json(
      { error: `이름은 ${MAX_NAME_LENGTH}자 이하로 입력해 주세요` },
      { status: 400 },
    );
  }
  // "미분류"는 카테고리가 없는 기사를 가리키는 예약어다
  if (name === UNCATEGORIZED) {
    return Response.json(
      { error: `"${UNCATEGORIZED}"는 사용할 수 없는 이름이에요` },
      { status: 400 },
    );
  }

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
