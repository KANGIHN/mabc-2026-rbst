const fs = require('fs');
const path = require('path');

const solarCallPath = path.resolve(__dirname, 'lib/solar-call.js');

let originalContent = null;
try {
  originalContent = fs.readFileSync(solarCallPath, 'utf8');
} catch (e) {
  console.error('원본 solar-call.js를 읽을 수 없습니다:', e && e.message ? e.message : String(e));
  process.exit(1);
}

const mockModule = `async function callSolar(messages, maxTokens) {
  const canned = module.exports.cannedResponse;
  if (canned) return canned;
  return JSON.stringify({ cards: [], more: null });
}

function parseSolarJson(text) {
  if (!text || typeof text !== 'string') return null;
  try { return JSON.parse(text); } catch { return null; }
}

module.exports = { callSolar, parseSolarJson, cannedResponse: null };`;

fs.writeFileSync(solarCallPath, mockModule, 'utf8');

const cases = [
  {
    name: '5장 + more null → more:2 (우리쪽 더 보정)',
    input: { cards: [
      { id:1, name:'A', kind:'x', state:'진행 중', stateText:'y', action:{line:'a',reason:'b'}, warn:'c', reason:'d' },
      { id:2, name:'B', kind:'x', state:'진행 중', stateText:'y', action:{line:'a',reason:'b'}, warn:'c', reason:'d' },
      { id:3, name:'C', kind:'x', state:'진행 중', stateText:'y', action:{line:'a',reason:'b'}, warn:'c', reason:'d' },
      { id:4, name:'D', kind:'x', state:'진행 중', stateText:'y', action:{line:'a',reason:'b'}, warn:'c', reason:'d' },
      { id:5, name:'E', kind:'x', state:'진행 중', stateText:'y', action:{line:'a',reason:'b'}, warn:'c', reason:'d' }
    ], more: null },
    expectMore: { count: 2 }
  },
  {
    name: '2장 + more null → more null 유지',
    input: { cards: [
      { id:1, name:'A', kind:'x', state:'진행 중', stateText:'y', action:{line:'a',reason:'b'}, warn:'c', reason:'d' },
      { id:2, name:'B', kind:'x', state:'진행 중', stateText:'y', action:{line:'a',reason:'b'}, warn:'c', reason:'d' }
    ], more: null },
    expectMore: null
  },
  {
    name: '3장 + more null → more null 유지 (경계값)',
    input: { cards: [
      { id:1, name:'A', kind:'x', state:'진행 중', stateText:'y', action:{line:'a',reason:'b'}, warn:'c', reason:'d' },
      { id:2, name:'B', kind:'x', state:'진행 중', stateText:'y', action:{line:'a',reason:'b'}, warn:'c', reason:'d' },
      { id:3, name:'C', kind:'x', state:'진행 중', stateText:'y', action:{line:'a',reason:'b'}, warn:'c', reason:'d' }
    ], more: null },
    expectMore: null
  },
  {
    name: '4장 + more:1 (솔라 제공 more 우선)',
    input: { cards: [
      { id:1, name:'A', kind:'x', state:'진행 중', stateText:'y', action:{line:'a',reason:'b'}, warn:'c', reason:'d' },
      { id:2, name:'B', kind:'x', state:'진행 중', stateText:'y', action:{line:'a',reason:'b'}, warn:'c', reason:'d' },
      { id:3, name:'C', kind:'x', state:'진행 중', stateText:'y', action:{line:'a',reason:'b'}, warn:'c', reason:'d' },
      { id:4, name:'D', kind:'x', state:'진행 중', stateText:'y', action:{line:'a',reason:'b'}, warn:'c', reason:'d' }
    ], more: { count: 1 } },
    expectMore: { count: 1 }
  },
  {
    name: '6장 + more:2 → more:2 그대로 (솔라 제공 more 우선)',
    input: { cards: [
      { id:1, name:'A', kind:'x', state:'진행 중', stateText:'y', action:{line:'a',reason:'b'}, warn:'c', reason:'d' },
      { id:2, name:'B', kind:'x', state:'진행 중', stateText:'y', action:{line:'a',reason:'b'}, warn:'c', reason:'d' },
      { id:3, name:'C', kind:'x', state:'진행 중', stateText:'y', action:{line:'a',reason:'b'}, warn:'c', reason:'d' },
      { id:4, name:'D', kind:'x', state:'진행 중', stateText:'y', action:{line:'a',reason:'b'}, warn:'c', reason:'d' },
      { id:5, name:'E', kind:'x', state:'진행 중', stateText:'y', action:{line:'a',reason:'b'}, warn:'c', reason:'d' },
      { id:6, name:'F', kind:'x', state:'진행 중', stateText:'y', action:{line:'a',reason:'b'}, warn:'c', reason:'d' }
    ], more: { count: 2 } },
    expectMore: { count: 2 }
  }
];

async function runTests() {
  console.log('=== 더 보정 로직 검증 시작 ===\n');
  const generate = require('./api/generate.js');
  const solarCall = require('./lib/solar-call.js');
  let passed = 0, failed = 0;
  for (const c of cases) {
    console.log('--- ' + c.name + ' ---');
    console.log('입력 cards:', c.input.cards.length, '장, more:', JSON.stringify(c.input.more));
    solarCall.cannedResponse = JSON.stringify(c.input);
    try {
      const result = await generate.handleNormalMode('테스트 쿼리', { query: '테스트 쿼리', supplement: '보충 입력' });
      console.log('결과 cards:', result.data.cards.length, '장');
      console.log('결과 more:', JSON.stringify(result.data.more));
      console.log('기대 more:', JSON.stringify(c.expectMore));
      const ok = JSON.stringify(result.data.more) === JSON.stringify(c.expectMore);
      console.log('일치 여부:', ok ? 'OK' : '다름');
      if (ok) passed++; else { failed++; console.log('  → 실패: 더 보정 로직 재검토 필요'); }
    } catch (e) {
      failed++;
      console.log('오류:', e && e.message ? e.message : String(e));
      console.log('  → 실패: 더 보정 로직 재검토 필요');
    }
    console.log('');
  }
  console.log('=== 결과 요약 ===');
  console.log('통과:', passed, '건 / 실패:', failed, '건');
  if (failed > 0) console.log('→ 더 보정 로직 재검토 필요');
  else console.log('→ 더 보정 로직 검증 완료');
  console.log('=== 검증 스크립트 종료 ===');
}

runTests().catch(e => console.error('스크립트 오류:', e && e.message ? e.message : String(e)))
  .finally(() => {
    if (originalContent !== null) {
      try { fs.writeFileSync(solarCallPath, originalContent, 'utf8'); console.log('lib/solar-call.js 원복 완료'); }
      catch (e) { console.error('원복 중 오류:', e && e.message ? e.message : String(e)); }
    }
  });
