import express, { Request, Response } from 'express';
import * as likeController from '../controllers/likeController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// 应用认证中间件到所有路由
router.use(authMiddleware);

/**
 * 媒体数据接口
 */
interface MediaData {
  bvid: string;
  aid?: number;
  cid?: number;
  title: string;
  cover?: string;
  duration?: number;
  upper?: {
    uid: string;
    name: string;
  };
}

/**
 * @route   GET /api/like
 * @desc    获取用户喜欢的所有媒体
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
    
    const { userId } = req.user;
    
    // 获取用户喜欢的所有媒体
    const likes = await likeController.getUserLikes(userId);
    
    res.json({
      code: 0,
      data: likes
    });
  } catch (error) {
    console.error('获取用户喜欢列表失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '获取用户喜欢列表失败' 
    });
  }
});

/**
 * @route   POST /api/like
 * @desc    添加媒体到喜欢列表
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
    
    const { userId } = req.user;
    const { mediaData } = req.body as { mediaData: MediaData };

    console.log('😀😀😀添加喜欢:', JSON.stringify({ userId, mediaData })); // 确保 bvid 和 title 存在

    // 添加媒体到喜欢列表
    const like = await likeController.addLike(userId, mediaData);
    
    res.status(201).json({
      code: 0,
      data: like
    });
  } catch (error) {
    console.error('添加喜欢失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '添加喜欢失败' 
    });
  }
});

/**
 * @route   DELETE /api/like/:bvid
 * @desc    从喜欢列表移除媒体
 * @access  Private - 需要登录
 */
router.delete('/:bvid', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        code: 401, 
        message: '未授权访问' 
      });
    }
    
    const { userId } = req.user;
    const { bvid } = req.params;
    
    // 从喜欢列表移除媒体
    await likeController.removeLike(userId, bvid);
    
    res.json({
      code: 0,
      message: '已从喜欢列表移除'
    });
  } catch (error) {
    console.error('移除喜欢失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '移除喜欢失败' 
    });
  }
});

/**
 * @route   GET /api/like/check/:bvid
 * @desc    检查媒体是否在喜欢列表中
 * @access  Private - 需要登录
 */
router.get('/check/:bvid', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        code: 401, 
        message: '未授权访问' 
      });
    }
    
    const { userId } = req.user;
    const { bvid } = req.params;
    
    // 检查媒体是否在喜欢列表中
    const isLiked = await likeController.checkIsLiked(userId, bvid);
    
    res.json({
      code: 0,
      data: { isLiked }
    });
  } catch (error) {
    console.error('检查喜欢状态失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '检查喜欢状态失败' 
    });
  }
});

export default router;
