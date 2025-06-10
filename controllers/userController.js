const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const crypto = require('crypto');

/**
 * 用户注册
 */
const register = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        message: '数据库连接失败，无法注册新用户。请稍后再试或联系管理员。',
        db_status: 'disconnected'
      });
    }

    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: '用户名或邮箱已被注册' });
    }

    const user = new User({
      username,
      email,
      password
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback_jwt_secret_for_development',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: '注册成功',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: '注册失败', error: error.message });
  }
};

/**
 * 用户登录
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 检查邮箱和密码是否提供
    if (!email || !password) {
      return res.status(400).json({ message: "邮箱和密码是必填项" });
    }

    // 检查数据库连接状态
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        message: "数据库连接失败，请稍后再试。",
        db_status: "disconnected"
      });
    }

    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "邮箱或密码错误" });
    }

    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "邮箱或密码错误" });
    }

    // 生成 JWT Token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET, // 强制使用环境变量中的 JWT_SECRET
      { expiresIn: "7d" }
    );

    // 返回成功响应
    res.json({
      message: "登录成功",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error("登录失败:", error);
    res.status(500).json({ message: "登录失败", error: error.message });
  }
};

/**
 * 获取用户资料
 */
const getProfile = async (req, res) => {
  try {
    if (req.user && req.user._id === 'test_user_id') {
      return res.json({
        _id: 'test_user_id',
        username: '测试用户',
        email: 'test@example.com'
      });
    }

    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: '获取用户资料失败', error: error.message });
  }
};

/**
 * 更新用户资料
 */
const updateProfile = async (req, res) => {
  try {
    if (req.user && req.user._id === 'test_user_id') {
      return res.status(403).json({ message: '测试账户无法更新个人资料' });
    }

    const { username, email } = req.body;

    if (email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: '该邮箱已被使用' });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { username, email },
      { new: true }
    ).select('-password');

    res.json({
      message: '资料更新成功',
      user
    });
  } catch (error) {
    res.status(500).json({ message: '更新资料失败', error: error.message });
  }
};

/**
 * 修改密码
 */
const changePassword = async (req, res) => {
  try {
    if (req.user && req.user._id === 'test_user_id') {
      return res.status(403).json({ message: '测试账户无法修改密码' });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: '当前密码错误' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: '密码修改成功' });
  } catch (error) {
    res.status(500).json({ message: '修改密码失败', error: error.message });
  }
};

/**
 * 忘记密码
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({ message: '如果邮箱存在，密码重置链接已发送到您的邮箱' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 3600000;

    await user.save();

    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
    console.log('重置密码链接: ', resetUrl);

    res.status(200).json({ message: '如果邮箱存在，密码重置链接已发送到您的邮箱' });
  } catch (error) {
    console.error('忘记密码错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

/**
 * 重置密码
 */
const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: '无效或已过期的重置链接' });
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    res.status(200).json({ message: '密码已成功重置' });
  } catch (error) {
    console.error('重置密码错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
};