import express from 'express';
import axios from 'axios';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// 应用认证中间件到所有路由
router.use(authMiddleware);

/**
 * @route   GET /api/favorite/list
 * @desc    获取用户收藏夹列表
 * @param {number} up_mid - 用户ID
 * @access  Private - 需要JWT认证
 */
router.get('/list', async (req, res) => {
  try {
    console.log('😀😀😀😀😀😀😀😀req:', req);
    
    const { sessdata } = req.user;
    
    // 调用B站API获取收藏夹列表
    const response = await axios.get('https://api.bilibili.com/x/v3/fav/folder/created/list-all', {
      params: {
        up_mid: req.query.up_mid || '',
        jsonp: 'jsonp'
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
 * @desc    获取收藏夹内容信息
 * @param {number} media_id - 收藏夹ID
 * @access  Private - 需要JWT认证
 */
router.get('/folder/info', async (req, res) => {
  try {
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
router.get('/resource/list', async (req, res) => {
  try {
    const { sessdata } = req.user;
    
    const { media_id, ps = 20, pn = 1, keyword = '', order = 'mtime', type = 0, tid = 0 } = req.query;
    
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
        type,
        tid
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
 * @route   GET /api/favorite/resource/ids
 * @desc    获取收藏夹全部内容的id
 * @access  Private - 需要JWT认证
 */
router.get('/resource/ids', async (req, res) => {
  try {
    const { sessdata } = req.user;
    
    const { media_id } = req.query;
    if (!media_id) {
      return res.status(400).json({ 
        code: 400, 
        message: '缺少必要参数media_id' 
      });
    }

    const response = await axios.get('https://api.bilibili.com/x/v3/fav/resource/ids', {
      params: {
        media_id,
        jsonp: 'jsonp'
      },
      headers: {
        Cookie: `SESSDATA=${sessdata}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.bilibili.com'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('获取收藏夹资源ID列表失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '获取收藏夹资源ID列表失败' 
    });
  }
});

export default router;
