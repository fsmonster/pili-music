import express, { Request, Response } from 'express';
import authMiddleware from '../middleware/auth.js';
import { AuthRequest } from '../types/index.js';
import * as customController from '../controllers/customController.js';

const router = express.Router();

// 应用认证中间件到所有路由
router.use(authMiddleware);

/**
 * @route   GET /api/custom/sections
 * @desc    获取用户所有自定义分区
 * @access  Private - 需要JWT认证
 */
router.get('/sections', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        code: 401, 
        message: '未授权访问' 
      });
    }

    const { mid } = req.user;
    
    // 获取用户所有自定义分区
    const sections = await customController.getUserSections(mid);
    
    res.json({
      code: 0,
      message: '获取成功',
      data: sections
    });
  } catch (error) {
    console.error('获取自定义分区失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '获取自定义分区失败' 
    });
  }
});

/**
 * @route   GET /api/custom/section/:id
 * @desc    获取指定自定义分区详情
 * @access  Private - 需要JWT认证
 */
router.get('/section/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        code: 401, 
        message: '未授权访问' 
      });
    }

    const { mid } = req.user;
    const sectionId = req.params.id;
    
    // 获取指定分区详情
    const section = await customController.getSectionById(mid, sectionId);
    
    res.json({
      code: 0,
      message: '获取成功',
      data: section
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '获取分区详情失败';
    const statusCode = message.includes('不存在') ? 404 : 500;
    
    res.status(statusCode).json({ 
      code: statusCode, 
      message 
    });
  }
});

/**
 * @route   POST /api/custom/section
 * @desc    创建新的自定义分区
 * @access  Private - 需要JWT认证
 */
router.post('/section', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        code: 401, 
        message: '未授权访问' 
      });
    }

    const { mid } = req.user;
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ 
        code: 400, 
        message: '分区名称不能为空' 
      });
    }
    
    // 创建新分区
    const newSection = await customController.createSection(mid, name, description);
    
    res.status(201).json({
      code: 0,
      message: '创建成功',
      data: newSection
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '创建分区失败';
    const statusCode = message.includes('已存在') ? 409 : 500;
    
    res.status(statusCode).json({ 
      code: statusCode, 
      message 
    });
  }
});

/**
 * @route   PUT /api/custom/section/:id
 * @desc    更新自定义分区信息
 * @access  Private - 需要JWT认证
 */
router.put('/section/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        code: 401, 
        message: '未授权访问' 
      });
    }

    const { mid } = req.user;
    const sectionId = req.params.id;
    const { name, description } = req.body;
    
    if (!name && !description) {
      return res.status(400).json({ 
        code: 400, 
        message: '至少需要提供一个更新字段' 
      });
    }
    
    // 更新分区信息
    const updateData: {name?: string, description?: string} = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    
    const updatedSection = await customController.updateSection(mid, sectionId, updateData);
    
    res.json({
      code: 0,
      message: '更新成功',
      data: updatedSection
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '更新分区失败';
    const statusCode = message.includes('不存在') ? 404 : 
                       message.includes('已存在') ? 409 : 500;
    
    res.status(statusCode).json({ 
      code: statusCode, 
      message 
    });
  }
});

/**
 * @route   DELETE /api/custom/section/:id
 * @desc    删除自定义分区
 * @access  Private - 需要JWT认证
 */
router.delete('/section/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        code: 401, 
        message: '未授权访问' 
      });
    }

    const { mid } = req.user;
    const sectionId = req.params.id;
    
    // 删除分区
    await customController.deleteSection(mid, sectionId);
    
    res.json({
      code: 0,
      message: '删除成功'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '删除分区失败';
    const statusCode = message.includes('不存在') ? 404 : 500;
    
    res.status(statusCode).json({ 
      code: statusCode, 
      message 
    });
  }
});

/**
 * @route   POST /api/custom/section/:id/media
 * @desc    添加媒体到自定义分区
 * @access  Private - 需要JWT认证
 */
router.post('/section/:id/media', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        code: 401, 
        message: '未授权访问' 
      });
    }

    const { mid } = req.user;
    const sectionId = req.params.id;
    const { mediaIds } = req.body;
    
    if (!Array.isArray(mediaIds) || mediaIds.length === 0) {
      return res.status(400).json({ 
        code: 400, 
        message: '媒体ID列表不能为空' 
      });
    }
    
    // 添加媒体到分区
    const updatedSection = await customController.addMediaToSection(mid, sectionId, mediaIds);
    
    res.json({
      code: 0,
      message: '添加成功',
      data: updatedSection
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '添加媒体失败';
    const statusCode = message.includes('不存在') ? 404 : 500;
    
    res.status(statusCode).json({ 
      code: statusCode, 
      message 
    });
  }
});

/**
 * @route   DELETE /api/custom/section/:id/media
 * @desc    从自定义分区移除媒体
 * @access  Private - 需要JWT认证
 */
router.delete('/section/:id/media', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        code: 401, 
        message: '未授权访问' 
      });
    }

    const { mid } = req.user;
    const sectionId = req.params.id;
    const { mediaIds } = req.body;
    
    if (!Array.isArray(mediaIds) || mediaIds.length === 0) {
      return res.status(400).json({ 
        code: 400, 
        message: '媒体ID列表不能为空' 
      });
    }
    
    // 从分区移除媒体
    const updatedSection = await customController.removeMediaFromSection(mid, sectionId, mediaIds);
    
    res.json({
      code: 0,
      message: '移除成功',
      data: updatedSection
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '移除媒体失败';
    const statusCode = message.includes('不存在') ? 404 : 500;
    
    res.status(statusCode).json({ 
      code: statusCode, 
      message 
    });
  }
});

/**
 * @route   DELETE /api/custom/section/:id/media/all
 * @desc    清空自定义分区内的所有媒体
 * @access  Private - 需要JWT认证
 */
router.delete('/section/:id/media/all', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        code: 401, 
        message: '未授权访问' 
      });
    }

    const { mid } = req.user;
    const sectionId = req.params.id;
    
    // 清空分区内的所有媒体
    const updatedSection = await customController.clearSectionMedia(mid, sectionId);
    
    res.json({
      code: 0,
      message: '清空成功',
      data: updatedSection
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '清空媒体失败';
    const statusCode = message.includes('不存在') ? 404 : 500;
    
    res.status(statusCode).json({ 
      code: statusCode, 
      message 
    });
  }
});

export default router;