// Vercel 서버리스 함수 진입점
// api/generate.js의 module.exports 핸들러를 사용
const handler = require('./generate');
module.exports = handler;
