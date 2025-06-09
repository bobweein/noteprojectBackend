const linkController = require("../controllers/linkController");
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
    if (req.method === "GET") {
      const folderId = req.url.split("/")[1];
      return linkController.getLinksByFolder({ ...req, params: { folderId } }, res);
    }

    if (req.method === "POST") {
      return linkController.createLink(req, res);
    }

    if (req.method === "PUT") {
      const linkId = req.url.split("/")[1];
      return linkController.updateLink({ ...req, params: { id: linkId } }, res);
    }

    if (req.method === "DELETE") {
      const linkId = req.url.split("/")[1];
      return linkController.deleteLink({ ...req, params: { id: linkId } }, res);
    }

    res.status(405).json({ message: "Method Not Allowed" });
  });
};