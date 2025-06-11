const handleCors = (req, res) => {
  const origin = req.headers.origin; // 获取请求的来源
  const allowedOrigins = ["https://noteproject-frontend.vercel.app/"]; // 允许的来源

  // 检查来源是否被允许
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*"); // 默认允许所有来源
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // 如果是预检请求，直接返回成功
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }

  return false;
};

module.exports = handleCors;