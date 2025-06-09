const mongoose = require("mongoose");
const connectDB = require("../utils/db");
const handleCors = require("../utils/cors");

module.exports = async (req, res) => {
  // 处理 CORS
  if (handleCors(req, res)) return;

  // 连接数据库
  await connectDB();

  if (req.url === "/health") {
    // 健康检查路由
    const dbStatus = {
      connected: mongoose.connection.readyState === 1,
    };
    return res.status(200).json({
      status: "ok",
      message: "Server is healthy",
      dbStatus,
      timestamp: new Date().toISOString(),
    });
  }

  // 根路由
  res.status(200).json({
    status: "ok",
    message: "Welcome to the API",
    version: "1.0.0",
  });
};