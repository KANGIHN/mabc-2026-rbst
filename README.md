# MABC 2026 — ResumeCard 작업·배포 체크리스트

> 새로 세션을 시작할 때 이 파일을 먼저 읽고, 같은 순서로 진행하면 배포 에러를 줄일 수 있다.
> 이 문서는 "현재 확인된 정상 흐름"을 기록한다. 실제 상태가 달라지면 수정한다.

---

## 1. 먼저 확인할 것 (세션 시작)

### 1-1. 작업공간 상태
- 작업공간에 `index.html`이 있는지 확인
- 파일 수정 시간이 최근인지 확인
- 필요하면 GitHub 최신 내용과 비교한다

### 1-2. GitHub 최신 상태
- 저장소: `github.com/KANGIHN/mabc-2026-rbst`
- 기본 브랜치: `main`
- 공개 여부: public
- 커밋은 GitHub API를 통해 확인한다

### 1-3. Vercel 프로젝트 정보 (고정값)
- 프로젝트 ID: `prj_vE9xCzB4HsTKh6CSa9ASBEPPVvgk`
- 프로젝트명: `mabc-2026-rbst`
- 생산 URL: `https://mabc-2026-rbst.vercel.app`
- 프리뷰 URL(master): `https://mabc-2026-rbst-git-master-robust2991-1787s-projects.vercel.app`

---

## 2. 작업 순서 (이번 세션 기준)

### 단계 1 — 작업공간과 GitHub 비교
- 로컬 `index.html`과 GitHub 최신 `index.html`이 같은지 비교한다
- 비교 방법 예시:
  - 로컬 파일 base64 인코딩
  - GitHub API로 받은 파일 base64 인코딩
  - 둘을 문자열로 비교
- 같으면: 추가 커밋 불필요
- 다르면: GitHub에 커밋 필요

### 단계 2 — GitHub 커밋 (변경이 있을 때만)
- 변경 내용을 `index.html`에 반영한다
- 커밋 메시지 예시:
  - `UI 전면 수정: 결과 카드 + 내부 블록 구분 + 상단 안내 통합 + 인라인 스타일 정리`
- 브랜치는 `main`으로 올린다
- GitHub API 사용 시 최신 `sha`를 반드시 함께 보내야 한다
  - sha 없이 올리면 "does not match" 오류 발생 가능

### 단계 3 — Vercel 배포 확인
- GitHub `main` 브랜치 커밋 → Vercel 자동 배포 트리거
- Vercel 배포 상태는 MCP 컴포저(VERCEL_GET_DEPLOYMENTS)로 확인한다
- 확인할 항목:
  - `state`: `READY` 여부
  - `target`: `production` 여부
  - `readyState`: `PROMOTED` 여부
  - 커밋 sha가 의도한 커밋과 일치하는지

### 단계 4 — 서비스 응답 확인
- 프로덕션 URL 접속 확인
  - `https://mabc-2026-rbst.vercel.app`
  - HTTP 200 여부
  - 본문 앞부분에 새 CSS/구조가 반영됐는지 확인
- `/api/generate` 실제 호출 확인
  - 데모 예시 쿼리로 호출한다
  - 예: `{"query":"MABC 2026 결선 준비","isDemo":true}`
  - 응답이 `ok: true`, `failure: false`인지 확인
  - `data.cards`가 1장 이상 돌아오는지 확인
  - 카드 내용(상태, 첫 행동, 주의사항, 근거)이 정상인지 확인

---

## 3. 확인 포인트 요약

| 확인 항목 | 방법 | 정상 기준 |
|---|---|---|
| 로컬 vs GitHub | base64 비교 | 같으면 커밋 불필요 |
| GitHub 커밋 | API로 커밋 목록 조회 | 의도한 sha/메시지가 최신인지 |
| Vercel 배포 상태 | MCP 컴포저 배포 조회 | state=READY, target=production, readyState=PROMOTED |
| 서비스 접속 | URL 직접 요청 | HTTP 200, 새 디자인 반영 |
| API 응답 | /api/generate 직접 호출 | ok=true, failure=false, cards >= 1 |

---

## 4. 자주 보이는 문제/에러와 확인 방법

### 4-1. GitHub 업데이트 시 "does not match sha" 오류
- 원인: 올린 `sha`가 실제 최신 sha와 다름
- 해결:
  - 올리기 직전에 최신 sha를 다시 가져와서 함께 전송
  - 같은 내용을 두 번 올리려 할 때도 발생할 수 있음

### 4-2. GitHub 파일 base64 비교 시 길이 0 또는 파싱 오류
- 원인: API 응답을 잘못 디코딩
- 해결:
  - `content` 필드가 있는지 먼저 확인
  - base64 디코딩 후 다시 인코딩할 때 타입 오류 주의
  - 비교는 가능한 한 문자열 단위로 단순화

### 4-3. Vercel 배포 조회 API 버전 오류
- 원인: 시도한 API 경로가 환경에 맞지 않음
- 해결:
  - MCP 컴포저(VERCEL_GET_DEPLOYMENTS 등)로 조회
  - 직접 API 호출이 막히면 실제 서비스 URL을 직접 확인한다

### 4-4. 배포는 됐는데 화면이 안 바뀐 것 같을 때
- 확인 순서:
  1. GitHub 최신 커밋 sha 확인
  2. Vercel 배포 목록의 커밋 sha와 비교
  3. 프로덕션 URL을 직접 요청해서 본문 확인
  4. 필요 시 프리뷰 vs production 브랜치/별칭 구분 확인

### 4-5. /api/generate 응답이 이상할 때
- 먼저 응답의 top-level 키를 본다
  - `ok`, `failure`, `data`, `message`
- `ok: true`인데 `cards: 0`이면
  - 키 문제보다 데모 예시 매칭/데이터 구성 문제일 수 있음
- `failure: true`면
  - 에러 메시지를 보고 호출 실패인지 처리 실패인지 구분한다

---

## 5. 참고 링크/정보

- 저장소: `github.com/KANGIHN/mabc-2026-rbst`
- 프로덕션 URL: `https://mabc-2026-rbst.vercel.app`
- Vercel 프로젝트 ID: `prj_vE9xCzB4HsTKh6CSa9ASBEPPVvgk`
- 진행현황 파일(저장소 내): `MABC 2026 결선/progress.md`
- 규칙 파일(저장소 내): `MABC 2026 결선/mabc-2026-rules.md`
- 컨텍스트 파일(저장소 내): `MABC 2026 결선/mabc-2026-context.md`

---

## 6. 규칙상 주의할 점 (요약)

- API 키·토큰은 소스코드·배포물에 노출하지 않는다
- 외부 LLM을 서비스 런타임에 사용하지 않는다
- 배포본은 심사 시점까지 유지돼야 한다
- 커밋 해시/배포 식별자 등 배포본 특정 정보는 제출 시 함께 기재한다

---

*이 문서는 실제 작업 흐름을 기록한 참고용이다. 상태가 바뀌면 갱신한다.*
