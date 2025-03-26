import express, { Request, Response } from 'express';
import axios from 'axios';
import {authMiddleware, optionalAuthMiddleware} from '../middleware/auth.js';
import { AuthRequest } from '../types/index.js';
import * as seriesController from '../controllers/seriesController.js';
// import { getHeaders } from '../utils/getHeader.js';

const router = express.Router();

/**
 * @route   GET /api/series
 * @desc    获取用户合集、系列
 * @param {number} mid - 用户uid
 * @param {number} page_num - 页码索引
 * @param {number} page_size - 单页内容数量
 * @access  Public - 不需要登录
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { mid, page_num, page_size } = req.query;
    
    // 调用B站API获取合集、系列
    const response = await axios.get('https://api.bilibili.com/x/polymer/web-space/home/seasons_series', {
      params: {
        mid,
        page_num,
        page_size
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.bilibili.com'
      }
    });
  
    res.json(response.data);
  } catch (error) {
    console.error('获取合集、系列失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '获取合集、系列失败' 
    });
  }
});

/**
 * @route   GET /api/series/meta
 * @desc    查询系列meta信息
 * @param {number} series_id - 系列ID
 * @access  Public - 不需要登录
 */
router.get('/meta', async (req: Request, res: Response) => {
  try {
    const { series_id } = req.query;
    
    // 调用B站API获取系列meta信息
    const response = await axios.get('https://api.bilibili.com/x/series/series', {
      params: {
        series_id
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
 * @route   GET /api/series/archives
 * @desc    获取指定系列视频
 * @param {number} series_id - 系列ID
 * @access  Public - 不需要登录
 */
router.get('/archives', async (req: Request, res: Response) => {
  try {
    const { mid, series_id, pn, ps } = req.query;
    
    // 调用B站API获取系列视频
    const response = await axios.get('https://api.bilibili.com/x/series/archives', {
      params: {
        mid: Number(mid),
        series_id: Number(series_id),
        pn: Number(pn),
        ps: Number(ps)
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.bilibili.com'
      }
    });
  
    res.json(response.data);
  } catch (error) {
    console.error('获取系列视频失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '获取系列视频失败' 
    });
  }
});

// 应用认证中间件到需要认证的路由
router.use(authMiddleware);

/**
 * @route   GET /api/series/display
 * @desc    获取用户显示的系列ID列表
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
      
      // 获取用户显示的系列ID列表
      const displaySeries = await seriesController.getDisplaySeries(mid);
      
      res.json({
        code: 0,
        message: '获取显示系列成功',
        data: displaySeries
      });
    } catch (error) {
      console.error('获取显示系列失败:', error);
      res.status(500).json({ 
        code: 500, 
        message: '获取显示系列失败' 
      });
    }
  });
  
  /**
   * @route   PUT /api/series/display
   * @desc    更新用户显示的系列ID列表
   * @param {number[]} displaySeries - 需要显示的系列ID列表
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
      const displayIds = req.body.displayIds;
      
      // 更新用户显示的系列ID列表
      
      const updatedDisplaySeries = await seriesController.updateDisplaySeries(mid, displayIds);
      res.json({
        code: 0,
        message: '更新显示系列成功',
        data: updatedDisplaySeries
      });
    } catch (error) {
      console.error('更新显示系列失败:', error);
      res.status(500).json({ 
        code: 500, 
        message: '更新显示系列失败' 
      });
    }
  });

export default router;

