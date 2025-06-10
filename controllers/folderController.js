const Folder = require("../models/Folder");


// 获取用户的所有收藏夹
const updateFolder = async (req, res) => {
  try {
    // 检查用户是否已通过身份验证
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "用户未通过身份验证" });
    }

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

    // 查找当前收藏夹
    const folder = await Folder.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!folder) {
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
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "用户未通过身份验证" });
    }
    const folder = await Folder.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!folder) {
      return res.status(404).json({ message: "收藏夹不存在或无权访问" });
    }

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

