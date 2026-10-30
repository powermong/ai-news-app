# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

Only the `create-next-app` scaffold plus dependencies exist; no app code has been written yet. `PRD.md` (Korean) is the source of truth for requirements, data model (`categories`, `articles`), API routes, and open questions (§12) — read it before implementing anything.

## UI guide

`ui.md` (Korean) is the UI style guide (Tailwind classes, layout, component specs for the dashboard: header, category bar with add button, news cards). Read it before building or changing any UI.

## Commands

- `npm run dev` — dev server (http://localhost:3000)
- `npm run build` / `npm start` — production build / serve
- `npm run lint` — ESLint (flat config, `eslint.config.mjs`)
- No test runner is configured.
- Drizzle: `drizzle-kit` is installed but there is no `drizzle.config.ts` yet (`npx drizzle-kit generate|migrate|push` once added).

## Next.js version warning

`AGENTS.md` states this Next.js (16.x, React 19) has breaking changes relative to common training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing Next.js code (routing, middleware/proxy, route handlers, etc.).

## Architecture (planned, per PRD)

- Stack: Next.js App Router (`src/app`, alias `@/*` → `src/*`), Tailwind 4, Clerk auth, Neon Postgres via `@neondatabase/serverless` + Drizzle ORM, Claude API (`@anthropic-ai/sdk`), `rss-parser`, Notion via MCP (`@modelcontextprotocol/sdk`).
- All pages and `/api/*` routes require Clerk auth; every query must be scoped by Clerk `userId` (`categories.user_id`, `articles.user_id`; articles unique on `(user_id, url)`).
- Fetch pipeline (`POST /api/news/fetch`): parse 2 fixed RSS feeds (TechCrunch AI, The Verge AI) → skip URLs already stored (no Claude call) → one Claude call per new article returning JSON {title_ko, summary_ko, category} with the user's current category list in the prompt → save. Partial source failure must not abort the rest.
- Deleting a category sets its articles' `category_id` to null ("미분류").
- Notion save (`POST /api/news/:id/notion`) stores `notion_page_id` on the article to prevent duplicates. Integration method (MCP client vs. REST) is still undecided (PRD §12.1) — confirm with the user before building.
- Secrets (Claude, Notion, Neon, Clerk keys) are server-side env vars only.
