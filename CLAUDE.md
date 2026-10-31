# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

Implemented: Clerk auth gate, dashboard (header, category bar, news cards), RSS fetch (`POST /api/news/fetch`), Claude translation/summary/classification (`src/lib/claude/`), category add/rename/delete (`POST /api/categories`, `PATCH|DELETE /api/categories/:id`), and Notion save (`POST /api/news/:id/notion`, REST API, `src/lib/notion/`). Not yet built: `GET /api/news`, category management screen.

`PRD.md` (Korean) is the source of truth for requirements, data model (`categories`, `articles`), API routes, and open questions (§12) — read it before implementing anything.

## UI guide

`ui.md` (Korean) is the UI style guide (Tailwind classes, layout, component specs for the dashboard: header, category bar with add button, news cards). Read it before building or changing any UI.

## Commands

- `npm run dev` — dev server (http://localhost:3000)
- `npm run build` / `npm start` — production build / serve
- `npm run lint` — ESLint (flat config, `eslint.config.mjs`)
- No test runner is configured.
- Drizzle: schema in `src/db/schema.ts`, config in `drizzle.config.ts`, migrations in `drizzle/` (`npx drizzle-kit generate|migrate|push`).

## Next.js version warning

`AGENTS.md` states this Next.js (16.x, React 19) has breaking changes relative to common training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing Next.js code (routing, middleware/proxy, route handlers, etc.).

## Architecture (per PRD)

- Stack: Next.js App Router (`src/app`, alias `@/*` → `src/*`), Tailwind 4, Clerk auth, Neon Postgres via `@neondatabase/serverless` + Drizzle ORM, Claude API (`@anthropic-ai/sdk`), `rss-parser`, Notion via REST API (`fetch`, no SDK).
- All pages and `/api/*` routes require Clerk auth; every query must be scoped by Clerk `userId` (`categories.user_id`, `articles.user_id`; articles unique on `(user_id, url)`).
- Fetch pipeline (`POST /api/news/fetch`): parse 2 fixed RSS feeds (TechCrunch AI, The Verge AI) → skip URLs already stored (no Claude call) → one Claude call per new article returning JSON {titleKo, summaryKo, category} with the user's current category list in the prompt (model set in `src/lib/claude/client.ts`) → save. Partial source or Claude failure must not abort the rest: failed articles are saved with `title_ko` null and retried on the next fetch. Default categories are seeded on first fetch if the user has none (`src/lib/categories.ts`). "미분류" is a reserved name, not a real category.
- Deleting a category sets its articles' `category_id` to null ("미분류").
- Notion save (`POST /api/news/:id/notion`) stores `notion_page_id` on the article to prevent duplicates. Uses the Notion REST API (decided, not MCP) with `NOTION_API_TOKEN` + `NOTION_DATABASE_ID` (DB "AI 뉴스 북마크").
- Secrets (Claude, Notion, Neon, Clerk keys) are server-side env vars only.
