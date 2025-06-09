/**
 * 书签链接模型文件
 * 负责定义书签链接的数据结构和关联关系
 */

const mongoose = require('mongoose');

// 定义书签链接模型结构
const linkSchema = new mongoose.Schema({
  // 关联的文件夹ID
  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    required: true
  },
  // 书签标题
  title: {
    type: String,
    required: true,
    trim: true
  },
  // 书签URL
  url: {
    type: String,
    required: false,
    trim: true
  },
  // 书签备注
  note: {
    type: String,
    trim: true
  }
}, {
  // 自动添加创建和更新时间戳
  timestamps: true
});

/**
 * 使用指南：
 * 1. 创建书签：
 *    const link = new Link({ folderId, title, url, note });
 *    await link.save();
 * 
 * 2. 查询文件夹的所有书签：
 *    const links = await Link.find({ folderId });
 * 
 * 3. 更新书签信息：
 *    link.title = newTitle;
 *    await link.save();
 * 
 * 注意事项：
 * - 每个书签必须关联到一个文件夹
 * - 书签标题和URL是必需的
 * - 使用前确保已连接数据库
 * - URL应该进行有效性验证
 */

module.exports = mongoose.model('Link', linkSchema); 