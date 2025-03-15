import express, { Request, Response } from 'express';
import * as likeController from '../controllers/likeController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// 应用认证中间件到所有路由
router.use(authMiddleware);

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
    
    const { mid } = req.user;
    
    // 获取用户喜欢的所有媒体
    const likes = await likeController.getUserLikes(mid);
    
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
 * @route   GET /api/like/check/:avid/:cid
 * @desc    检查媒体是否在喜欢列表中
 * @access  Private - 需要登录
 */
router.get('/check/:avid/:cid', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        code: 401, 
        message: '未授权访问' 
      });
    }
    
    const { mid } = req.user;
    const { avid, cid } = req.params;
    
    // 检查媒体是否在喜欢列表中
    const isLiked = await likeController.checkIsLiked(mid, Number(avid), Number(cid));
    
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
    
    const { mid } = req.user;
    const mediaData = req.body;

    // 添加媒体到喜欢列表
    const like = await likeController.addLike(mid, mediaData);
    
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
 * @route   DELETE /api/like/:avid/:cid
 * @desc    从喜欢列表移除媒体
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
    
    // 从喜欢列表移除媒体
    await likeController.removeLike(mid, Number(avid), Number(cid));
    
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

export default router;
