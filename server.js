const express = require("express");
const connectDB = require("./utils/db");
const userRoutes = require("./routes/userRoutes");
const foldersRoutes = require("./routes/foldersRoutes");
const linksRoutes = require("./routes/linksRoutes");
const cors = require("cors");
require("dotenv").config();

const app = express();

// 日志中间件：记录每个进入服务器的请求方法和路径
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
  });

// CORS 配置
app.use(cors({
  origin: ["http://localhost:5173"], // 替换为前端的实际地址
  credentials: true,
}));

// 中间件
app.use(express.json());

// 路由
app.use("/api/users", userRoutes);
app.use("/api/folders", foldersRoutes);
app.use("/api/links", linksRoutes);

// 健康检查路由
app.get("/health", (req, res) => {
  const dbStatus = {
    connected: require("mongoose").connection.readyState === 1,
  };
  res.status(200).json({
    status: "ok",
    message: "Server is healthy",
    dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// 根路由
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Welcome to the API",
    version: "1.0.0",
  });
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({
    message: "服务器内部错误",
    error: err.message,
    timestamp: new Date().toISOString(),
  });
});

// 启动服务器
const startServer = async () => {
  try {
    await connectDB(); // 确保数据库连接成功
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1); // 退出进程
  }
};

startServer();