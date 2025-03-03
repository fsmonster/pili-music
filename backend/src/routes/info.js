
import express from 'express';
import axios from 'axios';

const router = express.Router();

/**
 * @describe 查看视频分p信息， avid/bvid转cid，cid表示当前分p
 * @route   GET /api/info/player/pagelist
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
 * @desc 获取视频cid信息
 * @route   GET /api/info/video/info
 * @param {number} aid - 视频aid
 * @returns {Object} 视频信息
 */
// router.get('/video/info', async (req, res) => {
// try {
//     const { SESSDATA } = req.cookies;
//     if (!SESSDATA) {
//     return res.status(401).json({ 
//         code: 401, 
//         message: '未登录或登录已过期' 
//     });
//     }

//     const { aid } = req.query;
//     if (!aid) {
//     return res.status(400).json({ 
//         code: 400, 
//         message: '缺少必要参数：aid' 
//     });
//     }

//     // 调用B站API获取视频信息
//     const response = await axios.get('https://api.bilibili.com/x/web-interface/view', {
//     params: {
//         aid,
//         jsonp: 'jsonp'
//     },
//     headers: {
//         Cookie: `SESSDATA=${SESSDATA}`,
//         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
//     }
//     });

//     res.json(response.data);
// } catch (error) {
//     console.error('获取视频信息失败:', error);
//     res.status(500).json({ 
//     code: 500, 
//     message: '获取视频信息失败' 
//     });
// }
// });

/**
 * @desc 获取音频流URL
 * @route   GET /api/info/audio/url
 * @param {number} avid - 视频avid
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

    const { avid, cid } = req.query;
    if (!avid || !cid) {
    return res.status(400).json({ 
        code: 400, 
        message: '缺少必要参数：avid 或 cid' 
    });
    }

    // 调用B站API获取音频流信息
    const response = await axios.get('https://api.bilibili.com/x/player/playurl', {
    params: {
        avid,
        cid,
        fnval: 16, // 获取DASH格式
    },
    headers: {
        Cookie: `SESSDATA=${SESSDATA}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    });

    res.json({
      code: response.data.code,
      message: response.data.message,
      ttl: response.data.ttl,
      data: response.data.data.dash.audio
    });
} catch (error) {
    console.error('获取音频流URL失败:', error);
    res.status(500).json({ 
    code: 500, 
    message: '获取音频流URL失败' 
    });
}
});

export default router;