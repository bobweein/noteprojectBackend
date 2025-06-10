const folderController = require("../controllers/folderController");
const linkController = require("../controllers/linkController");
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");
const connectDB = require("../utils/db");
const handleCors = require("../utils/cors");

module.exports = async (req, res) => {
  // Handle CORS
  if (handleCors(req, res)) return;

  // Connect to the database
  await connectDB();

  // Extract the base path and subpath
  const urlParts = req.url.split("?")[0].split("/").filter(Boolean);
  const basePath = urlParts[0] || ""; // 主路径，例如 "folders"
  const subPath = urlParts[1] || "";  // 子路径，例如 "123"

  console.log("Base path:", basePath, "Sub path:", subPath); // 添加日志以调试
    // Route: /api/folders
  if (basePath === "folders") {
    await auth(req, res, async () => {
      if (req.method === "GET" && !subPath) {
        // Get all folders
        return folderController.getFolders(req, res);
      }

      if (req.method === "GET" && subPath) {
        // Get a single folder
        return folderController.getFolderById({ ...req, params: { id: subPath } }, res);
      }

      if (req.method === "POST" && !subPath) {
        // Create a folder
        return folderController.createFolder(req, res);
      }

      if (req.method === "PUT" && subPath) {
        // Update a folder
        return folderController.updateFolder({ ...req, params: { id: subPath } }, res);
      }

      if (req.method === "DELETE" && subPath) {
        // Delete a folder
        return folderController.deleteFolder({ ...req, params: { id: subPath } }, res);
      }

      res.status(405).json({ message: "Method Not Allowed" });
    });
    return;
  }

  // Route: /api/links
  if (basePath === "links") {
    await auth(req, res, async () => {
      if (req.method === "GET" && subPath) {
        // Get links by folder
        return linkController.getLinksByFolder({ ...req, params: { folderId: subPath } }, res);
      }

      if (req.method === "POST" && !subPath) {
        // Create a link
        return linkController.createLink(req, res);
      }

      if (req.method === "PUT" && subPath) {
        // Update a link
        return linkController.updateLink({ ...req, params: { id: subPath } }, res);
      }

      if (req.method === "DELETE" && subPath) {
        // Delete a link
        return linkController.deleteLink({ ...req, params: { id: subPath } }, res);
      }

      res.status(405).json({ message: "Method Not Allowed" });
    });
    return;
  }

  // Route: /api/users
  if (basePath === "users") {
    if (req.method === "POST" && subPath === "register") {
      // Register a user
      return userController.register(req, res);
    }

    if (req.method === "POST" && subPath === "login") {
      // Login a user
      return userController.login(req, res);
    }

    await auth(req, res, async () => {
      if (req.method === "GET" && subPath === "profile") {
        // Get user profile
        return userController.getProfile(req, res);
      }

      if (req.method === "PUT" && subPath === "profile") {
        // Update user profile
        return userController.updateProfile(req, res);
      }

      if (req.method === "PUT" && subPath === "change-password") {
        // Change user password
        return userController.changePassword(req, res);
      }

      res.status(405).json({ message: "Method Not Allowed" });
    });
    return;
  }

  // Health check route
  if (req.url === "/health") {
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

  // Root route
  if (!basePath) {
    return res.status(200).json({
      status: "ok",
      message: "Welcome to the API",
      version: "1.0.0",
    });
  }

  // If no route matches, return 404
  res.status(404).json({ message: "Not Found" });
};