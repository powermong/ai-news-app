import { eq } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";

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
