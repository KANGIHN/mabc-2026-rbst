module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  if (req.method === "OPTIONS") return res.status(204).end();
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

  // реальный Solar 호출은 이후 단계에서 재개
  return res.status(200).json({
    ok: false,
    failure: false,
    data: { cards: [], more: null },
    note: "연결된 도구에서 관련 기록을 찾지 못했어요. 최근 메모·요약·키워드를 알려주시면 그 기준으로 잡아볼게요."
  });
};

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
      }
    };
  }
  return { ok: true, data: demoMap[key], failure: false };
}
