import express, { Request, Response } from 'express';
import axios from 'axios';
import {authMiddleware, optionalAuthMiddleware} from '../middleware/auth.js';
import { AuthRequest } from '../types/index.js';
import * as seasonController from '../controllers/seasonController.js';
import { getHeaders } from '../utils/getHeader.js';

const router = express.Router();

// 可选鉴权中间件
router.use('/collected/list', optionalAuthMiddleware);

/**
 * @route   GET /api/season/collected/list
 * @desc    获取用户订阅的合集列表
 * @param {number} up_mid - 用户uid
 * @param {number} pn - 页码
 * @param {number} ps - 每页项数
 * @access  Optional - 可选鉴权
 */
router.get('/collected/list', async (req: AuthRequest, res: Response) => {
  try {
    // if (!req.user) {
    //   return res.status(401).json({ 
    //     code: 401, 
    //     message: '未授权访问' 
    //   });
    // }
    
    // const { sessdata } = req.user;
    
    const { pn, ps, up_mid='' } = req.query;

    const sessdata = req.user?.sessdata; // 可能为 undefined

    const headers = getHeaders(sessdata);

    // 调用B站API获取订阅合集列表
    const response = await axios.get('https://api.bilibili.com/x/v3/fav/folder/collected/list', {
      params: {
        pn,
        ps,
        up_mid,
        platform:'web'
      },
      headers
    });
  
    res.json(response.data);
  } catch (error) {
    console.error('获取订阅合集列表失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '获取订阅合集列表失败' 
    });
  }
});

/**
 * @route   GET /api/season/meta/:season_id
 * @desc    查询系列meta信息
 * @param {number} season_id - 合集ID
 * @access  Public - 不需要登录
 */
router.get('/meta/:season_id', async (req: Request, res: Response) => {
  try {
    const { season_id } = req.params;
    
    // 调用B站API获取系列meta信息
    const response = await axios.get('https://api.bilibili.com/x/series/season', {
      params: {
        season_id
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.bilibili.com'
      }
    });
  
    res.json(response.data);
  } catch (error) {
    console.error('获取系列meta信息失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '获取系列meta信息失败' 
    });
  }
});
  
/**
 * @route   GET /api/season/season/list
 * @desc    获取指定合集的内容列表
 * @param {number} season_id - 合集ID
 * @access  Public - 不需要认证
 */
router.get('/season/list', async (req: Request, res: Response) => {
  try {
    const { season_id, pn, ps } = req.query;
    if (!season_id) {
      return res.status(400).json({ 
        code: 400, 
        message: '缺少必要参数：season_id' 
      });
    }

    // 调用B站API获取合集内容
    const response = await axios.get('https://api.bilibili.com/x/space/fav/season/list', {
      params: {
        season_id
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.bilibili.com'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('获取合集内容列表失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '获取合集内容列表失败' 
    });
  }
});

// 应用认证中间件到需要认证的路由
router.use('/display', authMiddleware);

/**
 * @route   GET /api/season/display
 * @desc    获取用户显示的合集ID列表
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
    
    // 获取用户显示的合集ID列表
    const displayIds = await seasonController.getDisplaySeasons(mid);
    
    res.json({
      code: 0,
      message: '获取显示合集成功',
      data: displayIds
    });
  } catch (error) {
    console.error('获取显示合集失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '获取显示合集失败' 
    });
  }
});

/**
 * @route   PUT /api/season/display
 * @desc    更新用户显示的合集ID列表
 * @param {number[]} displayIds - 需要显示的合集ID列表
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
    
    const { mid } = req.user;
    const { displayIds } = req.body;
    
    // 更新用户显示的合集ID列表
    const updatedDisplayIds = await seasonController.updateDisplaySeasons(mid, displayIds);
    
    res.json({
      code: 0,
      message: '更新显示合集成功',
      data: updatedDisplayIds
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
