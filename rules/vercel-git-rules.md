# Vercel 배포 전역 규칙

이 저장소의 모든 세션·작업은 아래 규칙을 따른다.

## 1. 배포 방식
- 배포는 **git push로만** 한다.
- `vercel deploy` 등 Vercel CLI 커맨드라인 배포는 사용하지 않는다.

## 2. 기준 브랜치
- 기준 브랜치는 **main**이다.
- **master 브랜치는 보지 않는다.**

## 3. 확인 방식
- 배포 상태 확인은 Vercel 대시보드 또는 MCP로 한다.
- 프로덕션 URL 직접 호출로 최종 동작을 확인한다.

## 4. 세션 시작 시
1. `git fetch origin`
2. `git checkout main && git pull`
3. 작업 브랜치는 main 기반으로 생성

## 5. 금지
- master 브랜치 기반 작업 금지
- Vercel CLI 직접 배포 금지
- 기준 브랜치가 아닌 상태에서 배포 push 금지
