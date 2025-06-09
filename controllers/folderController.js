const Folder = require("../models/Folder");


// 获取用户的所有收藏夹
const getFolders = async (req, res) => {
  try {
    const folders = await Folder.find({ userId: req.user._id });
    res.json(folders);
  } catch (error) {
    console.error("Error getting folders:", error.message);
    res.status(500).json({ message: "获取收藏夹失败", error: error.message });
  }
};
// 获取单个收藏夹
const getFolderById = async (req, res) => {
  try {
    const folder = await Folder.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!folder) {
      return res.status(404).json({ message: "收藏夹不存在或无权访问" });
    }

    res.json(folder);
  } catch (error) {
    console.error("Error getting folder ID:", req.params.id, error);
    res.status(500).json({ message: "获取收藏夹失败", error: error.message });
  }
};
// 创建新收藏夹
const createFolder = async (req, res) => {
  try {
    const { name, description } = req.body;

    // 检查是否存在同名的收藏夹
    const existingFolder = await Folder.findOne({
      userId: req.user._id,
      name,
    });

    if (existingFolder) {
      return res.status(400).json({ message: "已存在同名的收藏夹，请更换名称" });
    }
    const folder = new Folder({
      userId: req.user._id,
      name,
      description,
    });

    await folder.save();
    res.status(201).json(folder);
  } catch (error) {
    console.error("Error creating folder:", error.message);
    res.status(500).json({ message: "创建收藏夹失败", error: error.message });
  }
};
// 更新收藏夹
const updateFolder = async (req, res) => {
  try {
    const { name, description } = req.body;

    // 检查是否存在同名的收藏夹（排除当前正在编辑的收藏夹）
    const existingFolder = await Folder.findOne({
      userId: req.user._id,
      name,
      _id: { $ne: req.params.id }, // 排除当前正在编辑的收藏夹
    });

    if (existingFolder) {
      return res.status(400).json({ message: "已存在同名的收藏夹，请更换名称" });
    }

    const folder = await Folder.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!folder) {
      return res.status(404).json({ message: "收藏夹不存在或无权访问" });
    }

    folder.name = name || folder.name;
    folder.description = description || folder.description;
    folder.updatedAt = new Date();
    await folder.save();
    res.json(folder);
  } catch (error) {
    console.error("Error updating folder ID:", req.params.id, error);
    res.status(500).json({ message: "更新收藏夹失败", error: error.message });
  }
};
// 删除收藏夹
const deleteFolder = async (req, res) => {
  try {
    if (req.isTestUser) {
      const folderIndex = testFolders.findIndex((f) => f._id === req.params.id);
      if (folderIndex === -1) {
        return res.status(404).json({ message: "收藏夹不存在" });
      }

      testFolders.splice(folderIndex, 1);
      return res.json({ message: "收藏夹已删除" });
    }

    const folder = await Folder.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!folder) {
      return res.status(404).json({ message: "收藏夹不存在或无权访问" });
    }

    await folder.deleteOne();
    res.json({ message: "收藏夹已删除" });
  } catch (error) {
    console.error("Error deleting folder ID:", req.params.id, error);
    res.status(500).json({ message: "删除收藏夹失败", error: error.message });
  }
};

module.exports = {
  getFolders,
  getFolderById,
  createFolder,
  updateFolder,
  deleteFolder,
};

