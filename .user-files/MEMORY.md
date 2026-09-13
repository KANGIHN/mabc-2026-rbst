## 소속 · 도메인
- 업스테이지(업스테이지 기업) 관련 프로젝트 참여 중

## 반복 업무 · 컨텍스트
- 관심: 대회 관련 내용 정리 및 관리 (여러 대회 세션에서 진행 중)
- 관심: mabc 2026 관련 정보 관리 및 전략
- 관심: 발표 자료 준비 (템플릿 링크 확보 완료, 5장 이내, Noto Sans 필수, PDF 변환 규칙 확인 필요)
- 관심: Making AI Beneficial 챌린지 (구글 독스 규정 문서 확인 중, 조문 본문·결선 규정·금지행위 등 세부 사항 필요)
- 관심: 업무 재개 카드 생성 서비스 MVP 설계 및 개선 (결선 9/16 18:00 마감, **skill-to-service 스킬 규정 적용**)
  - 현재 우선순위: 시나리오 3종(진행 중/대기 중/확인 필요·충돌)을 실제 서비스에 올려서 테스트 → manifest 업데이트 → 배포 테스트
  - MVP 초안 파일: `MABC 2026 결선/MVP-초안.md` (생성 완료)
  - PRD 초안 파일: `MABC 2026 결선/PRD-초안.md` (생성 완료, skill-to-service 11개 항목 구성, 추가 완성 진행 중)
  - GitHub 저장소: `github.com/KANGIHN/mabc-2026-rbst` (로컬 main 안정화, Composio 도구 호출 코드 추가, 스크립트 수정 진행 중: runGenerate supplement 파라미터 추가·시나리오 버튼 핸들러 추가·기존 데모 버튼 유지)
  - Vercel 배포: `https://mabc-2026-rbst.vercel.app` (프로덕션 배포 중, 실제 Google 데이터 연동 상태 반영 진행)
  - 진행 상태 추적: `MABC 2026 결선/progress.md` (2026-09-13 갱신, Composio 도구 검증 완료 상태 반영)
  - 세션 인수인계: `MABC 2026 결선/handoff.md` (2026-09-13 갱신)
  - 소스코드 구조: 프론트(index.html, "실제 기록 연동" 상태 배지 추가) → 백엔드(api/generate.js, Composio 도구 호출 주석 추가) → 데모맵 및 실제 Google 데이터 병행
  - **Google 서비스 대상**: Calendar, Gmail, Drive, Docs, Sheet
  - **Composio 도구 검증 상태**: `GOOGLECALENDAR_EVENTS_LIST` ⏳ API 할당량 초과(403) 상태, manifest에 "참고 캘린더" 표기 선반영 후 할당량 풀릴 시 패치 예정, `GMAIL_GET_PROFILE` ✅, `GOOGLEDRIVE_LIST_FILES` ✅, `GMAIL_FETCH_EMAILS` ✅ (Gmail 드래프트 4건 확인), Docs 3건 내용 확인 완료, Sheets 업무 추적 A1:D8 정상
  - **테스트 데이터 Calendar 이벤트**: 9/10(수) 14:00~15:00 기획 회의, 9/15(월) 14:00~15:00 PRD 리뷰, 9/16(화) 17:00~17:30 제출 마감, 9/17(수) 10:00~11:00 멘토 미팅 (timezone: Asia/Seoul, KST +09:00 반영)
  - **테스트 데이터 Drive**: 폴더 내 4개 파일 구성 확인 완료
  - **신규 파일**: `demo-real-data.js` (Composio 기반 실제 데이터 조회 스크립트, Calendar/Gmail/Drive 데이터 조회 및 개인정보 필터링 구조 포함, Solar 맥락 보강 → 카드 생성 흐름)
  - **시연 방식**: 시나리오 3종을 서비스 UI에서 직접 테스트 (supplement 데이터 입력 후 카드 생성 결과 확인)
  - **데이터 방식**: 시나리오별 간결한 supplement 문구(예: "9/10 기획 회의 완료, PRD 초안 작성 중" 형태)로 서비스 테스트, 실제 Google 연동은 별도 진행
  - **규정 준수**: MCP/Composio 활용 허용(제9조 제3항), Google 공개 API 사용 허용(제5조 제