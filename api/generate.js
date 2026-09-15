const { callSolar, parseSolarJson } = require('../lib/solar-call.js');

function buildDemoResult(query) {
  const demoMap = {
    // --- 변호사 데모 시나리오 3종 (개업 변호사 · 송무 중심) ---
    "2026가단12345 손해배상": {
      cards: [{
        id: 1,
        name: "2026가단12345 손해배상 청구",
        caseNo: "2026가단12345",
        nextDate: "D-7 (9/22 변론기일)",
        kind: "송무 사건",
        state: "확인 필요(기록 충돌)",
        stateText: "의뢰인은 합의를 염두에 두고 있는데, 준비서면 초안에는 전액 다투는 방향이 잡혀 있어요. 둘의 방향이 달라서 지금 방침을 하나로 단정하기 어려워요.",
        action: { line: "의뢰인에게 현재 합의 의사가 있는지 확인한 뒤, 서면 방향을 결정하세요.", reason: "9/1 메일(합의 의향)과 9/3 준비서면 초안(전액 다툼)이 상충돼, 의뢰인 의사를 먼저 확인해야 방향을 잡을 수 있어요." },
        warn: "충돌: 의뢰인 메일(9/1, 합의 의향) vs 준비서면 초안(9/3, 전액 다툼). 하나는 합의, 하나는 전액 다툼으로 방향이 달라요. 현재 방침 미확정. 변론기일 9/22 D-7 — 방향 확정 시급.",
        reason: "의뢰인 메일(9/1): 합의 의향 밝힘 / 준비서면 초안(9/3): 전액 다투는 방향 / 변론기일 캘린더(9/22): D-7 / 사무장 메일(9/5): 감정 신청 문의, 답 없음"
      }],
      more: null
    },
    "2026가단67890 임대차": {
      cards: [{
        id: 1,
        name: "2026가단67890 임대차보증금 반환",
        caseNo: "2026가단67890",
        nextDate: "준비서면 제출 예정",
        kind: "송무 사건",
        state: "진행 중",
        stateText: "상대방 원상복구비 주장에 대한 반박 자료를 정리 중이에요. 보증금 산정 근거(메일·시트)와 준비서면 초안이 각자 준비돼 있고, 초안에 원상복구비 반박을 추가하면 완성돼요.",
        action: { line: "준비서면 초안에 원상복구비 반박 내용을 추가하세요.", reason: "상대방 주장에 대응할 근거가 메일·시트· docs 초안에 이미 흩어져 있어서, 초안에 반영하면 서류 준비가 마무리돼요." },
        warn: "진행 중: 준비서면 초안 작성 중 — 원상복구비 반박 추가 필요 / 보증금 산정 근거(메일 2건 + 시트 1행) 확보됨 / 준비서면 제출 일정은 캘린더 기준.",
        reason: "gmail 1: 원상복구비 관련 상대방 주장 / gmail 2: 보증금 산정 근거 / 캘린더: 준비서면 제출 일정 / docs: 준비서면 초안 / sheets: 비용 산정 행"
      }],
      more: null
    },
    "2026나54321 공사대금": {
      cards: [{
        id: 1,
        name: "2026나54321 공사대금 항소",
        caseNo: "2026나54321",
        nextDate: "항소기간 진행 중 (판결문 정본 송달 후 2주 내)",
        kind: "송무 사건",
        state: "확인 필요",
        stateText: "항소기간 진행 중이에요. 판결문 정본 송달 후 2주 안에 항소 여부를 결정해야 해서, 지금 시점에서 항소 준비 상태와 추가 기록을 먼저 확인해야 해요.",
        action: { line: "판결문 정본 송달일과 항소기간을 확인하고, 항소 준비가 필요한 서류·기록부터 챙기세요.", reason: "항소기간이 진행 중이라 기한 관리가 먼저고, 그 안에서 어떤 기록이 추가로 필요한지부터 정리해야 해요." },
        warn: "항소기간 진행 중: 판결문 정본 송달 후 2주 내 / 나머지는 more로 요약 — 우선 사건(항소 여부 결정)이 먼저.",
        reason: "항소기간 진행 중(판결문 정본 송달 후 2주 내) / 나머지 3건은 more로 요약 — 우선 이벤트(항소 여부 결정) 기준"
      }],
      more: { count: 3 }
    }
  };

  // 띄어쓰기에 관계없이 사건번호 매칭 (예: 2026가단12345 = 2026 가 단 12345)
  const queryNoSpace = query.replace(/\s+/g, '');

  // 데모 맵 키도 공백 제거한 버전으로 비교용 맵 구성 (원래 키는 결과 반환용)
  const demoMapNoSpace = {};
  Object.keys(demoMap).forEach(k => { demoMapNoSpace[k.replace(/\s+/g, '')] = k; });

  // 1) 데모 맵 키와 직접 포함 매칭 시도 (쿼리 전후 + 키 공백제거 버전)
  let key = null;
  if (Object.keys(demoMap).find(k => query.includes(k))) {
    key = Object.keys(demoMap).find(k => query.includes(k));
  } else if (Object.keys(demoMapNoSpace).find(k => queryNoSpace.includes(k) || k.includes(queryNoSpace))) {
    key = demoMapNoSpace[Object.keys(demoMapNoSpace).find(k => queryNoSpace.includes(k) || k.includes(queryNoSpace))];
  }

  // 2) 직접 매칭 없으면 사건번호 추출 후 재매칭
  if (!key) {
    const caseNumMatch = queryNoSpace.match(/(\d{4}[가단나]\d+)/);
    if (caseNumMatch) {
      const caseNo = caseNumMatch[1];
      key = Object.keys(demoMap).find(k => k.includes(caseNo)) ||
           demoMapNoSpace[Object.keys(demoMapNoSpace).find(k => k.includes(caseNo))];
    }
  }

  // 3) 매칭되는 데모 시나리오가 없으면 "기록을 찾지 못함"으로 처리
  if (!key) {
    return {
      ok: false,
      failure: false,
      data: { cards: [], more: null },
      note: "입력하신 내용과 일치하는 데모 기록을 찾지 못했어요. 위 예시를 눌러 체험해 보세요."
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
        ? "입력하신 내용을 정리하는 데 실패했어요. 다시 시도하거나, 위 예시를 눌러 체험해 보세요."
        : "입력하신 내용만으로는 카드 생성이 어려워요. 최근 메모·요약·키워드를 함께 알려주시거나, 위 예시를 눌러 체험해 보세요."
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
      return res.status(200).json({ ok: result.ok, data: result.data ?? result, failure: false, note: result.note });
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
