import express, { Response } from 'express';
import {authMiddleware} from '../middleware/auth.js';
import { AuthRequest } from '../types/index.js';
import * as seriesController from '../controllers/seriesController.js';

const router = express.Router();
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

