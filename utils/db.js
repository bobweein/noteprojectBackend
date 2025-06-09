const mongoose = require("mongoose");

let isConnected = false; // 用于复用数据库连接

const connectDB = async () => {
  if (isConnected) return; // 如果已经连接，直接返回

  const mongoUri = process.env.MONGODB_URI; // 从环境变量中读取连接字符串
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not defined in the environment variables");
  }

  try {
    const db = await mongoose.connect(mongoUri);
    isConnected = db.connections[0].readyState === 1; // 检查连接状态
    console.log("Connected to MongoDB!");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    throw err;
  }
};

module.exports = connectDB;