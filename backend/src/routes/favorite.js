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

/**
 * @describe 查看视频分p信息， avid/bvid转cid，cid表示当前分p
 * @route   GET /api/favorite/player/pagelist
 * @param {string} bvid - 视频bvid
 * @param {number} aid - 视频aid
 * @returns {Object} 视频分p信息
 */
router.get('/player/pagelist', async (req, res) => {
  try {
    const {
      aid,
      bvid,
    } = req.query;
    console.log(aid, bvid);
    
    if(!aid && !bvid) {
      return res.status(400).json({ 
        code: 400, 
        message: '缺少必要参数：aid 或 bvid' 
      });
    }
    let xid = aid?'aid':'bvid';
    let id = aid ?? bvid;
      // 调用B站API获取视频信息
    const response = await axios.get('https://api.bilibili.com/x/player/pagelist', {
      params: {
        [xid]: id,
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('获取视频分P列表失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '获取视频分P列表失败' 
    });
  }
});


/**
 * 获取视频cid信息
 * @param {number} aid - 视频aid
 * @returns {Object} 视频信息
 */
router.get('/video/info', async (req, res) => {
  try {
    const { SESSDATA } = req.cookies;
    if (!SESSDATA) {
      return res.status(401).json({ 
        code: 401, 
        message: '未登录或登录已过期' 
      });
    }

    const { aid } = req.query;
    if (!aid) {
      return res.status(400).json({ 
        code: 400, 
        message: '缺少必要参数：aid' 
      });
    }

    // 调用B站API获取视频信息
    const response = await axios.get('https://api.bilibili.com/x/web-interface/view', {
      params: {
        aid,
        jsonp: 'jsonp'
      },
      headers: {
        Cookie: `SESSDATA=${SESSDATA}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('获取视频信息失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '获取视频信息失败' 
    });
  }
});

/**
 * 获取音频流URL
 * @param {number} aid - 视频aid
 * @param {number} cid - 视频cid
 * @returns {Object} 音频流信息
 */
router.get('/audio/url', async (req, res) => {
  try {
    const { SESSDATA } = req.cookies;
    if (!SESSDATA) {
      return res.status(401).json({ 
        code: 401, 
        message: '未登录或登录已过期' 
      });
    }

    const { aid, cid } = req.query;
    if (!aid || !cid) {
      return res.status(400).json({ 
        code: 400, 
        message: '缺少必要参数：aid 或 cid' 
      });
    }

    // 调用B站API获取音频流信息
    const response = await axios.get('https://api.bilibili.com/x/player/playurl', {
      params: {
        aid,
        cid,
        fnval: 16, // 获取DASH格式
        fnver: 0,
        fourk: 1,
        jsonp: 'jsonp'
      },
      headers: {
        Cookie: `SESSDATA=${SESSDATA}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('获取音频流URL失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '获取音频流URL失败' 
    });
  }
});

/**
 * @route   GET /api/favorite/collected/list
 * @desc    获取用户订阅的合集列表
 * @access  Private - 需要SESSDATA
 */
router.get('/collected/list', async (req, res) => {
  
  try {
    const { SESSDATA } = req.cookies;
    if (!SESSDATA) {
      return res.status(401).json({ 
        code: 401, 
        message: '未登录或登录已过期' 
      });
    }

    const { pn = 1, ps = 20, up_mid='' } = req.query;

    // 调用B站API获取订阅合集列表
    const response = await axios.get('https://api.bilibili.com/x/v3/fav/folder/collected/list', {
      params: {
        pn,
        ps,
        up_mid,
        platform:'web'
      },
      headers: {
        Cookie: `SESSDATA=${SESSDATA}`,
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
 * @route   GET /api/favorite/season/content
 * @desc    获取指定合集的内容列表
 */
router.get('/season/content', async (req, res) => {
  try {
    const { season_id, pn = 1, ps = 40 } = req.query;
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
