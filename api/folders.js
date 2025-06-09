const folderController = require("../controllers/folderController");
const auth = require("../middleware/auth");
const connectDB = require("../utils/db");
const handleCors = require("../utils/cors");

module.exports = async (req, res) => {
  // 处理 CORS
  if (handleCors(req, res)) return;

  // 连接数据库
  await connectDB();

  // 验证用户身份
  await auth(req, res, async () => {

    const urlParts = req.url.split("?")[0]; // 去掉查询参数

    if (req.method === "GET" && urlParts === "/") {
      // 获取所有收藏夹
      return folderController.getFolders(req, res);
    }

    if (req.method === "GET") {
      // 获取单个收藏夹
      const folderId = urlParts.split("/")[1];
      return folderController.getFolderById({ ...req, params: { id: folderId } }, res);
    }

    if (req.method === "POST" && urlParts === "/") {
      // 创建新收藏夹
      return folderController.createFolder(req, res);
    }

    if (req.method === "PUT" && urlParts.startsWith("/")) {
      // 更新收藏夹
      const folderId = urlParts.split("/")[1];
      return folderController.updateFolder({ ...req, params: { id: folderId } }, res);
    }

    if (req.method === "DELETE" && urlParts.startsWith("/")) {
      // 删除收藏夹
      const folderId = urlParts.split("/")[1];
      return folderController.deleteFolder({ ...req, params: { id: folderId } }, res);
    }

    // 如果请求方法不被支持
    res.status(405).json({ message: "Method Not Allowed" });
  });
};