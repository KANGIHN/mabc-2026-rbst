// solar-call.js — Solar Pro 4 호출 + JSON 파싱 (generate.js에서 분리)
// 환경: Vercel 서버리스 함수가 아니라, 개발/테스트용 직접 호출 모듈
// 실제 서비스 런타임에서는 /api/generate.js의 callSolar을 그대로 씀(동일 구현)

async function callSolar(messages, maxTokens = 2048) {
  const key = process.env.SOLAR_API_KEY;
  if (!key) {
    const msg = "SOLAR_API_KEY가 설정되지 않았어요.";
    console.error("[callSolar] " + msg);
    throw new Error(msg);
  }
  const res = await fetch("https://api.upstage.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + key,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "solar-pro4",
      messages: messages,
      max_tokens: maxTokens,
      temperature: 0.4
    })
  });
  if (!res.ok) {
    let detail = "";
    try { detail = await res.text(); } catch { detail = "응답 읽기 실패"; }
    const snippet = (detail || "").slice(0, 300);
    throw new Error("Solar API 응답 오류 " + res.status + ": " + snippet);
  }
  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Solar 응답에 content가 없어요: " + JSON.stringify(json).slice(0, 300));
  }
  return content;
}

function parseSolarJson(text) {
  if (!text || typeof text !== "string") return null;
  let s = text.trim();
  const blockMatch = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (blockMatch) s = blockMatch[1].trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  s = s.slice(start, end + 1);
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

module.exports = { callSolar, parseSolarJson };
