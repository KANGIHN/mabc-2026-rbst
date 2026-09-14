const { callSolar, parseSolarJson } = require('../lib/solar-call.js');

function buildDemoResult(query) {
  const demoMap = {
    // --- 신규 심사위원 데모 시나리오 4종 (실제 사용 맥락, 업스테이지 대회 아님) ---
    "3-6반 수학수업 진도 어디까지 나갔지?": {
      cards: [{
        id: 1,
        name: "3-6반 수학수업 진도 확인",
        kind: "일반 진행 업무",
        state: "진행 중",
        stateText: "지난주까지 분수의 나눗셈 단원까지 진행했고, 이번 주는 도형의 합동 단원 들어가는 중이에요. 수업 계획서에 이번 주 차시 목표가 정리돼 있고, 지난주 학습지 중 미제출 학생 메모가 남아 있어요.",
        action: { line: "내일 수업 들어갈 차시(도형의 합동 2차시) 자료를 확인하고, 지난 시간 학습지 미제출 학생 명단을 먼저 정리하세요.", reason: "진도표상 이번 주 차시 목표가 정해져 있고, 미제출 학습지 정리 후 수업을 이어가는 게 자연스러워요." },
        warn: "이번 주 진도상 예정: 도형의 합동 단원 진행 중 / 평가 일정: 단원 마무리 평가 다음 주 예정 / 확인 필요: 지난주 학습지 미제출 학생 보충 필요 여부",
        reason: "수업 계획서: 이번 주 도형의 합동 단원 진도 / 학습지 메모: 미제출 학생 목록 / 진도표: 지난주 분수의 나눗셈 → 이번 주 도형의 합동"
      }],
      more: null
    },
    "9/21일 평일 오후조 출근자가 꼭 챙겨야할 업무는?": {
      cards: [{
        id: 1,
        name: "9/21 오후조 출근자 인계 업무 확인",
        kind: "인계 업무",
        state: "확인 필요",
        stateText: "오전조가 남긴 인계 노트 기준 처리해야 할 건이 여러 개 있고, 그 중 오늘 기한 건과 긴급 건이 섞여 있어요. 오전조가 답변 대기 걸어둔 건도 있어, 출근 직후 확인이 필요해요.",
        action: { line: "인계 노트에서 오늘 기한/긴급 건부터 먼저 확인하고, 오전조가 답변 대기 걸어둔 건은 회신 여부를 체크하세요.", reason: "인계 노트에 오늘 처리 필요 건이 섞여 있고, 답변 대기 건은 놓치면 후속 영향이 있어요." },
        warn: "대기 중: 오전조가 답변 대기 걸어둔 건 있음 / 오늘 기한 건: 인계 노트 기준 2건 / 누락되면 안 되는 연결 포인트: 고객 응대 건 인계 여부 확인 필요 / 인계 노트 작성자 확인 필요",
        reason: "인계 노트: 오늘 처리 건 2건 + 답변 대기 건 1건 / 오전조 메모: 고객 응대 인계 여부 미확정 / 투두: 오늘 중 처리 필요 건 표시"
      }],
      more: null
    },
    "신입사원 가이드": {
      cards: [{
        id: 1,
        name: "신입사원 온보딩 가이드",
        kind: "일반 진행 업무",
        state: "진행 중",
        stateText: "계정·권한 셋업은 일부 완료됐고, 첫 주 오리엔테이션 일정이 잡혀 있어요. 멘토가 배정돼 있고, 온보딩 체크리스트 중 몇 개 항목이 아직 미완료 상태예요.",
        action: { line: "오늘/이번 주 온보딩 체크리스트 중 미완료 항목부터 진행하고, 접근 권한이 아직 안 열린 도구는 멘토에게 확인하세요.", reason: "계정 셋업 일부가 끝나서 다음 체크리스트 항목으로 넘어갈 수 있고, 권한 미개방 도구는 멘토 확인이 필요해요." },
        warn: "확인 필요: 접근 권한이 아직 안 열린 도구 있음 / 멘토 확인 필요한 지점: 첫 주 업무 배정 범위 / 첫 주 미팅 일정: 오리엔테이션 + 팀 소개 일정 잡혀 있음",
        reason: "온보딩 체크리스트: 계정/권한 셋업 일부 완료, 미완료 항목 표시 / 멘토 배정: 담당자 지정됨 / 캘린더: 첫 주 오리엔테이션 일정"
      }],
      more: null
    },
    "팀원 휴가 중 내가 대신 챙길 일": {
      cards: [{
        id: 1,
        name: "팀원 휴가 중 대신 챙길 일",
        kind: "인계 업무",
        state: "확인 필요(기록 충돌)",
        stateText: "팀원이 휴가 가면서 인계한 건과, 내가 원래 맡고 있던 업무 사이에 처리 우선순위가 충돌해요. 인계 노트에는 '急' 표시가 있는 건이 있고, 내 업무 목록에도 오늘 처리 건이 있어서 순서를 정해야 해요.",
        action: { line: "인계 노트와 내 업무 목록을 대조해서, 오늘 반드시 처리해야 할 건부터 순서를 정하고, 인계받은 건 중 누락된 연결 포인트가 없는지 확인하세요.", reason: "인계받은 건과 내 원래 업무가 같은 날 겹쳐서, 우선순위를 정하지 않으면 둘 다 놓치기 쉬워요." },
        warn: "충돌: 인계 노트(急 건 포함) vs 내 업무 목록(오늘 처리 건) — 처리 순서 미확정 / 인계받은 건 중 고객 응대 건은 누락되면 안 됨 / 휴가 팀원 복귀 후 인계 내용 확인 필요",
        reason: "인계 노트: 急 건 1건 + 일반 건 2건 / 내 업무 목록: 오늘 처리 건 1건 / 휴가 팀원 메신저: 인계 내용 요약 전달"
      }],
      more: null
    },

    // --- MABC 2027 데모 시나리오 3종 (MCP 연결 시연·발표용, 건드리지 않음) ---
    "MABC 2027 진행 중": {
      cards: [{
        id: 1,
        name: "MABC 2027",
        kind: "검토/의사결정 대기 업무",
        state: "진행 중",
        stateText: "기획안 초안은 작성했고, PRD 리뷰(9/15)와 제출 마감(9/16 18:00)을 앞두고 있어요. 캘린더에 기획 회의·PRD 리뷰·멘토 미팅 일정이 잡혀 있고, 드라이브에 기획안 초안·9월 회의 메모·진행 현황·업무 추적 파일이 정리돼 있어요.",
        action: { line: "PRD 리뷰(9/15) 준비 — 기획안 초안을 PRD 형식으로 정리해서 리뷰에 가져가세요.", reason: "캘린더에 PRD 리뷰 일정이 잡혀 있고, 기획안 초안이 이미 드라이브에 있어서 다음 단계로 연결돼요." },
        warn: "제출 마감 9/16 18:00 KST — PRD 리뷰(9/15) 후 반영 시간이 촉박할 수 있어요. 리뷰 결과를 빠르게 반영할 수 있게 준비해 두세요.",
        reason: "캘린더: 기획 회의(9/10)·PRD 리뷰(9/15)·제출 마감(9/16)·멘토 미팅(9/17) / 드라이브: 기획안 초안·9월 회의 메모·진행 현황·업무 추적"
      }],
      more: null
    },
    "MABC 2027 대기 중": {
      cards: [{
        id: 1,
        name: "MABC 2027",
        kind: "검토/의사결정 대기 업무",
        state: "대기 중",
        stateText: "기획안 초안은 작성했지만, PRD 리뷰(9/15)에서 피드백을 받아야 다음 단계로 갈 수 있어요. 제출 마감(9/16 18:00)이 가까워지고 있어서, 피드백 도착 시점과 반영 시간을 감안해야 해요.",
        action: { line: "PRD 리뷰(9/15) 전에 기획안 초안을 다시 한 번 점검하고, 리뷰 후 피드백을 바로 반영할 수 있게 정리해 두세요.", reason: "캘린더에 PRD 리뷰가 잡혀 있고, 제출 마감 전까지 피드백 반영이 필요해서 미리 준비가 필요해요." },
        warn: "대기 중: PRD 리뷰(9/15) 결과 기다리고 있음 / 제출 마감 9/16 18:00 — 리뷰 지연 시 일정 조정 필요. 멘토 미팅(9/17)에서 추가 피드백 가능성도 있어요.",
        reason: "캘린더: PRD 리뷰(9/15)·제출 마감(9/16)·멘토 미팅(9/17) / 드라이브: 기획안 초안·9월 회의 메모·진행 현황"
      }],
      more: null
    },
    "MABC 2027 충돌": {
      cards: [{
        id: 1,
        name: "MABC 2027",
        kind: "검토/의사결정 대기 업무",
        state: "확인 필요(기록 충돌)",
        stateText: "캘린더에는 PRD 리뷰(9/15)·제출 마감(9/16)·멘토 미팅(9/17) 일정이 잡혀 있는데, 드라이브 '진행 현황' 문서와 '기획안 초안' 문서 간 진행 상태 표기가 달라요. 어느 기록이 최신인지 확인이 필요해요.",
        action: { line: "캘린더 일정과 드라이브 문서(기획안 초안·진행 현황)를 대조해서, 현재 실제 진행 상태를 하나로 정리한 뒤 재개하세요.", reason: "캘린더(일정)와 드라이브 문서(진행 현황) 간 상태 표기가 달라서, 최신 기록을 먼저 확인해야 다음 행동을 정할 수 있어요." },
        warn: "충돌: 캘린더에는 PRD 리뷰·제출 마감 일정이 잡혀 있음 vs 드라이브 '진행 현황' 문서에는 다른 진행 상태 표기. 둘 중 어느 쪽이 최신인지 확인 전엔 상태 단정 불가. PRD 리뷰(9/15)·제출 마감(9/16 18:00) 일정은 캘린더 기준.",
        reason: "캘린더: 기획 회의(9/10)·PRD 리뷰(9/15)·제출 마감(9/16)·멘토 미팅(9/17) / 드라이브: 기획안 초안·9월 회의 메모·진행 현황·업무 추적 — 문서 간 상태 표기 차이 있음"
      }],
      more: null
    }
  };
  let key = Object.keys(demoMap).find(k => query.includes(k));
  // MABC 2027 (test) 계열 질문은 데모 시나리오 3종 중 하나로 매핑
  if (!key && query.includes("MABC 2027")) {
    if (query.includes("제출")) {
      key = "MABC 2027 대기 중";
    } else if (query.includes("기획") || query.includes("할 일") || query.includes("뭐 했")) {
      key = "MABC 2027 진행 중";
    }
  }
  if (!key) {
    return {
      ok: false,
      failure: false,
      data: {
        cards: [{
          id: 1,
          name: query || "선택한 업무",
          kind: "일반 진행 업무",
          state: "확인 필요",
          stateText: "데모 예시 기록 기준으로 상태를 확인 중이에요. 정확한 상태는 실제 기록을 봐야 판단할 수 있어요.",
          action: { line: "관련 기록을 확인한 뒤 첫 행동을 정하세요.", reason: "현재 주어진 단서만으로는 확정하기 어려워요." },
          warn: "데모 예시: 실제 연동 환경이 아닌 경우, 예시 데이터로 카드 생성 흐름을 보여줘요. 최근 메모·요약·키워드를 알려주시면 그 기준으로 잡아볼게요.",
          reason: "데모 예시: 예시 데이터로 카드 생성 흐름을 보여줘요."
        }],
        more: null
      }
    };
  }
  return { ok: true, data: demoMap[key], failure: false };
}

async function handleNormalMode(query, body) {
  const supplement = (body && (body.supplement || body.memo || body.note || body.extra))
    ? (body.supplement || body.memo || body.note || body.extra).toString().trim()
    : "";
  const system = `당신은 업무 재개 카드 생성기예요. 사용자가 "이어가고 싶은 일 하나"(질문 또는 태그/키워드)와, 사용자가 직접 제공한 메모·기록 요약(있으면)을 바탕으로 업무 재개 카드(들)를 JSON으로만 출력해.

중요: 너는 연결된 도구(메일·캘린더·메모 등)에서 기록을 찾아온 게 아니야. 사용자가 이 요청에 직접 적어준 내용만을 근거로 카드(들)를 만들어. 카드 안에 "연결된 도구에서 기록을 찾았다"는 식으로 쓰지 말고, 사용자가 제공한 메모·기록을 기준으로 정리했다는 점을 근거에 반영해.

출력 규칙:
- 업무명/종류를 맥락에서 추출해. 없으면 name은 사용자가 준 질문을 그대로 쓰고 kind는 "일반 진행 업무"로 해.
- 현재 상태(state)는 확정적 종료 표현("완료", "다 했", "끝났다", "더 할 일 없음", "마무리됨" 등)이 있을 때만 "완료"로 해. "거의 끝남", "마무리 예정", "추가 보완 필요", "다음 주에 마무리 예정" 등은 완료로 단정하지 말고 "진행 중" 또는 "확인 필요"로 둬.
- 여러 기록 사이에 상태가 다르면 state는 "확인 필요(기록 충돌)"로 하고, 첫 행동(action.line)은 "충돌 해소 후 재개" 방향(무엇을 누구에게/어디서 확인할지)으로 제시해. 충돌 내용은 warn에 표시해.
- 대기 중인 항목(답 없음, 확인 대기, 피드백 대기 등)이 있으면 복합 처리가 필요한 상태로 보고, 주의사항에 대기 항목 + 기한을 표시해.
- 여러 업무가 보이면 업무별로 카드 각각 출력하되, 최대 3장까지만 출력하고 나머지는 more.count로 요약해.
- 근거(reason)는 맥락이 있는 범위에서만 쓰고, 없는 정보는 과추정하지 마. 특히 기록에 없는 시점 표현("어제", "지난주" 등)을 근거로 만들지 마.
- 사용자가 제공한 메모·기록을 근거로 쓸 때는 그 내용을 reason에 그대로 드러내되, 없는 내용을 덧붙이지 마.

JSON 출력 형식(꼭 이 구조만):
{
  "cards": [
    {
      "id": 1,
      "name": "업무명",
      "kind": "업무 종류",
      "state": "상태 라벨(진행 중/대기 중/확인 필요/확인 필요(기록 충돌)/완료 등)",
      "stateText": "현재 상태 설명 1~2문장",
      "action": { "line": "첫 행동 1개", "reason": "근거 1줄" },
      "warn": "주의사항(기한/리스크/대기/충돌/토스·인계 포인트)",
      "reason": "근거 상세(핵심 1줄 + 필요 시 상세)"
    }
  ],
  "more": { "count": 숫자 } 또는 null
}

규칙:
- 출력은 이 JSON 객체 하나만, 다른 문장은 쓰지 마.
- 한국어 출력.`;

  const userContent = supplement
    ? `사용자가 이어고 싶은 일: ${query}\n\n사용자가 직접 제공한 메모·기록 요약:\n${supplement}`
    : `사용자가 이어고 싶은 일: ${query}\n\n(사용자가 별도로 제공한 메모·기록 요약은 없어요.)`;

  const content = await callSolar([
    { role: "system", content: system },
    { role: "user", content: userContent }
  ], 2048);

  const parsed = parseSolarJson(content);
  if (!parsed || !Array.isArray(parsed.cards) || parsed.cards.length === 0) {
    return {
      ok: false,
      failure: false,
      data: { cards: [], more: null },
      note: supplement
        ? "입력하신 내용을 정리하는 데 실패했어요. 다시 시도하거나, 데모 예시로 체험해 볼 수 있어요."
        : "입력하신 내용만으로는 카드 생성이 어려워요. 최근 메모·요약·키워드를 함께 알려주시거나, 데모 예시로 체험해 볼 수 있어요."
    };
  }
  let more = null;
  if (parsed.more && typeof parsed.more.count === "number" && parsed.more.count > 0) {
    more = { count: parsed.more.count };
  }
  if (!more && parsed.cards.length > 3) {
    more = { count: parsed.cards.length - 3 };
  }
  return {
    ok: true,
    data: { cards: parsed.cards.slice(0, 3), more },
    failure: false
  };
}

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "POST만 지원" });

  let body = {};
  if (typeof req.body === "string") {
    try { body = JSON.parse(req.body || "{}"); } catch { return res.status(200).json({ ok: false, failure: false, error: "잘못된 요청(JSON 파싱 실패)" }); }
  } else if (req.body && typeof req.body === "object") {
    body = req.body;
  } else {
    return res.status(200).json({ ok: false, failure: false, error: "잘못된 요청(잘못된 본문)" });
  }

  const query = (body && body.query && String(body.query).trim()) || "";
  const isDemo = !!body.isDemo;
  if (!query) return res.status(200).json({ ok: false, failure: false, data: { cards: [], more: null } });

  /*
   * === 실제 Google 데이터 연동 구조 (MABC 2026 결선) ===
   *
   * 구현 방식: 백엔드(Composio)로 실제 Google 데이터 조회 후 카드 생성에 반영
   * - Composio 도구: GOOGLECALENDAR_EVENTS_LIST, GMAIL_FETCH_EMAILS, GOOGLEDRIVE_LIST_FILES 등
   * - 규정 근거: 제9조 제3항(MCP 활용 허용), 제5조 제3항(공개 외부 API 사용 허용)
   * - 보안: API 키·토큰은 서버 측(Vercel 환경변수 등)에서만 관리, 프론트엔드(index.html) 노출 금지 (제9조 제6항)
   * - 개인정보: 본인 계정 데이터 시연 시 노출 범위 필터링 필요 (제5조 제5항)
   *
   * 아키텍처 노트:
   * - 이 Vercel 서버리스 함수 환경에서는 Composio REST API를 직접 호출하는 구조
   * - 데모 영상/심사 재현용은 Timely 환경의 composio_execute 도구로 실제 데이터 조회
   * - isDemo=true: 기존 buildDemoResult(가상 데이터) 사용
   * - isDemo=false + 실제 연결: Composio로 Google 데이터 조회 → Solar 맥락 보강 → 카드 생성
   * - 연결 실패/빈 데이터: handleNormalMode로 fallback (사용자 직접 입력 기반)
   *
   * 시연 장면 우선순위:
   * 1. 캘린더 기반 "복귀 직후 오늘 일정/할 일 카드" (1순위 완성 대상)
   * 2. 메일 토스·회신 대기
   * 3. 드라이브·문서 탐색
   * 4. 샘플 작업 조각(캘린더·일정·회의록·진행현황) 모아서 결과물 생성
   */

  // 데모 모드 우선 처리 (debug-demo.js와 동일 로직)
  if (isDemo) {
    try {
      const result = buildDemoResult(query);
      // 프론트 runGenerate는 raw.data에서 data.cards를 찾음 → data는 {cards, more} 구조여야 함
      return res.status(200).json({ ok: true, data: result.data ?? result, failure: false });
    } catch (e) {
      return res.status(200).json({ ok: false, failure: true, error: "데모 처리 중 오류", debug: { msg: String(e) } });
    }
  }

  // 일반 모드: 사용자 직접 입력(+선택 보충 메모) 기반 Solar 보조 처리
  try {
    const result = await handleNormalMode(query, body);
    return res.status(200).json(result);
  } catch (e) {
    console.error("[generate] 일반 모드 처리 오류:", e && e.message ? e.message : String(e));
    return res.status(200).json({
      ok: false,
      failure: true,
      error: "기록 처리 중 문제가 있었어요. 잠시 후 다시 시도해 주세요."
    });
  }
};

// 테스트/확인용 exports (서비스 런타임 핸들러와 무관)
module.exports.buildDemoResult = buildDemoResult;
module.exports.handleNormalMode = handleNormalMode;
