/**
 * 文件夹模型文件
 * 负责定义书签文件夹的数据结构和关联关系
 */

const mongoose = require('mongoose');

// 定义文件夹模型结构
const folderSchema = new mongoose.Schema({
  // 关联的用户ID
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // 文件夹名称
  name: {
    type: String,
    required: true,
    trim: true
  },
  // 文件夹描述
  description: {
    type: String,
    trim: true
  }
}, {
  // 自动添加创建和更新时间戳
  timestamps: true
});

// 创建联合唯一索引：同一用户不能有同名文件夹
folderSchema.index({ userId: 1, name: 1 }, { unique: true });
/**
 * 使用指南：
 * 1. 创建文件夹：
 *    const folder = new Folder({ userId, name, description });
 *    await folder.save();
 * 
 * 2. 查询用户的所有文件夹：
 *    const folders = await Folder.find({ userId });
 * 
 * 3. 更新文件夹信息：
 *    folder.name = newName;
 *    await folder.save();
 * 
 * 注意事项：
 * - 每个文件夹必须关联到一个用户
 * - 文件夹名称是必需的
 * - 使用前确保已连接数据库
 * - 删除文件夹时注意处理关联的书签
 */

module.exports = mongoose.model('Folder', folderSchema); 