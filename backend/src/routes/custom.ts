import express, { Response } from 'express';
import * as customController from '../controllers/customController.js';
import authMiddleware from '../middleware/auth.js';
import { AuthRequest } from '../types/index.js';

const router = express.Router();

// 应用认证中间件到所有路由
router.use(authMiddleware);

/**
 * 媒体项接口
 */
interface MediaItem {
  avid: number;
  bvid: string;
  cid: number;
  title: string;
  cover: string;
  duration: number;
  upper: {
    mid: number;
    name: string;
  };
}

/**
 * 创建歌单请求体接口
 */
interface CreateCustomRequest {
  title: string;
  cover?: string;
  description?: string;
}

/**
 * @route   GET /api/custom
 * @desc    获取用户的所有自建歌单
 * @access  Private - 需要登录
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        code: 401, 
        message: '未授权访问' 
      });
    }
    
    const { mid } = req.user;
    
    // 获取用户的所有自建歌单
    const playlists = await customController.getUserPlaylists(mid);
    
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
 * @param {String} id - 歌单ID
 * @access  Private - 需要登录
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
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
      message: error instanceof Error ? error.message : '获取歌单详情失败' 
    });
  }
});

/**
 * @route   POST /api/custom
 * @desc    创建新歌单
 * @param {CreateCustomRequest} playlistData - 歌单数据
 * @access  Private - 需要登录
 */
router.post('/', async (req: AuthRequest, res: Response) => {
  try {    
    if (!req.user) {
      return res.status(401).json({ 
        code: 401, 
        message: '未授权访问' 
      });
    }
    
    const { mid } = req.user;
    const { title, cover, description } = req.body as CreateCustomRequest;
    
    // 创建新歌单
    const newPlaylist = await customController.createPlaylist(mid, {
      name: title,
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
 * @param {String} id - 歌单ID
 * @param {CreateCustomRequest} playlistData - 歌单数据
 * @access  Private - 需要登录
 */
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        code: 401, 
        message: '未授权访问' 
      });
    }
    
    const { mid } = req.user;
    const { id } = req.params;
    const { title, cover, description } = req.body as CreateCustomRequest;
    
    // 更新歌单信息
    const updatedPlaylist = await customController.updatePlaylist(id, mid, {
      name: title,
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
      message: error instanceof Error ? error.message : '更新歌单失败' 
    });
  }
});

/**
 * @route   DELETE /api/custom/:id
 * @desc    删除歌单
 * @param {String} id - 歌单ID
 * @access  Private - 需要登录
 */
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        code: 401, 
        message: '未授权访问' 
      });
    }
    
    const { mid } = req.user;
    const { id } = req.params;
    
    // 删除歌单
    await customController.deletePlaylist(id, mid);
    
    res.json({
      code: 0,
      message: '歌单删除成功'
    });
  } catch (error) {
    console.error('删除歌单失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: error instanceof Error ? error.message : '删除歌单失败' 
    });
  }
});

/**
 * @route   POST /api/custom/:id/media
 * @desc    向歌单添加媒体
 * @param {String} id - 歌单ID
 * @param {MediaItem} mediaItem - 媒体项
 * @access  Private - 需要登录
 */
router.post('/:id/media', async (req: AuthRequest, res: Response) => {
  try {    
    if (!req.user) {
      return res.status(401).json({ 
        code: 401, 
        message: '未授权访问' 
      });
    }
    
    const { mid } = req.user;
    const { id } = req.params;
    const mediaItem = req.body as MediaItem;
    
    // 添加媒体到歌单
    const updatedPlaylist = await customController.addMediaToPlaylist(id, mid, mediaItem);
    
    res.status(201).json({
      code: 0,
      data: updatedPlaylist
    });
  } catch (error) {
    console.error('添加媒体到歌单失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: error instanceof Error ? error.message : '添加媒体到歌单失败' 
    });
  }
});

/**
 * @route   DELETE /api/custom/:id/media
 * @desc    从歌单移除媒体
 * @param {String} id - 歌单ID
 * @param {Number} avid - 媒体AV号
 * @param {Number} cid - 媒体CID
 * @access  Private - 需要登录
 */
router.delete('/:id/media', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        code: 401, 
        message: '未授权访问' 
      });
    }
    
    const { mid } = req.user;
    const { id } = req.params;
    const { avid, cid } = req.body;
    
    // 从歌单移除媒体
    const updatedPlaylist = await customController.removeMediaFromPlaylist(id, mid, Number(avid), Number(cid));
    
    res.json({
      code: 0,
      data: updatedPlaylist
    });
  } catch (error) {
    console.error('从歌单移除媒体失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: error instanceof Error ? error.message : '从歌单移除媒体失败' 
    });
  }
});

export default router;
