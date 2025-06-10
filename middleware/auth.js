const jwt = require("jsonwebtoken");
const User = require("../models/User");
const mongoose = require("mongoose");

/**
 * 认证中间件
 * 验证请求头中的 JWT token
 * 将用户信息添加到请求对象中
 */
const auth = async (req, res, next) => {
  try {
    // 从请求头获取 token
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      console.error("Authentication failed: No token provided");
      return res.status(401).json({
        message: "未提供认证令牌",
        timestamp: new Date().toISOString(),
      });
    }

    // 验证 token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      console.error("Authentication failed: Invalid token", error.message);
      return res.status(401).json({
        message: "无效的认证令牌",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }

    if (!decoded || !decoded.userId) {
      console.error("Authentication failed: Decoded token missing userId");
      return res.status(401).json({
        message: "无效的认证令牌",
        timestamp: new Date().toISOString(),
      });
    }

    // 检查数据库连接状态
    if (mongoose.connection.readyState !== 1) {
      console.error("Database connection failed");
      return res.status(503).json({
        message: "数据库连接失败，请稍后再试",
        db_status: "disconnected",
        timestamp: new Date().toISOString(),
      });
    }

    // 查找用户
    const user = await User.findById(decoded.userId);
    if (!user) {
      console.error(`Authentication failed: User not found (userId: ${decoded.userId})`);
      return res.status(401).json({
        message: "用户不存在",
        timestamp: new Date().toISOString(),
      });
    }

    // 将用户信息添加到请求对象
    req.user = user;
    req.token = token;

    next(); // 继续处理请求
  } catch (error) {
    console.error("Authentication failed:", error.message);
    res.status(401).json({
      message: "认证失败",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

module.exports = auth;