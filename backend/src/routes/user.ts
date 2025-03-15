import express, { Request, Response } from 'express';
import axios from 'axios';
import * as userController from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';
import { AuthRequest } from '../types/index.js';

const router = express.Router();

// 应用认证中间件到所有路由
router.use(authMiddleware);

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
    
    const { mid, sessdata } = req.user;
    
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
    
    const { mid } = req.user;
    const { preferences } = req.body as { preferences: UserPreferences };
    
    // 更新用户偏好设置
    const updatedUser = await userController.updateUserPreferences(mid, preferences);
    
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
 * @desc 登出
 * @route GET /api/user/logout
 * @returns {Promise<ApiResponse<boolean>>} 登出是否成功
 * @access Private - 需要登录
 */
router.get('/logout', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        code: 401, 
        message: '未授权访问' 
      });
    }

    await userController.logout(req.user.mid);

    res.json({
      code: 0,
      data: true,
      message: '登出成功'
    });
  } catch (error) {
    console.error('登出失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '登出失败' 
    });
  }
});

export default router;
