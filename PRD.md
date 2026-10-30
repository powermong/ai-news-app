# PRD: AI 뉴스 수집기

## 1. 개요
해외 AI 뉴스를 RSS로 수집하고, Claude API로 한국어 번역·요약·카테고리 분류를 한 뒤 카드 형태로 보여주는 웹앱. 마음에 드는 뉴스는 Notion에 저장할 수 있다.

## 2. 목표
- 해외 AI 뉴스를 한국어로 빠르게 훑어볼 수 있다.
- 뉴스가 카테고리별로 자동 분류되어 원하는 주제만 골라 볼 수 있다.
- 선택한 뉴스를 클릭 한 번으로 Notion에 보관할 수 있다.

## 3. 비목표 (현재 범위 밖)
- 본문 전체 번역 (RSS가 제공하는 제목·요약·일부 본문 기반으로 처리)
- 자동 주기 수집 (사용자가 버튼을 눌렀을 때만 수집)
- RSS 소스를 사용자가 추가·삭제하는 기능 (소스는 고정 2개)

## 4. 사용자 흐름
1. 앱 실행 → 미로그인 상태면 Clerk 로그인 화면으로 이동
2. 로그인 후 메인 화면에서 **뉴스 가져오기** 클릭
3. 서버가 RSS 2곳을 수집 → 신규 기사만 Claude API로 번역·요약·분류 → DB 저장
4. 카드 목록 표시, 카테고리 필터로 원하는 뉴스만 보기
5. 카드의 **NOTION 저장** 클릭 → 해당 뉴스가 Notion에 저장됨
6. 카테고리 관리 화면에서 카테고리 추가·수정·삭제

## 5. 뉴스 소스
| 소스 | RSS URL |
|---|---|
| TechCrunch AI | https://techcrunch.com/category/artificial-intelligence/feed/ |
| The Verge AI | https://www.theverge.com/rss/ai-artificial-intelligence/index.xml |

## 6. 기능 요구사항

### 6.1 인증
- Clerk로 로그인한다. 로그인하지 않으면 앱의 모든 페이지·API에 접근할 수 없다.
- 모든 데이터는 Clerk `userId` 기준으로 분리한다.

### 6.2 뉴스 수집
- **뉴스 가져오기** 버튼 클릭 시 두 RSS를 가져와 파싱한다.
- 이미 저장된 기사(같은 URL)는 건너뛰고 Claude를 다시 호출하지 않는다.
- 수집 중에는 로딩 상태를 표시하고, 실패한 소스가 있어도 나머지는 처리한 뒤 결과를 알린다.

### 6.3 AI 처리 (Claude API)
- 기사 한 건당 한 번의 호출로 아래를 JSON으로 받는다.
  - 한국어 제목
  - 한국어 요약 (3~4줄)
  - 카테고리 (현재 DB에 있는 카테고리 목록 중에서 선택, 해당 없으면 "미분류")
- 카테고리 목록은 프롬프트에 매번 포함한다.

### 6.4 카테고리 관리
- 추가, 이름 수정, 삭제를 지원한다. 언제든 변경 가능.
- 카테고리 삭제 시 해당 기사는 "미분류"로 이동한다.
- 카테고리 변경 후 기존 기사의 재분류는 선택 기능으로 둔다 (아래 12번 미결 사항).
- 초기 기본 카테고리를 제공한다 (예: 모델/연구, 기업/투자, 제품/서비스, 규제/정책, 기타).

### 6.5 뉴스 카드 목록
- 카드 구성: 한국어 제목, 요약, 카테고리 배지, 출처, 발행일, 원문 링크, NOTION 저장 버튼
- 상단 카테고리 필터 (전체 + 각 카테고리). 선택한 카테고리의 뉴스만 표시한다.
- 최신 발행일 순으로 정렬한다.

### 6.6 Notion 저장
- 카드의 **NOTION 저장** 버튼으로 해당 뉴스를 Notion에 저장한다.
- 저장 항목: 제목, 요약, 카테고리, 원문 링크, 출처, 발행일
- 저장 후 버튼은 "저장됨" 상태로 바뀌고, 같은 기사를 중복 저장하지 않는다.
- Notion 연동은 **Notion MCP 서버**를 사용한다.

## 7. 기술 스택
| 영역 | 선택 |
|---|---|
| 프레임워크 | Next.js |
| 로그인 | Clerk |
| 데이터베이스 | Neon (서버리스 Postgres) |
| ORM | Drizzle ORM |
| 번역·요약·분류 | Claude API |
| Notion 저장 | Notion MCP 서버 |

## 8. 데이터 모델 (초안)

**categories**
| 컬럼 | 설명 |
|---|---|
| id | PK |
| user_id | Clerk userId |
| name | 카테고리 이름 (사용자 내 unique) |
| created_at | 생성일 |

**articles**
| 컬럼 | 설명 |
|---|---|
| id | PK |
| user_id | Clerk userId |
| url | 원문 URL, `(user_id, url)` unique |
| source | TechCrunch / The Verge |
| title_original | 원문 제목 |
| title_ko | 한국어 제목 |
| summary_ko | 한국어 요약 |
| category_id | FK → categories (null이면 미분류) |
| published_at | 발행일 |
| fetched_at | 수집일 |
| notion_page_id | Notion 저장 시 페이지 ID (null이면 미저장) |

## 9. API 구조 (초안)
| 메서드 | 경로 | 설명 |
|---|---|---|
| POST | /api/news/fetch | RSS 수집 + Claude 처리 + 저장 |
| GET | /api/news?category= | 기사 목록 (카테고리 필터) |
| GET/POST | /api/categories | 카테고리 조회·추가 |
| PATCH/DELETE | /api/categories/:id | 카테고리 수정·삭제 |
| POST | /api/news/:id/notion | Notion 저장 |

모든 API는 Clerk 인증을 확인하고 `userId` 범위 안에서만 동작한다.

## 10. 화면 구성
- **로그인**: Clerk 제공 화면
- **메인**: 상단에 뉴스 가져오기 버튼과 카테고리 필터, 아래에 카드 그리드
- **카테고리 관리**: 목록과 추가·수정·삭제 (모달 또는 별도 페이지)

## 11. 비기능 요구사항
- API 키(Claude, Notion, Neon, Clerk)는 서버 환경변수로만 관리하고 클라이언트에 노출하지 않는다.
- Claude 호출은 신규 기사에만 수행하여 비용을 최소화한다.
- 외부 호출(RSS, Claude, Notion) 실패 시 사용자에게 오류를 표시하고 부분 성공을 허용한다.

## 12. 미결 사항
1. **Notion MCP 연동 방식**: Next.js 서버가 MCP 클라이언트로 도구를 직접 호출할지, Claude API의 MCP connector를 통해 호출할지. 인증(OAuth/토큰) 방식도 확정 필요. (대안: Notion REST API 직접 호출)
2. **Notion 저장 대상**: 하나의 데이터베이스에 행으로 추가하는 방식으로 가정했으며, DB 위치 확정 필요.
3. **사용자 범위**: 개인용인지 다중 사용자인지. 현재는 `userId` 분리 구조로 설계하여 둘 다 대응 가능.
4. **수집 건수**: 소스당 최대 몇 건을 가져올지 (제안: 최신 10건).
5. **카테고리 변경 시 재분류 정책**: 자동 재분류 / 수동 재분류 / 하지 않음.
6. **배포 환경**: 로컬 또는 Vercel 등.
