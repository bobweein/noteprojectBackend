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
    if (req.method === "GET" && req.url === "/") {
      return folderController.getAllFolders(req, res);
    }

    if (req.method === "GET") {
      const folderId = req.url.split("/")[1];
      return folderController.getFolderById({ ...req, params: { id: folderId } }, res);
    }

    if (req.method === "POST") {
      return folderController.createFolder(req, res);
    }

    if (req.method === "PUT") {
      const folderId = req.url.split("/")[1];
      return folderController.updateFolder({ ...req, params: { id: folderId } }, res);
    }

    if (req.method === "DELETE") {
      const folderId = req.url.split("/")[1];
      return folderController.deleteFolder({ ...req, params: { id: folderId } }, res);
    }

    res.status(405).json({ message: "Method Not Allowed" });
  });
};