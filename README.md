# AI 뉴스 수집기

해외 AI 뉴스를 RSS로 수집하고, Claude API로 한국어 번역·요약·카테고리 분류를 한 뒤 카드 형태로 보여주는 웹앱입니다. 마음에 드는 뉴스는 클릭 한 번으로 Notion에 저장할 수 있습니다.

## 주요 기능

- **인증**: Clerk 로그인. 모든 페이지와 `/api/*`는 로그인이 필요하며 데이터는 사용자별로 분리됩니다.
- **뉴스 수집**: TechCrunch AI, The Verge AI 두 RSS를 수집하고, 이미 저장된 URL은 건너뜁니다.
- **AI 처리**: 기사마다 Claude가 한국어 제목, 3~4줄 요약, 카테고리를 JSON으로 반환합니다.
- **카테고리**: 기본 카테고리 제공, 추가 및 필터. 해당 없으면 "미분류".
- **Notion 저장**: 카드의 NOTION 저장 버튼으로 Notion 데이터베이스에 저장하며 중복 저장을 방지합니다.

## 기술 스택

Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · Clerk · Neon Postgres + Drizzle ORM · Claude API (`@anthropic-ai/sdk`) · `rss-parser` · Notion REST API

## 시작하기

```bash
npm install
npm run dev   # http://localhost:3000
```

### 환경 변수

프로젝트 루트에 `.env.local`을 만들고 아래 값을 채웁니다. 모두 서버 측 비밀 값이므로 커밋하지 마세요.

| 변수 | 설명 |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk 공개 키 |
| `CLERK_SECRET_KEY` | Clerk 시크릿 키 |
| `DATABASE_URL` | Neon Postgres 연결 문자열 |
| `DATABASE_URL_POOLED` | Neon Postgres 풀링 연결 문자열 |
| `NEON_AUTH_BASE_URL` | Neon Auth 기본 URL |
| `ANTHROPIC_API_KEY` | Claude API 키 |
| `NOTION_API_TOKEN` | Notion 통합 토큰 |
| `NOTION_DATABASE_ID` | 저장 대상 Notion 데이터베이스("AI 뉴스 북마크") ID |

### 데이터베이스

스키마는 `src/db/schema.ts`, 마이그레이션은 `drizzle/`에 있습니다.

```bash
npx drizzle-kit generate   # 마이그레이션 생성
npx drizzle-kit migrate    # 마이그레이션 적용
```

## 스크립트

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm start` | 프로덕션 서버 실행 |
| `npm run lint` | ESLint |

## API

| 라우트 | 설명 |
|---|---|
| `POST /api/news/fetch` | RSS 수집, 번역·요약·분류, 저장 |
| `POST /api/categories` | 카테고리 추가 |
| `PATCH /api/categories/:id` | 카테고리 이름 수정 |
| `DELETE /api/categories/:id` | 카테고리 삭제 (기사는 미분류로 이동) |
| `POST /api/news/:id/notion` | 기사를 Notion에 저장 |

## 구현 현황

구현됨: 로그인, 대시보드, 뉴스 수집, Claude 번역·요약·분류, 카테고리 추가·이름 수정·삭제, Notion 저장.
미구현: `GET /api/news`, 카테고리 관리 화면.

## 문서

- [`PRD.md`](./PRD.md) — 요구사항, 데이터 모델, API, 미결 사항
- [`ui.md`](./ui.md) — UI 스타일 가이드

## 사용한 플러그인

- Frontend Design: UI 디자인 품질 향상
- commit-commands: 깃 워크플로 자동화
