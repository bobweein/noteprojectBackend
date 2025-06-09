const Link = require('../models/Link');
const Folder = require('../models/Folder');

// 获取指定收藏夹的所有链接
const getLinksByFolder = async (req, res) => {
  try {
    if (req.isTestUser) {
      const testFolder = testFolders.find(f => f._id === req.params.folderId);
      if (!testFolder) {
        return res.status(404).json({ message: '收藏夹不存在或无权访问' });
      }
      const folderLinks = testLinks.filter(link => link.folderId === req.params.folderId);
      return res.json(folderLinks);
    }

    const folder = await Folder.findOne({
      _id: req.params.folderId,
      userId: req.user._id
    });

    if (!folder) {
      return res.status(404).json({ message: '收藏夹不存在或无权访问' });
    }

    const links = await Link.find({ folderId: req.params.folderId });
    res.json(links);
  } catch (error) {
    console.error('Error getting links for folder:', req.params.folderId, error);
    res.status(500).json({ message: '获取链接失败', error: error.message });
  }
};

// 创建新链接
const createLink = async (req, res) => {
  try {
    const { folderId, title, url, note } = req.body;

    if (req.isTestUser) {
      const testFolder = testFolders.find(f => f._id === folderId);
      if (!testFolder) {
        return res.status(404).json({ message: '收藏夹不存在或无权访问' });
      }

      const newLink = {
        _id: `test_link_${Date.now()}`,
        folderId,
        title,
        url,
        note,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      testLinks.push(newLink);
      return res.status(201).json(newLink);
    }

    const folder = await Folder.findOne({
      _id: folderId,
      userId: req.user._id
    });

    if (!folder) {
      return res.status(404).json({ message: '收藏夹不存在或无权访问' });
    }

    const link = new Link({ folderId, title, url, note });
    await link.save();
    res.status(201).json(link);
  } catch (error) {
    console.error('Error creating link:', error.message);
    res.status(500).json({ message: '创建链接失败', error: error.message });
  }
};

// 更新链接
const updateLink = async (req, res) => {
  try {
    const { title, url, note } = req.body;

    if (req.isTestUser) {
      const linkIndex = testLinks.findIndex(l => l._id === req.params.id);
      if (linkIndex === -1) {
        return res.status(404).json({ message: '链接不存在' });
      }

      testLinks[linkIndex] = {
        ...testLinks[linkIndex],
        title: title || testLinks[linkIndex].title,
        url: url || testLinks[linkIndex].url,
        note: note || testLinks[linkIndex].note,
        updatedAt: new Date()
      };

      return res.json(testLinks[linkIndex]);
    }

    const link = await Link.findById(req.params.id);
    if (!link) {
      return res.status(404).json({ message: '链接不存在' });
    }

    const folder = await Folder.findOne({
      _id: link.folderId,
      userId: req.user._id
    });

    if (!folder) {
      return res.status(403).json({ message: '无权操作此链接' });
    }

    link.title = title;
    link.url = url;
    link.note = note;
    await link.save();
    res.json(link);
  } catch (error) {
    console.error('Error updating link ID:', req.params.id, error);
    res.status(500).json({ message: '更新链接失败', error: error.message });
  }
};

// 删除链接
const deleteLink = async (req, res) => {
  try {
    if (req.isTestUser) {
      const linkIndex = testLinks.findIndex(l => l._id === req.params.id);
      if (linkIndex === -1) {
        return res.status(404).json({ message: '链接不存在' });
      }

      testLinks.splice(linkIndex, 1);
      return res.json({ message: '链接已删除' });
    }

    const link = await Link.findById(req.params.id);
    if (!link) {
      return res.status(404).json({ message: '链接不存在' });
    }

    const folder = await Folder.findOne({
      _id: link.folderId,
      userId: req.user._id
    });

    if (!folder) {
      return res.status(403).json({ message: '无权操作此链接' });
    }

    await link.deleteOne();
    res.json({ message: '链接已删除' });
  } catch (error) {
    console.error('Error deleting link ID:', req.params.id, error);
    res.status(500).json({ message: '删除链接失败', error: error.message });
  }
};

module.exports = {
  getLinksByFolder,
  createLink,
  updateLink,
  deleteLink
};