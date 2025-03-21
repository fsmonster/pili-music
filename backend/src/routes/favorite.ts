import express, { Request, Response } from 'express';
import axios from 'axios';
import authMiddleware from '../middleware/auth.js';
import { AuthRequest } from '../types/index.js';
import * as favoriteController from '../controllers/favoriteController.js';

const router = express.Router();

// 应用认证中间件到所有路由
router.use(authMiddleware);

/**
 * @route   GET /api/favorite/list
 * @desc    获取用户收藏夹列表
 * @param {number} up_mid - 用户uid
 * @access  Private - 需要JWT认证
 */
router.get('/list', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        code: 401, 
        message: '未授权访问' 
      });
    }

    const { up_mid } = req.query;   
    const { sessdata } = req.user;
    
    
    // 调用B站API获取收藏夹列表
    const response = await axios.get('https://api.bilibili.com/x/v3/fav/folder/created/list-all', {
      params: {
        up_mid
      },
      headers: {
        Cookie: `SESSDATA=${sessdata}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.bilibili.com'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('获取收藏夹列表失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '获取收藏夹列表失败' 
    });
  }
});

/**
 * @route   GET /api/favorite/folder/info
 * @desc    获取收藏夹信息
 * @param {number} media_id - 收藏夹ID
 * @access  Private - 需要JWT认证
 */
router.get('/folder/info', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        code: 401, 
        message: '未授权访问' 
      });
    }
    
    const { sessdata } = req.user;
    
    const { media_id } = req.query;
    if (!media_id) {
      return res.status(400).json({ 
        code: 400, 
        message: '缺少必要参数media_id' 
      });
    }

    const response = await axios.get('https://api.bilibili.com/x/v3/fav/folder/info', {
      params: {
        media_id
      },
      headers: {
        Cookie: `SESSDATA=${sessdata}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.bilibili.com'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('获取收藏夹内容信息失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '获取收藏夹内容信息失败' 
    });
  }
});

/**
 * @route   GET /api/favorite/resource/list
 * @desc    获取收藏夹内容列表
 * @access  Private - 需要JWT认证
 */
router.get('/resource/list', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        code: 401, 
        message: '未授权访问' 
      });
    }
    
    const { sessdata } = req.user;
    
    const { media_id, ps, pn, keyword = '', order = 'mtime'} = req.query;
    
    if (!media_id) {
      return res.status(400).json({ 
        code: 400, 
        message: '缺少必要参数media_id' 
      });
    }

    const response = await axios.get('https://api.bilibili.com/x/v3/fav/resource/list', {
      params: {
        media_id,
        ps,
        pn,
        keyword,
        order,
      },
      headers: {
        Cookie: `SESSDATA=${sessdata}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.bilibili.com'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('获取收藏夹内容列表失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '获取收藏夹内容列表失败' 
    });
  }
});

/**
 * @route   GET /api/favorite/display
 * @desc    获取用户显示的收藏夹ID列表
 * @access  Private - 需要登录
 */ 
router.get('/display', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        code: 401, 
        message: '未授权访问' 
      });
    }
    
    const { mid } = req.user;
    
    // 获取用户显示的收藏夹ID列表
    const displayIds = await favoriteController.getDisplayFavorites(mid);
    
    res.json({
      code: 0,
      message: '获取显示收藏夹成功',
      data: displayIds
    });
  } catch (error) {
    console.error('获取显示收藏夹失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '获取显示收藏夹失败' 
    });
  }
});

/**
 * @route   PUT /api/favorite/display
 * @desc    更新用户显示的收藏夹列表
 * @param {number[]} displayIds - 需要显示的收藏夹ID列表
 * @access  Private - 需要登录
 */
router.put('/display', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        code: 401, 
        message: '未授权访问' 
      });
    }
    
    const { mid }: { mid: number } = req.user;
    const { displayIds }: { displayIds: number[] } = req.body;
    
    // 更新用户显示的收藏夹列表
    const updatedDisplayIds = await favoriteController.updateDisplayFavorites(mid, displayIds);
    
    res.json({
      code: 0,
      message: '更新显示收藏夹成功',
      data: updatedDisplayIds
    });
  } catch (error) {
    console.error('更新显示收藏夹失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '更新显示收藏夹失败' 
    });
  }
});

export default router;
