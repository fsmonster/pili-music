import express from 'express';
import axios from 'axios';

const router = express.Router();

/**
 * @route   GET /api/favorite/list
 * @desc    获取用户收藏夹列表
 * @access  Private - 需要SESSDATA
 */
router.get('/list', async (req, res) => {
  try {
    const { SESSDATA } = req.cookies;
    if (!SESSDATA) {
      return res.status(401).json({ 
        code: 401, 
        message: '未登录或登录已过期' 
      });
    }

    // 调用B站API获取收藏夹列表
    const response = await axios.get('https://api.bilibili.com/x/v3/fav/folder/created/list-all', {
      params: {
        up_mid: req.query.up_mid || '',
        jsonp: 'jsonp'
      },
      headers: {
        Cookie: `SESSDATA=${SESSDATA}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
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
 * @access  Private - 需要SESSDATA
 */

router.get('/folder/info', async (req, res) => {
  try {
    const { SESSDATA } = req.cookies;
    if (!SESSDATA) {
      return res.status(401).json({ 
        code: 401, 
        message: '未登录或登录已过期' 
      });
    }

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
        Cookie: `SESSDATA=${SESSDATA}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
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
 * @access  Private - 需要SESSDATA
 */
router.get('/resource/list', async (req, res) => {
  try {
    const { SESSDATA } = req.cookies;
    if (!SESSDATA) {
      return res.status(401).json({ 
        code: 401, 
        message: '未登录或登录已过期' 
      });
    }

    const { media_id, pn = 1, ps = 20 } = req.query;
    if (!media_id) {
      return res.status(400).json({ 
        code: 400, 
        message: '缺少必要参数media_id' 
      });
    }

    // 调用B站API获取收藏夹内容
    const response = await axios.get('https://api.bilibili.com/x/v3/fav/resource/list', {
      params: {
        media_id,
        pn,
        ps,
        keyword: req.query.keyword || '',
        order: req.query.order || 'mtime',
        type: req.query.type || 0,
        tid: req.query.tid || 0,
        jsonp: 'jsonp'
      },
      headers: {
        Cookie: `SESSDATA=${SESSDATA}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
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
 * @access  Private - 需要SESSDATA
 */
router.get('/resource/ids', async (req, res) => {
  try {
    const { SESSDATA } = req.cookies;
    if (!SESSDATA) {
      return res.status(401).json({ 
        code: 401, 
        message: '未登录或登录已过期' 
      });
    }

    const { media_id } = req.query;
    if (!media_id) {
      return res.status(400).json({ 
        code: 400, 
        message: '缺少必要参数media_id' 
      });
    }

    // 调用B站API获取收藏夹内所有资源的id
    const response = await axios.get('https://api.bilibili.com/x/v3/fav/resource/ids', {
      params: {
        media_id,
        jsonp: 'jsonp'
      },
      headers: {
        Cookie: `SESSDATA=${SESSDATA}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
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
