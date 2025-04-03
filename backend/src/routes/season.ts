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
    const { pn, ps, up_mid='' } = req.query;

    const sessdata = req.auth?.sessdata; // 可能为 undefined

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

// 应用认证中间件到需要认证的路由
router.use(authMiddleware);

/**
 * @route   GET /api/season/display
 * @desc    获取用户显示的合集ID列表
 * @access  Private - 需要登录
 */
router.get('/display', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.auth) {
      return res.status(401).json({ 
        code: 401, 
        message: '未授权访问' 
      });
    }
    
    const { mid } = req.auth;
    
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
    if (!req.auth) {
      return res.status(401).json({ 
        code: 401, 
        message: '未授权访问' 
      });
    }
    
    const { mid } = req.auth;
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
