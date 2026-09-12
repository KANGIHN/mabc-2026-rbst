모듈.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "POST만 지원" });

  let body;
  try { body = JSON.parse(req.body || "{}"); }
  catch { return res.status(400).json({ ok: false, error: "잘못된 요청" }); }

  const query = (body && body.query && String(body.query).trim()) || "";
  const isDemo = !!body.isDemo;

  if (!query) {
    return res.status(200).json({
      ok: false,
      failure: false,
      data: { cards: [], more: null }
    });
  }

  const apiKey = process.env.UPSTAGE_API_KEY;
  const result = await buildResumeCard(query, apiKey, isDemo);
  return res.status(200).json(result);
};

async function buildResumeCard(query, apiKey, isDemo) {
  if (isDemo) {
    return buildDemoResult(query);
  }
  if (!apiKey) {
    return {
      ok: false,
      failure: false,
      data: {
        cards: [],
        more: null,
        note: "연결된 도구에서 관련 기록을 찾지 못했어요. 최근 메모·요약·키워드를 알려주시면 그 기준으로 잡아볼게요. 아니면 데모 예시로 체험해 볼 수 있어요."
      }
    };
  }

  try {
    const prompt = `
당신은 업무 재개 카드 생성기예요. 사용자의 입력(질문/태그/키워드)과, 관련 기록이 있으면 그걸 바탕으로 업무 재개 카드 한 장을 만들어줘요.

출력은 반드시 아래 JSON 형식으로만 해줘요. 다른 텍스트는 절대 넣지 마요.
{
  "cards":[{
    "id":1,
    "name":"<업무명>",
    "kind":"<일반 진행 업무/검토/의사결정 대기 업무/기한형 업무/토스·인계 대상 업무 등>",
    "state":"<진행 중/대기 중/완료/확인 필요/확인 필요(기록 충돌) 중 하나>",
    "stateText":"<현재 상태 설명 1~2문장>",
    "action":{"line":"<첫 행동 1개>","reason":"<근거 1줄>"},
    "warn":"<주의사항(기한/리스크/대기/충돌/토스·인계 포인트)>",
    "reason":"<상세 근거(펼침용, 없으면 생략 가능)>"
  }],
  "more": null
}

규칙:
- 업무 하나에만 집중해서 카드 1장을 만들어줘요.
- 상태는 진행 중/대기 중/완료/확인 필요/확인 필요(기록 충돌) 중 하나로만 정해줘요.
- 첫 행동에는 근거를 1줄 붙여줘요.
- 확실하지 않으면 확정처럼 말하지 말고 [추정]/[확인 필요]로 표시해요.
- 충돌되면 하나로 덮지 말고 모두 보여줘요.
- 마감/리스크/대기가 있으면 주의사항에 넣어요.
- 민감정보(주민등록번호 등)는 절대 넣지 마요. 이름/연락처/메일주소도 업무상 필요한 범위만.
- 예시는 필요 없고, 실제 입력만 보고 만들어줘요.

입력: "${query}"
`;
    const response = await fetch("https://api.aimlapi.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "upstage/solar-pro4",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1024,
        temperature: 0.2
      })
    });

    if (!response.ok) {
      return {
        ok: false,
        failure: true,
        data: { cards: [], more: null, message: "기록을 불러오는 중 문제가 있었어요. 잠시 후 다시 시도해 주세요." }
      };
    }

    const json = await response.json();
    const content = ((json?.choices?.[0]?.message?.content) || "").trim();
    const parsed = safeParseJson(content);
    if (!parsed || !Array.isArray(parsed.cards)) {
      return {
        ok: false,
        failure: true,
        data: { cards: [], more: null, message: "기록을 불러오는 중 문제가 있었어요. 잠시 후 다시 시도해 주세요." }
      };
    }
    return { ok: true, data: parsed, failure: false };
  } catch (err) {
    return {
      ok: false,
      failure: true,
      data: { cards: [], more: null, message: "기록을 불러오는 중 문제가 있었어요. 잠시 후 다시 시도해 주세요." }
    };
  }
}

function buildDemoResult(query) {
  const demoMap = {
    "MBCD 프로젝트": {
      cards: [{
        id: 1,
        name: "MBCD 프로젝트",
        kind: "일반 진행 업무",
        state: "확인 필요(기록 충돌)",
        stateText: "메모에는 '거의 끝남'이라고 적혀 있지만, 메일 스레드에는 '아직 검토 중'이라고 왔어요.",
        action: { line: "담당자에게 현재 상태를 확인한 뒤 재개하세요.", reason: "메모와 메일의 상태가 다르므로 최신 상태를 먼저 확인이 필요해요." },
        warn: "충돌: 메모(거의 끝남) vs 메일(아직 검토 중) — 둘 중 어느 쪽이 최신/정확한지 확인 필요. 담당자를 알 수 있으면 담당자에게 확인, 없으면 어느 쪽 기록이 최신인지 확인.",
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
        action: { line: "피드백이 오면 반영해서 제출 준비를 마무리하세요.", reason: "초안 완료 + 제출 마감 전이므로 대기 중인 피드백을 반영하면 돼요." },
        warn: "대기 중: 자료 검토 요청 보냈으나 답 없음 / 제출 마감 9/16 18:00 — 지연 시 후속 일정 영향 가능.",
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
        warn: "대기 중: 이전 담당자 답변 대기 / 담당자 미확정 — 확인 필요. 인수인계 포인트 3개 확인됨, 다음 주 월요일 인계 예정.",
        reason: "메모: 토스 대상 정리 중 — 담당자 미확정 / 메일: 이전 담당자 답변 대기 / 회의록: 인수인계 포인트 3개 확인됨 / 투두: 다음 주 월요일 인계 예정"
      }],
      more: null
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
          warn: "기록 없음: 연결된 도구에서 관련 기록을 찾지 못했어요. 최근 메모·요약·키워드를 알려주시면 그 기준으로 잡아볼게요.",
          reason: "데모 예시: 실제 연동 환경이 아닌 경우, 예시 데이터로 카드 생성 흐름을 보여줘요."
        }],
        more: null
      };
    }
  }
  return { ok: true, data: demoMap[key], failure: false };
}

function safeParseJson(content) {
  let s = content;
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start < 0 || end < start) return null;
  s = s.slice(start, end + 1);
  try { return JSON.parse(s); }
  catch { return null; }
}
