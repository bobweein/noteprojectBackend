const Folder = require('../models/Folder');

// 获取所有收藏夹
const getAllFolders = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ 
        message: '用户未认证或用户ID不存在',
        timestamp: new Date().toISOString()
      });
    }

    const folders = await Folder.find({ userId: req.user._id });

    const validFolders = folders.filter(folder => 
      folder && 
      folder.name && 
      typeof folder.name === 'string' && 
      folder.name.trim() !== ''
    );

    res.json(validFolders);
  } catch (error) {
    console.error('Error getting folders for user:', req.user?._id, error);
    res.status(500).json({ 
      message: '获取收藏夹失败',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// 获取单个收藏夹
const getFolderById = async (req, res) => {
  try {
    const folder = await Folder.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!folder) {
      return res.status(404).json({ message: '收藏夹不存在或无权访问' });
    }

    res.json(folder);
  } catch (error) {
    console.error('Error getting folder details for ID:', req.params.id, error);
    res.status(500).json({ message: '获取收藏夹失败', error: error.message });
  }
};

// 创建收藏夹
const createFolder = async (req, res) => {
  try {
    const { name, description } = req.body;

    const existing = await Folder.findOne({
      name: name.trim(),
      userId: req.user._id
    });

    if (existing) {
      return res.status(400).json({ message: '当前用户已存在同名收藏夹' });
    }

    const folder = new Folder({
      userId: req.user._id,
      name,
      description
    });

    await folder.save();
    res.status(201).json(folder);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: '当前用户已存在同名收藏夹（唯一索引冲突）' });
    }
    console.error('Error creating folder for user:', req.user?._id, error);
    res.status(500).json({ message: '创建收藏夹失败', error: error.message });
  }
};

// 更新收藏夹
const updateFolder = async (req, res) => {
  try {
    const { name, description } = req.body;

    const existing = await Folder.findOne({
      name: name.trim(),
      userId: req.user._id,
      _id: { $ne: req.params.id }
    });

    if (existing) {
      return res.status(400).json({ message: '当前用户已存在同名收藏夹' });
    }

    const folder = await Folder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { name, description },
      { new: true }
    );

    if (!folder) {
      return res.status(404).json({ message: '收藏夹不存在' });
    }

    res.json(folder);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: '更新失败：该名称已存在（唯一索引冲突）' });
    }
    console.error('Error updating folder ID:', req.params.id, error);
    res.status(500).json({ message: '更新收藏夹失败', error: error.message });
  }
};

// 删除收藏夹
const deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!folder) {
      return res.status(404).json({ message: '收藏夹不存在' });
    }

    res.json({ message: '收藏夹已删除' });
  } catch (error) {
    console.error('Error deleting folder ID:', req.params.id, error);
    res.status(500).json({ message: '删除收藏夹失败', error: error.message });
  }
};

module.exports = {
  getAllFolders,
  getFolderById,
  createFolder,
  updateFolder,
  deleteFolder
};