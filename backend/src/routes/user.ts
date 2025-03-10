import express, { Request, Response } from 'express';
import axios from 'axios';
import * as userController from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// 应用认证中间件到所有路由
router.use(authMiddleware);

/**
 * 用户认证请求接口扩展
 */
interface AuthRequest extends Request {
  user?: {
    userId: string;
    uid: string;
    sessdata: string;
  };
}

/**
 * 用户偏好设置接口
 */
interface UserPreferences {
  theme?: string;
  audioQuality?: string;
  showLyrics?: boolean;
  [key: string]: any;
}

/**
 * @route   GET /api/user/profile
 * @desc    获取用户个人资料
 * @access  Private - 需要登录
 */
router.get('/profile', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        code: 401, 
        message: '未授权访问' 
      });
    }
    
    const { uid, sessdata } = req.user;
    
    // 调用B站API获取用户信息
    const response = await axios.get('https://api.bilibili.com/x/web-interface/nav', {
      headers: {
        Cookie: `SESSDATA=${sessdata}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.bilibili.com'
      }
    });

    if (response.data.code === 0 && response.data.data) {
      const userData = response.data.data;
      
      // 保存用户信息到MongoDB
      const user = await userController.saveUserInfo(userData);
      
      // 返回合并后的用户信息
      res.json({
        code: 0,
        data: {
          ...userData,
          preferences: user.preferences,
          displayFavoriteIds: user.displayFavoriteIds,
          displaySeasonIds: user.displaySeasonIds
        }
      });
    } else {
      res.status(401).json({ 
        code: response.data.code, 
        message: response.data.message || '获取用户信息失败' 
      });
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '获取用户信息失败' 
    });
  }
});

/**
 * @route   PUT /api/user/preferences
 * @desc    更新用户偏好设置
 * @access  Private - 需要登录
 */
router.put('/preferences', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        code: 401, 
        message: '未授权访问' 
      });
    }
    
    const { uid } = req.user;
    const { preferences } = req.body as { preferences: UserPreferences };
    
    // 更新用户偏好设置
    const updatedUser = await userController.updateUserPreferences(uid, preferences);
    
    res.json({
      code: 0,
      data: updatedUser
    });
  } catch (error) {
    console.error('更新用户偏好设置失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '更新用户偏好设置失败' 
    });
  }
});

/**
 * @route   PUT /api/user/display-favorites
 * @desc    更新用户显示的收藏夹列表
 * @access  Private - 需要登录
 */
router.put('/display-favorites', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        code: 401, 
        message: '未授权访问' 
      });
    }
    
    const { uid } = req.user;
    const { favoriteIds } = req.body as { favoriteIds: string[] };
    
    // 更新用户显示的收藏夹列表
    const updatedUser = await userController.updateDisplayFavorites(uid, favoriteIds);
    
    res.json({
      code: 0,
      data: updatedUser
    });
  } catch (error) {
    console.error('更新显示收藏夹失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '更新显示收藏夹失败' 
    });
  }
});

/**
 * @route   PUT /api/user/display-seasons
 * @desc    更新用户显示的合集列表
 * @access  Private - 需要登录
 */
router.put('/display-seasons', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        code: 401, 
        message: '未授权访问' 
      });
    }
    
    const { uid } = req.user;
    const { seasonIds } = req.body as { seasonIds: string[] };
    
    // 更新用户显示的合集列表
    const updatedUser = await userController.updateDisplaySeasons(uid, seasonIds);
    
    res.json({
      code: 0,
      data: updatedUser
    });
  } catch (error) {
    console.error('更新显示合集失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '更新显示合集失败' 
    });
  }
});

export default router;
