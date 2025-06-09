const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const linkController = require('../controllers/linkController');

// 所有路由都需要认证
router.use(authMiddleware);

// 获取指定收藏夹的所有链接
router.get('/:folderId', linkController.getLinksByFolder);

// 创建新链接
router.post('/', linkController.createLink);

// 更新链接
router.put('/:id', linkController.updateLink);

// 删除链接
router.delete('/:id', linkController.deleteLink);

module.exports = router;