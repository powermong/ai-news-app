// Sample data for local checks. Run: npx tsx --env-file=.env.local scripts/seed.mts
import { db } from "../src/db/index";
import { articles, categories } from "../src/db/schema";

const userId = "user_example_001";

const categoryNames = ["모델/제품", "기업/투자", "정책/규제"];

const samples = [
  {
    category: "모델/제품",
    url: "https://techcrunch.com/2026/10/27/openai-reasoning-model-enterprise/",
    source: "TechCrunch AI",
    titleOriginal: "OpenAI launches new reasoning model for enterprise customers",
    titleKo: "OpenAI, 기업 고객용 새 추론 모델 출시",
    summaryKo:
      "OpenAI가 기업 고객을 위한 새로운 추론 특화 모델을 공개했다. 복잡한 업무 자동화와 코드 분석 성능을 높였고, 데이터 보안 기능도 강화했다. 우선 대형 기업 고객에게 제공하고 이후 단계적으로 확대한다.",
    publishedAt: new Date("2026-10-27T14:00:00Z"),
  },
  {
    category: "모델/제품",
    url: "https://www.theverge.com/2026/10/26/google-workspace-gemini-agents",
    source: "The Verge AI",
    titleOriginal: "Google adds Gemini-powered agents to Workspace",
    titleKo: "구글, 워크스페이스에 제미나이 기반 에이전트 추가",
    summaryKo:
      "구글이 Gmail, 문서, 캘린더 등 워크스페이스 앱에 제미나이 기반 AI 에이전트를 도입했다. 일정 조율, 문서 초안 작성, 메일 정리 같은 반복 업무를 대신 처리한다. 관리자가 에이전트 권한을 세부적으로 제어할 수 있다.",
    publishedAt: new Date("2026-10-26T16:30:00Z"),
  },
  {
    category: "기업/투자",
    url: "https://techcrunch.com/2026/10/25/ai-chip-startup-series-c/",
    source: "TechCrunch AI",
    titleOriginal: "AI chip startup raises $400M Series C",
    titleKo: "AI 칩 스타트업, 4억 달러 시리즈 C 투자 유치",
    summaryKo:
      "AI 추론용 반도체를 개발하는 스타트업이 4억 달러 규모의 시리즈 C 투자를 유치했다. 데이터센터용 저전력 칩의 양산과 고객사 확대에 자금을 쓸 계획이다. 엔비디아 의존도를 낮추려는 수요가 투자 배경으로 꼽힌다.",
    publishedAt: new Date("2026-10-25T09:15:00Z"),
  },
  {
    category: "정책/규제",
    url: "https://www.theverge.com/2026/10/24/eu-general-purpose-ai-guidelines",
    source: "The Verge AI",
    titleOriginal: "EU finalizes guidelines for general-purpose AI models",
    titleKo: "EU, 범용 AI 모델 가이드라인 확정",
    summaryKo:
      "유럽연합이 범용 AI 모델 제공업체가 지켜야 할 가이드라인을 최종 확정했다. 학습 데이터 투명성, 저작권 준수, 시스템 리스크 평가 의무가 핵심이다. 기업들은 시행 시점에 맞춰 대응 체계를 갖춰야 한다.",
    publishedAt: new Date("2026-10-24T11:45:00Z"),
  },
  {
    // Uncategorized on purpose.
    category: null,
    url: "https://techcrunch.com/2026/10/23/anthropic-microsoft-cloud-partnership/",
    source: "TechCrunch AI",
    titleOriginal: "Anthropic and Microsoft expand cloud partnership",
    titleKo: "앤트로픽·마이크로소프트, 클라우드 파트너십 확대",
    summaryKo:
      "앤트로픽과 마이크로소프트가 클라우드 인프라 협력을 확대한다고 발표했다. 앤트로픽의 모델을 마이크로소프트 클라우드 서비스에서 더 폭넓게 쓸 수 있게 되고, 컴퓨팅 자원도 추가로 확보한다. 구체적인 계약 규모는 공개되지 않았다.",
    publishedAt: new Date("2026-10-23T18:00:00Z"),
  },
];

await db
  .insert(categories)
  .values(categoryNames.map((name) => ({ userId, name })))
  .onConflictDoNothing();

const rows = await db.query.categories.findMany({
  where: (c, { eq }) => eq(c.userId, userId),
});
const idByName = new Map(rows.map((c) => [c.name, c.id]));

await db
  .insert(articles)
  .values(
    samples.map(({ category, ...a }) => ({
      ...a,
      userId,
      categoryId: category ? idByName.get(category) : null,
    })),
  )
  .onConflictDoNothing();

console.log(`seeded: ${rows.length} categories, ${samples.length} articles`);
