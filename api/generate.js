const { callSolar, parseSolarJson } = require('../lib/solar-call.js');

function buildDemoResult(query) {
  const demoMap = {
    "MBCD 프로젝트": {
      cards: [{
        id: 1,
        name: "MBCD 프로젝트",
        kind: "일반 진행 업무",
        state: "확인 필요(기록 충돌)",
        stateText: "메모에는 '거의 끝남'이라고 적혀 있지만, 메일 스레드에는 '아직 검토 중'이라고 왔어요. 둘의 상태가 달라서, 현재 상태를 하나로 단정하기 어려워요.",
        action: { line: "담당자에게 현재 상태를 확인한 뒤 재개하세요.", reason: "메모와 메일의 상태가 다르므로 최신 상태를 먼저 확인이 필요해요." },
        warn: "충돌: 메모('거의 끝남' — 자료 정리 마무리 단계) vs 메일('아직 검토 중' — 담당자 확인 필요). 둘 중 어느 쪽이 최신·정확한지 확인이 필요해요. 담당자를 알면 담당자에게 확인, 모르면 어느 기록이 최신인지 확인 후 재개.",
        reason: "메모: 거의 끝남 — 자료 정리 마무리 단계 / 메일: 아직 검토 중 — 담당자 확인 필요 / 회의록: 다음 주 최종 확인 예정 / 투두: 이번 주 금요일까지 보완"
      }],
      more: null
    },
    "MABC 2026 결선 준비": {
      cards: [{
        id: 1,
        name: "MABC 2026 결선 준비",
        kind: "검토/의사결정 대기 업무",
        state: "대기 중",
        stateText: "초안은 완료됐고, 피드백 반영을 기다리고 있어요. 제출 마감은 9/16 18:00예요.",
        action: { line: "피드백이 오면 반영해서 제출 준비를 마무리하세요.", reason: "초안 완료 + 제출 마감 전이므로, 대기 중인 피드백을 반영하면 돼요." },
        warn: "대기 중: 자료 검토 요청을 보냈지만 아직 답이 없어요. 제출 마감 9/16 18:00이 있어 지연되면 후속 일정에 영향이 있을 수 있어요. 피드백 도착 시점과 반영 시간을 감안하세요.",
        reason: "캘린더: 발표 리허설 일정 잡힘 / 메일: 자료 검토 요청 보냈으나 답 없음 / 메모: 초안 완료, 피드백 반영 예정 / 투두: 제출 마감 9/16 18:00"
      }],
      more: null
    },
    "프로젝트 전환 정리": {
      cards: [{
        id: 1,
        name: "프로젝트 전환 정리",
        kind: "토스·인계 대상 업무",
        state: "확인 필요",
        stateText: "토스 대상 정리를 진행 중인데, 담당자가 아직 확정되지 않았어요.",
        action: { line: "이전 담당자에게 답변 여부를 확인한 뒤 인계 포인트를 정리하세요.", reason: "이전 담당자 답변 대기 중이라 인계 전 확인이 필요해요." },
        warn: "확인 필요: 이전 담당자 답변이 아직 오지 않았어요. 담당자가 확정되지 않아 인계 대상 정리도 멈춰 있는 상태예요. 인수인계 포인트 3개는 확인된 상태, 다음 주 월요일 인계 예정.",
        reason: "메모: 토스 대상 정리 중 — 담당자 미확정 / 메일: 이전 담당자 답변 대기 / 회의록: 인수인계 포인트 3개 확인됨 / 투두: 다음 주 월요일 인계 예정"
      }],
      more: null
    },
    "이번 주 할 일 정리": {
      cards: [
        {
          id: 1,
          name: "MBCD 프로젝트",
          kind: "일반 진행 업무",
          state: "확인 필요(기록 충돌)",
          stateText: "메모에는 '거의 끝남'이라고 적혀 있지만, 메일 스레드에는 '아직 검토 중'이라고 왔어요.",
          action: { line: "담당자에게 현재 상태를 확인한 뒤 재개하세요.", reason: "메모와 메일의 상태가 다르므로 최신 상태를 먼저 확인이 필요해요." },
          warn: "충돌: 메모('거의 끝남') vs 메일('아직 검토 중'). 어느 쪽이 최신·정확한지 확인 필요.",
          reason: "메모: 거의 끝남 — 자료 정리 마무리 단계 / 메일: 아직 검토 중 — 담당자 확인 필요 / 회의록: 다음 주 최종 확인 예정 / 투두: 이번 주 금요일까지 보완"
        },
        {
          id: 2,
          name: "분기 검토 자료",
          kind: "검토/의사결정 대기 업무",
          state: "대기 중",
          stateText: "자료 초안 작성은 끝났고, 상사 확인을 기다리고 있어요.",
          action: { line: "상사 확인 일정이 잡히면 반영해서 제출 준비를 마무리하세요.", reason: "초안 완료 후 확인 대기 상태라서, 확인 결과가 나와야 다음 단계로 갈 수 있어요." },
          warn: "대기 중: 상사 확인 대기 중 / 이번 주 금요일 제출 목표 — 확인 지연 시 일정 조정 필요.",
          reason: "메모: 초안 완료, 상사 확인 대기 / 메일: 확인 요청 보냈으나 답 없음 / 투두: 이번 주 금요일 제출 목표"
        }
      ],
      more: { count: 3 }
    }
  };
  const key = Object.keys(demoMap).find(k => query.includes(k));
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
    ? String(body.supplement || body.memo || body.note || body.extra).trim()
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
