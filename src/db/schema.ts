import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

export const categories = pgTable(
  "categories",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: text("user_id").notNull(),
    name: text().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique("categories_user_id_name_unique").on(t.userId, t.name)],
);

export const articles = pgTable(
  "articles",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: text("user_id").notNull(),
    url: text().notNull(),
    source: text().notNull(),
    titleOriginal: text("title_original").notNull(),
    // RSS 요약 원문. Claude 번역·요약 단계의 입력으로 쓴다.
    summaryOriginal: text("summary_original"),
    // null이면 아직 Claude 처리 전이다.
    titleKo: text("title_ko"),
    summaryKo: text("summary_ko"),
    // Deleting a category leaves its articles uncategorized (null).
    categoryId: integer("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    fetchedAt: timestamp("fetched_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    notionPageId: text("notion_page_id"),
  },
  (t) => [
    unique("articles_user_id_url_unique").on(t.userId, t.url),
    index("articles_user_id_category_id_idx").on(t.userId, t.categoryId),
  ],
);

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
