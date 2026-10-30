# UI 가이드: AI 뉴스 수집기

메인 화면은 뉴스를 **카드 형태**로 보여 주는 대시보드다. 깔끔하고 읽기 편한 것을 최우선으로 하며, 스타일링은 Tailwind CSS 4 유틸리티 클래스로만 작성한다. 요구사항은 `PRD.md` §6.5, §10을 따른다.

## 1. 디자인 원칙

- **읽기 우선**: 본문(요약)은 충분한 크기와 행간을 확보하고, 장식은 최소화한다.
- **여백으로 구분**: 선·그림자를 덜 쓰고 여백과 옅은 테두리로 영역을 나눈다.
- **한 가지 강조색**: 주요 행동(뉴스 가져오기, 선택된 카테고리)에만 강조색(`indigo`)을 쓴다.
- **라이트/다크 대응**: 기존 `prefers-color-scheme` 설정을 유지하고 `dark:` 변형으로 대응한다.
- **한글 가독성**: 한글 본문은 `leading-relaxed`, 줄바꿈은 `break-keep`을 기본으로 한다.

## 2. 디자인 토큰

### 색상 (Tailwind 기본 팔레트)

| 용도 | 라이트 | 다크 |
|---|---|---|
| 페이지 배경 | `bg-slate-50` | `dark:bg-neutral-950` |
| 카드 배경 | `bg-white` | `dark:bg-neutral-900` |
| 테두리 | `border-slate-200` | `dark:border-neutral-800` |
| 제목 텍스트 | `text-slate-900` | `dark:text-neutral-100` |
| 본문 텍스트 | `text-slate-600` | `dark:text-neutral-400` |
| 보조 텍스트(출처·날짜) | `text-slate-500` | `dark:text-neutral-500` |
| 강조(주요 버튼, 선택됨) | `bg-indigo-600 text-white` | `dark:bg-indigo-500` |
| 강조 hover | `hover:bg-indigo-700` | `dark:hover:bg-indigo-400` |
| 오류 | `text-red-600` | `dark:text-red-400` |

> 현재 `globals.css`의 `--background`/`--foreground`는 흰색/검정 계열이다. 페이지 배경은 `body`가 아니라 메인 컨테이너의 `bg-slate-50 dark:bg-neutral-950`로 지정해 카드와 대비를 만든다.

### 타이포그래피

- 폰트: 레이아웃에 이미 등록된 Geist(`font-sans`). 한글은 시스템 폰트로 폴백된다.
- 앱 이름: `text-xl font-bold tracking-tight`
- 카드 제목: `text-lg font-semibold leading-snug`
- 요약: `text-sm leading-relaxed`
- 메타(출처·날짜): `text-xs`

### 형태

- 카드: `rounded-2xl border p-5`, 그림자는 hover에서만 `hover:shadow-md`
- 버튼·칩: `rounded-full`(칩) / `rounded-lg`(버튼)
- 전환: `transition-colors` / `transition-shadow`, 기본 duration 사용

## 3. 레이아웃

```
┌──────────────────────────────────────────────────────────┐
│ 헤더: [AI 뉴스 수집기]              [뉴스 가져오기] [사용자] │
├──────────────────────────────────────────────────────────┤
│ 카테고리: (전체) (모델/연구) (기업/투자) (제품/서비스) … (+ 추가) │
│                                                          │
│ ┌────────┐  ┌────────┐  ┌────────┐                       │
│ │ 카드   │  │ 카드   │  │ 카드   │                       │
│ └────────┘  └────────┘  └────────┘                       │
│ ┌────────┐  ┌────────┐  ┌────────┐                       │
│ │ 카드   │  │ 카드   │  │ 카드   │                       │
│ └────────┘  └────────┘  └────────┘                       │
└──────────────────────────────────────────────────────────┘
```

- 컨테이너: `mx-auto w-full max-w-6xl px-4 sm:px-6`
- 섹션 간격: 헤더 → 카테고리 → 카드 목록 사이 `space-y-6`
- 카드 그리드: `grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3`

## 4. 컴포넌트

### 4.1 헤더

- 상단 고정: `sticky top-0 z-10 border-b bg-white/80 backdrop-blur dark:bg-neutral-950/80`
- 높이 `h-16`, 좌우 `flex items-center justify-between`
- 좌측: 앱 이름 **AI 뉴스 수집기** (`text-xl font-bold tracking-tight`)
- 우측: **뉴스 가져오기** 버튼 + Clerk `UserButton`

**뉴스 가져오기 버튼 (주요 버튼)**

```
inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium
text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed
disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400
```

- 수집 중: `disabled` + 스피너 아이콘(`animate-spin`) + 문구 "가져오는 중…"
- 완료/부분 실패: 헤더 아래 토스트 또는 인라인 메시지로 결과 안내 (예: "새 기사 12건 추가 · The Verge 수집 실패")

### 4.2 카테고리 바 (카드 목록 위)

카테고리를 가로 한 줄 칩으로 나열하고, **맨 끝에 카테고리 추가 버튼**을 둔다. PRD §6.5의 "전체 + 각 카테고리" 필터를 겸한다.

- 컨테이너: `flex flex-wrap items-center gap-2` (모바일에서 줄바꿈. 칩이 많을 때 `overflow-x-auto`로 바꿔도 된다)
- 순서: `전체` → 각 카테고리 → `미분류` → **`+ 카테고리 추가`**(항상 마지막)

**카테고리 칩 (기본)**

```
rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm text-slate-600
transition-colors hover:bg-slate-100 dark:border-neutral-800 dark:bg-neutral-900
dark:text-neutral-400 dark:hover:bg-neutral-800
```

**카테고리 칩 (선택됨)** — `aria-pressed="true"`

```
border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700
dark:border-indigo-500 dark:bg-indigo-500
```

- 칩 안에 기사 수를 작게 덧붙일 수 있다: `<span className="ml-1.5 text-xs opacity-70">12</span>`
- 칩 hover 시 이름 수정·삭제 진입점(연필/휴지통 아이콘)을 노출해도 되며, 삭제 시 "기사는 미분류로 이동합니다" 확인 문구를 보여 준다 (PRD §6.4).

**카테고리 추가 버튼 (칩 목록 끝)**

선택 상태가 없는 "고스트" 스타일로 칩과 구분한다.

```
inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300
px-3.5 py-1.5 text-sm text-slate-500 transition-colors hover:border-indigo-400
hover:text-indigo-600 dark:border-neutral-700 dark:text-neutral-500
dark:hover:border-indigo-400 dark:hover:text-indigo-400
```

- 내용: `+` 아이콘 + "카테고리 추가"
- 클릭 시: 버튼 자리가 인라인 입력창(`rounded-full border px-3.5 py-1.5 text-sm`)으로 바뀌고 Enter로 저장, Esc로 취소. (모달이 필요하면 §4.5 모달 규칙을 따른다.)
- 접근성: `aria-label="카테고리 추가"`

### 4.3 뉴스 카드

카드 구성은 PRD §6.5를 따른다: 카테고리 배지, 한국어 제목, 요약, 출처·발행일, 원문 링크, NOTION 저장 버튼.

```
<article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5
  transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
  ① 상단 줄: 카테고리 배지 + 출처·날짜
  ② 제목
  ③ 요약
  ④ 하단 줄: 원문 링크 + NOTION 저장 (mt-auto)
</article>
```

| 영역 | 클래스 | 비고 |
|---|---|---|
| ① 상단 줄 | `flex items-center justify-between gap-2` | 좌: 배지, 우: 메타 |
| 카테고리 배지 | `rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300` | 미분류는 `bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-400` |
| 메타 | `text-xs text-slate-500 dark:text-neutral-500` | "TechCrunch · 2026.10.30" |
| ② 제목 | `mt-3 text-lg font-semibold leading-snug text-slate-900 break-keep dark:text-neutral-100` | 최대 2줄 `line-clamp-2` |
| ③ 요약 | `mt-2 text-sm leading-relaxed text-slate-600 break-keep dark:text-neutral-400` | 3~4줄, `line-clamp-4` |
| ④ 하단 줄 | `mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-neutral-800` | 카드 높이가 달라도 하단 정렬 |

- 제목이 곧 원문 링크가 되지 않도록 한다. 원문은 하단의 별도 링크로 연다: `target="_blank" rel="noopener noreferrer"`, `text-sm font-medium text-slate-600 hover:text-indigo-600 hover:underline`, 문구 "원문 보기 ↗"

**NOTION 저장 버튼** (PRD §6.6)

| 상태 | 클래스 | 문구 |
|---|---|---|
| 기본 | `rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold tracking-wide text-slate-700 transition-colors hover:bg-slate-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800` | NOTION 저장 |
| 저장 중 | 기본 + `disabled:opacity-60` + 작은 스피너 | 저장 중… |
| 저장됨 | `rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300` (`disabled`, 클릭 불가) | ✓ 저장됨 |
| 실패 | 기본 버튼 유지 + 카드 하단에 `text-xs text-red-600 dark:text-red-400` 오류 문구 | NOTION 저장 |

### 4.4 상태 화면

| 상태 | 표현 |
|---|---|
| 로딩(최초) | 카드 스켈레톤 6개: 카드와 같은 크기에 `animate-pulse`, 내부는 `bg-slate-200 dark:bg-neutral-800`의 둥근 막대 |
| 빈 목록(기사 없음) | 중앙 정렬 `py-20 text-center`, 제목 "아직 가져온 뉴스가 없어요", 설명 `text-sm text-slate-500`, 아래에 주요 버튼 "뉴스 가져오기" |
| 빈 목록(해당 카테고리 없음) | "이 카테고리에는 뉴스가 없어요" + "전체 보기" 텍스트 링크 |
| 오류 | 카드 목록 위에 `rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300` 배너 |

### 4.5 모달 (카테고리 수정·삭제 확인 시)

- 오버레이: `fixed inset-0 z-20 bg-black/40`
- 패널: `mx-auto mt-[20vh] w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-900`
- 버튼 줄: 우측 정렬, 취소는 고스트 스타일, 확인은 주요 버튼(삭제는 `bg-red-600 hover:bg-red-700`)
- Esc·오버레이 클릭으로 닫기, 열릴 때 첫 입력에 포커스

## 5. 반응형

| 구간 | 카드 열 수 | 비고 |
|---|---|---|
| 기본(모바일) | 1열 | 헤더의 버튼은 아이콘+짧은 문구, 카테고리 칩은 줄바꿈 |
| `md` (≥768px) | 2열 | |
| `xl` (≥1280px) | 3열 | 컨테이너 `max-w-6xl` 고정 |

## 6. 접근성

- 카테고리 필터는 `role="group" aria-label="카테고리 필터"`, 각 칩은 `<button aria-pressed>`.
- 모든 버튼·링크에 `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500`를 적용한다.
- 아이콘만 있는 버튼은 `aria-label`을 필수로 둔다.
- 수집·저장 결과 안내는 `role="status"`(오류는 `role="alert"`)로 스크린리더에 알린다.
- 본문 텍스트 대비는 WCAG AA(4.5:1) 이상을 유지한다 (`slate-600` on `white` 기준 충족).

## 7. 구현 메모

- 컴포넌트 위치(제안): `src/components/` 아래에 `header.tsx`, `category-bar.tsx`, `news-card.tsx`, `news-grid.tsx`.
- 상호작용이 있는 컴포넌트(카테고리 바, 가져오기 버튼, NOTION 버튼)는 클라이언트 컴포넌트로, 목록 조회는 서버 컴포넌트/API에서 처리한다.
- 앱 이름과 `<html lang>`은 현재 스캐폴드 기본값(`Create Next App`, `en`)이므로 구현 시 `AI 뉴스 수집기` / `ko`로 바꾼다.
- 카테고리 색을 구분할 필요가 생기면 배지 색만 확장하고, 칩·카드 구조는 유지한다.
