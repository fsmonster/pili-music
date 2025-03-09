import express from 'express';
import axios from 'axios';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// 应用认证中间件到需要认证的路由
router.use('/season', authMiddleware);

/**
 * @route   GET /api/season/collected/list
 * @desc    获取用户订阅的合集列表
 * @access  Private - 需要JWT认证
 */
router.get('/collected/list', async (req, res) => {
    try {
      const { pn , ps , up_mid='' } = req.query;
  
      // 调用B站API获取订阅合集列表
      const response = await axios.get('https://api.bilibili.com/x/v3/fav/folder/collected/list', {
        params: {
          pn,
          ps,
          up_mid,
          platform:'web'
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
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
 * @route   GET /api/season/season/list
 * @desc    获取指定合集的内容列表
 */
router.get('/season/list', async (req, res) => {
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
        season_id,
        pn,
        ps,
        jsonp: 'jsonp'
    },
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
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

export default router;