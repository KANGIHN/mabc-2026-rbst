module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  return res.status(200).json({
    ok: true,
    message: "테스트 API 동작 중",
    envUpstageKeyPresent: !!process.env.UPSTAGE_API_KEY,
    nodeVersion: process.version
  });
};
