const userController = require("../controllers/userController");
const auth = require("../middleware/auth");
const connectDB = require("../utils/db");
const handleCors = require("../utils/cors");

module.exports = async (req, res) => {
  // 设置 CORS 头
  // 处理 CORS
  if (handleCors(req, res)) return;

  // 连接数据库
  await connectDB();

  if (req.method === "POST" && req.url === "/register") {
    return userController.register(req, res);
  }

  if (req.method === "POST" && req.url === "/login") {
    return userController.login(req, res);
  }

  // 验证用户身份
  await auth(req, res, async () => {
    if (req.method === "GET" && req.url === "/profile") {
      return userController.getProfile(req, res);
    }

    if (req.method === "PUT" && req.url === "/profile") {
      return userController.updateProfile(req, res);
    }

    if (req.method === "PUT" && req.url === "/change-password") {
      return userController.changePassword(req, res);
    }

    res.status(405).json({ message: "Method Not Allowed" });
  });
};