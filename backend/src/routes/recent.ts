import express, { Request, Response } from 'express';
import * as recentPlayController from '../controllers/recentPlayController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// 应用认证中间件到所有路由
router.use(authMiddleware);

/**
 * 媒体数据接口
 */
interface MediaData {
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
 * @route   GET /api/recent
 * @desc    获取用户的最近播放记录
 * @access  Private - 需要登录
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        code: 401, 
        message: '未授权访问' 
      });
    }
    
    const { mid } = req.user;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    
    // 获取用户的最近播放记录
    const recentPlays = await recentPlayController.getUserRecentPlays(mid, limit);
    
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
router.post('/', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        code: 401, 
        message: '未授权访问' 
      });
    }
    
    const { mid } = req.user;
    const mediaData = req.body;
    
    // 添加或更新播放记录
    const recentPlay = await recentPlayController.addOrUpdateRecentPlay(mid, mediaData);
    
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
 * @route   DELETE /api/recent/:avid/:cid
 * @desc    删除单条播放记录
 * @param {Number} avid - 视频ID
 * @param {Number} cid - 章节ID
 * @access  Private - 需要登录
 */
router.delete('/:avid/:cid', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        code: 401, 
        message: '未授权访问' 
      });
    }
    
    const { mid } = req.user;
    const { avid, cid } = req.params;
    
    // 删除播放记录
    await recentPlayController.deleteRecentPlay(mid, Number(avid), Number(cid));
    
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
router.delete('/', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        code: 401, 
        message: '未授权访问' 
      });
    }
    
    const { mid } = req.user;
    
    // 清空所有播放记录
    await recentPlayController.clearAllRecentPlays(mid);
    
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
