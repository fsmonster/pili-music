import express from 'express';
import axios from 'axios';
import * as recentPlayController from '../controllers/recentPlayController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// 应用认证中间件到所有路由
router.use(authMiddleware);

/**
 * @route   GET /api/recent
 * @desc    获取用户的最近播放记录
 * @access  Private - 需要登录
 */
router.get('/', async (req, res) => {
  try {
    const { uid } = req.user;
    const limit = req.query.limit ? parseInt(req.query.limit) : 100;
    
    // 获取用户的最近播放记录
    const recentPlays = await recentPlayController.getUserRecentPlays(uid, limit);
    
    res.json({
      code: 0,
      data: recentPlays
    });
  } catch (error) {
    console.error('获取最近播放记录失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '获取最近播放记录失败' 
    });
  }
});

/**
 * @route   POST /api/recent
 * @desc    添加或更新播放记录
 * @param {Object} mediaData - 媒体数据
 * @access  Private - 需要登录
 */
router.post('/', async (req, res) => {
  console.log('添加播放记录:', req.body);  
  try {
    const { uid } = req.user;
    const { mediaData } = req.body;
    
    // 添加或更新播放记录
    const recentPlay = await recentPlayController.addOrUpdateRecentPlay(uid, mediaData);
    
    res.status(201).json({
      code: 0,
      data: recentPlay
    });
  } catch (error) {
    console.error('添加播放记录失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '添加播放记录失败' 
    });
  }
});

/**
 * @route   DELETE /api/recent/:bvid
 * @desc    删除单条播放记录
 * @access  Private - 需要登录
 */
router.delete('/:bvid', async (req, res) => {
  try {
    const { uid } = req.user;
    const { bvid } = req.params;
    
    // 删除播放记录
    await recentPlayController.deleteRecentPlay(uid, bvid);
    
    res.json({
      code: 0,
      message: '播放记录删除成功'
    });
  } catch (error) {
    console.error('删除播放记录失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '删除播放记录失败' 
    });
  }
});

/**
 * @route   DELETE /api/recent
 * @desc    清空所有播放记录
 * @access  Private - 需要登录
 */
router.delete('/', async (req, res) => {
  try {
    const { uid } = req.user;
    
    // 清空所有播放记录
    await recentPlayController.clearAllRecentPlays(uid);
    
    res.json({
      code: 0,
      message: '所有播放记录已清空'
    });
  } catch (error) {
    console.error('清空播放记录失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '清空播放记录失败' 
    });
  }
});

export default router;
