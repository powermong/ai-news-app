import { eq } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { UNCATEGORIZED } from "@/lib/claude/process-article";

const MAX_NAME_LENGTH = 30;

const DEFAULT_CATEGORIES = [
  "모델/연구",
  "기업/투자",
  "제품/서비스",
  "규제/정책",
  "기타",
];

// 카테고리가 하나도 없으면 기본 카테고리를 만든 뒤 목록을 돌려준다
export async function getOrSeedCategories(userId: string) {
  const existing = await db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(categories.id);
  if (existing.length > 0) return existing;

  await db
    .insert(categories)
    .values(DEFAULT_CATEGORIES.map((name) => ({ userId, name })))
    .onConflictDoNothing();

  return db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(categories.id);
}

// 카테고리 이름을 검증한다. 통과하면 다듬은 이름을, 아니면 오류 메시지를 돌려준다
export function validateCategoryName(
  raw: unknown,
): { name: string } | { error: string } {
  const name = typeof raw === "string" ? raw.trim() : "";
  if (!name) return { error: "카테고리 이름을 입력해 주세요" };
  if (name.length > MAX_NAME_LENGTH) {
    return { error: `이름은 ${MAX_NAME_LENGTH}자 이하로 입력해 주세요` };
  }
  // "미분류"는 카테고리가 없는 기사를 가리키는 예약어다
  if (name === UNCATEGORIZED) {
    return { error: `"${UNCATEGORIZED}"는 사용할 수 없는 이름이에요` };
  }
  return { name };
}
