import type { Article } from "@/db/schema";

const NOTION_VERSION = "2022-06-28";
// Notion은 rich_text/title 한 덩어리를 2000자로 제한한다
const MAX_TEXT_LENGTH = 2000;

function text(value: string) {
  return [{ type: "text", text: { content: value.slice(0, MAX_TEXT_LENGTH) } }];
}

// select 옵션 이름에는 쉼표를 쓸 수 없다
function selectName(value: string) {
  return value.replaceAll(",", " ").trim().slice(0, 100);
}

/** 기사를 Notion 데이터베이스에 한 행으로 저장하고 페이지 ID를 돌려준다. */
export async function saveArticleToNotion(
  article: Article,
  categoryName: string | null,
): Promise<string> {
  const token = process.env.NOTION_API_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!token || !databaseId) {
    throw new Error("Notion 환경변수가 설정되지 않았어요");
  }

  const properties: Record<string, unknown> = {
    제목: { title: text(article.titleKo ?? article.titleOriginal) },
    원제목: { rich_text: text(article.titleOriginal) },
    출처: { select: { name: selectName(article.source) } },
    URL: { url: article.url },
  };
  if (article.summaryKo) {
    properties["요약"] = { rich_text: text(article.summaryKo) };
  }
  if (categoryName) {
    properties["카테고리"] = { select: { name: selectName(categoryName) } };
  }
  if (article.publishedAt) {
    properties["발행일"] = {
      date: { start: article.publishedAt.toISOString() },
    };
  }

  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `Notion API 오류 (${res.status})`);
  }

  const page = (await res.json()) as { id: string };
  return page.id;
}
