const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const folderController = require('../controllers/folderController');

// 应用认证中间件到所有路由
router.use(auth);

// 获取所有收藏夹
router.get('/', folderController.getFolders);

// 获取单个收藏夹
router.get('/:id', folderController.getFolderById);

// 创建收藏夹
router.post('/', folderController.createFolder);

// 更新收藏夹
router.put('/:id', folderController.updateFolder);

// 删除收藏夹
router.delete('/:id', folderController.deleteFolder);

module.exports = router;