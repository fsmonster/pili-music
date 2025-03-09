import express from 'express';
import axios from 'axios';
import * as customController from '../controllers/customController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// 应用认证中间件到所有路由
router.use(authMiddleware);

/**
 * @route   GET /api/custom
 * @desc    获取用户的所有自建歌单
 * @access  Private - 需要登录
 */
router.get('/', async (req, res) => {
  try {
    const { uid } = req.user;
    
    // 获取用户的所有自建歌单
    const playlists = await customController.getUserPlaylists(uid);
    
    res.json({
      code: 0,
      data: playlists
    });
  } catch (error) {
    console.error('获取用户歌单失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '获取用户歌单失败' 
    });
  }
});

/**
 * @route   GET /api/custom/:id
 * @desc    获取单个歌单详情
 * @access  Private - 需要登录
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 获取歌单详情
    const playlist = await customController.getPlaylistById(id);
    
    res.json({
      code: 0,
      data: playlist
    });
  } catch (error) {
    console.error('获取歌单详情失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: error.message || '获取歌单详情失败' 
    });
  }
});

/**
 * @route   POST /api/custom
 * @desc    创建新歌单
 * @access  Private - 需要登录
 */
router.post('/', async (req, res) => {
  try {    
    const { uid } = req.user;
    const { title, cover, description } = req.body;
    
    // 创建新歌单
    const newPlaylist = await customController.createPlaylist(uid, {
      title,
      cover,
      description
    });
    
    res.status(201).json({
      code: 0,
      data: newPlaylist
    });
  } catch (error) {
    console.error('创建歌单失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '创建歌单失败' 
    });
  }
});

/**
 * @route   PUT /api/custom/:id
 * @desc    更新歌单信息
 * @access  Private - 需要登录
 */
router.put('/:id', async (req, res) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;
    const { title, cover, description } = req.body;
    
    // 更新歌单信息
    const updatedPlaylist = await customController.updatePlaylist(id, uid, {
      title,
      cover,
      description
    });
    
    res.json({
      code: 0,
      data: updatedPlaylist
    });
  } catch (error) {
    console.error('更新歌单失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: error.message || '更新歌单失败' 
    });
  }
});

/**
 * @route   DELETE /api/custom/:id
 * @desc    删除歌单
 * @access  Private - 需要登录
 */
router.delete('/:id', async (req, res) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;
    
    // 删除歌单
    await customController.deletePlaylist(id, uid);
    
    res.json({
      code: 0,
      message: '歌单删除成功'
    });
  } catch (error) {
    console.error('删除歌单失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: error.message || '删除歌单失败' 
    });
  }
});

/**
 * @route   POST /api/custom/:id/media
 * @desc    向歌单添加媒体
 * @access  Private - 需要登录
 */
router.post('/:id/media', async (req, res) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;
    const mediaItem = req.body;
    
    // 添加媒体到歌单
    const updatedPlaylist = await customController.addMediaToPlaylist(id, uid, mediaItem);
    
    res.status(201).json({
      code: 0,
      data: updatedPlaylist
    });
  } catch (error) {
    console.error('添加媒体到歌单失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: error.message || '添加媒体到歌单失败' 
    });
  }
});

/**
 * @route   DELETE /api/custom/:id/media/:bvid
 * @desc    从歌单移除媒体
 * @access  Private - 需要登录
 */
router.delete('/:id/media/:bvid', async (req, res) => {
  try {
    const { uid } = req.user;
    const { id, bvid } = req.params;
    
    // 从歌单移除媒体
    const updatedPlaylist = await customController.removeMediaFromPlaylist(id, uid, bvid);
    
    res.json({
      code: 0,
      data: updatedPlaylist
    });
  } catch (error) {
    console.error('从歌单移除媒体失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: error.message || '从歌单移除媒体失败' 
    });
  }
});

export default router;
