const Folder = require("../models/Folder");

// 获取用户的所有收藏夹
const getFolders = async (req, res) => {
  try {
    // 检查用户是否已通过身份验证
    if (!req.user || !req.user._id) {
      console.error("Authentication failed: req.user is missing or invalid");
      return res.status(401).json({ message: "用户未通过身份验证" });
    }

    // 获取用户的所有收藏夹
    const folders = await Folder.find({ userId: req.user._id }).select("name description");
    res.status(200).json(folders);
  } catch (error) {
    console.error("Error fetching folders for user ID:", req.user._id, error);
    res.status(500).json({ message: "获取收藏夹失败", error: error.message });
  }
};

// 获取单个收藏夹
const getFolderById = async (req, res) => {
  try {
    // 检查用户是否已通过身份验证
    if (!req.user || !req.user._id) {
      console.error("Authentication failed: req.user is missing or invalid");
      return res.status(401).json({ message: "用户未通过身份验证" });
    }

    // 查找收藏夹
    const folder = await Folder.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).select("name description");

    if (!folder) {
      console.error(`Folder not found or unauthorized access: Folder ID ${req.params.id}`);
      return res.status(404).json({ message: "收藏夹不存在或无权访问" });
    }

    res.status(200).json(folder);
  } catch (error) {
    console.error("Error fetching folder ID:", req.params.id, error);
    res.status(500).json({ message: "获取收藏夹失败", error: error.message });
  }
};

// 创建收藏夹
const createFolder = async (req, res) => {
  try {
    // 检查用户是否已通过身份验证
    if (!req.user || !req.user._id) {
      console.error("Authentication failed: req.user is missing or invalid");
      return res.status(401).json({ message: "用户未通过身份验证" });
    }

    const { name, description } = req.body;

    // 检查是否存在同名的收藏夹
    const existingFolder = await Folder.findOne({
      userId: req.user._id,
      name,
    }).select("_id");

    if (existingFolder) {
      console.error(`Duplicate folder name: ${name}`);
      return res.status(400).json({ message: "已存在同名的收藏夹，请更换名称" });
    }

    // 创建新收藏夹
    const folder = new Folder({
      userId: req.user._id,
      name,
      description,
    });

    await folder.save();
    res.status(201).json(folder);
  } catch (error) {
    console.error("Error creating folder for user ID:", req.user._id, error);
    res.status(500).json({ message: "创建收藏夹失败", error: error.message });
  }
};

// 更新收藏夹
const updateFolder = async (req, res) => {
  try {
    // 检查用户是否已通过身份验证
    if (!req.user || !req.user._id) {
      console.error("Authentication failed: req.user is missing or invalid");
      return res.status(401).json({ message: "用户未通过身份验证" });
    }

    const { name, description } = req.body;

    // 检查是否存在同名的收藏夹（排除当前正在编辑的收藏夹）
    const existingFolder = await Folder.findOne({
      userId: req.user._id,
      name,
      _id: { $ne: req.params.id }, // 排除当前正在编辑的收藏夹
    }).select("_id");

    if (existingFolder) {
      console.error(`Duplicate folder name: ${name}`);
      return res.status(400).json({ message: "已存在同名的收藏夹，请更换名称" });
    }

    // 查找当前收藏夹
    const folder = await Folder.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!folder) {
      console.error(`Folder not found or unauthorized access: Folder ID ${req.params.id}`);
      return res.status(404).json({ message: "收藏夹不存在或无权访问" });
    }

    // 更新收藏夹信息
    folder.name = name || folder.name;
    folder.description = description || folder.description;
    folder.updatedAt = new Date();
    await folder.save();

    res.status(200).json(folder);
  } catch (error) {
    console.error("Error updating folder ID:", req.params.id, error);
    res.status(500).json({ message: "更新收藏夹失败", error: error.message });
  }
};

// 删除收藏夹
const deleteFolder = async (req, res) => {
  try {
    // 检查用户是否已通过身份验证
    if (!req.user || !req.user._id) {
      console.error("Authentication failed: req.user is missing or invalid");
      return res.status(401).json({ message: "用户未通过身份验证" });
    }

    // 查找收藏夹
    const folder = await Folder.findOne({
      _id: req.params.id,
      userId: req.user._id, // 确保收藏夹属于当前用户
    }).select("_id");

    if (!folder) {
      console.error(`Folder not found or unauthorized access: Folder ID ${req.params.id}`);
      return res.status(404).json({ message: "收藏夹不存在或无权访问" });
    }

    // 删除收藏夹
    await folder.deleteOne();
    res.status(200).json({ message: "收藏夹已删除" });
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