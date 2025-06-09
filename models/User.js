/**
 * 用户模型文件
 * 负责定义用户数据结构、密码加密和验证方法
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 定义用户模型结构
const userSchema = new mongoose.Schema({
  // 用户名字段
  username: {
    type: String,
    required: [true, '用户名是必需的'],
    trim: true,
    minlength: [3, '用户名至少需要3个字符'],
    maxlength: [20, '用户名不能超过20个字符'],
    unique: true
  },
  // 邮箱字段
  email: {
    type: String,
    required: [true, '邮箱是必需的'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '请提供有效的邮箱地址']
  },
  // 密码字段
  password: {
    type: String,
    required: [true, '密码是必需的'],
    minlength: [6, '密码至少需要6个字符']
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
}, {
  // 自动添加创建和更新时间戳
  timestamps: true
});

/**
 * 密码加密中间件
 * 在保存用户数据前自动加密密码
 */
userSchema.pre('save', async function(next) {
  try {
    // 只有在密码被修改时才重新加密
    if (!this.isModified('password')) return next();
    
    // 生成盐值并加密密码
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * 密码验证方法
 * @param {string} candidatePassword - 待验证的密码
 * @returns {Promise<boolean>} - 密码是否匹配
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('密码比较失败');
  }
};

// 在返回用户数据时去除密码
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

/**
 * 使用指南：
 * 1. 创建用户：
 *    const user = new User({ username, email, password });
 *    await user.save();
 * 
 * 2. 验证密码：
 *    const isValid = await user.comparePassword(password);
 * 
 * 3. 更新用户信息：
 *    user.username = newUsername;
 *    await user.save();
 * 
 * 注意事项：
 * - 密码会自动加密存储
 * - 用户名和邮箱必须唯一
 * - 所有字段都有验证规则
 * - 使用前确保已连接数据库
 */

const User = mongoose.model('User', userSchema);
module.exports = User; 