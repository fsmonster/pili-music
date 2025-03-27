import express, { Request, Response } from 'express';
import axios from 'axios';
import authMiddleware from '../middleware/auth.js';
import { AuthRequest } from '../types/index.js';
import { getHeaders } from '../utils/getHeader.js';

const router = express.Router();

/**
 * @describe 查看视频分p信息， avid/bvid转cid，cid表示当前分p
 * @route   GET /api/audioInfo/player/pagelist
 * @param {string} bvid - 视频bvid
 * @param {number} aid - 视频aid
 * @returns {Object} 视频分p信息
 * @access Public - 不需要认证
 */
// router.get('/player/pagelist', async (req: Request, res: Response) => {
//   try {
//     const { aid, bvid } = req.query;
    
//     if(!aid && !bvid) {
//       return res.status(400).json({ 
//         code: 400, 
//         message: '缺少必要参数：aid 或 bvid' 
//       });
//     }
    
//     let xid = aid ? 'aid' : 'bvid';
//     let id = aid ?? bvid;
    
//     // 调用B站API获取视频信息
//     const response = await axios.get('https://api.bilibili.com/x/player/pagelist', {
//       params: {
//         [xid]: id,
//       },
//       headers: {
//         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
//         'Referer': 'https://www.bilibili.com'
//       }
//     });
    
//     res.json(response.data);
//   } catch (error) {
//     console.error('获取视频分P列表失败:', error);
//     res.status(500).json({ 
//       code: 500, 
//       message: '获取视频分P列表失败' 
//     });
//   }
// });
  
// 应用认证中间件到需要认证的路由
router.use(authMiddleware);

/**
 * @desc 获取音频流URL
 * @route   GET /api/audioInfo/audio/url
 * @param {number} avid - 视频avid
 * @param {number} cid - 视频cid
 * @returns {Object} 音频流信息
 * @access Private - 需要JWT认证
 */
router.get('/audio/url', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        code: 401, 
        message: '未授权访问' 
      });
    }
    
    const { sessdata } = req.user;
    
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
      headers: getHeaders(sessdata)
    });
    
    // 判断是否为充电视频
    if(response.data.data.accept_description[0] === '试看') {
      return res.json({ 
        code: 403, 
        status: 403,
        message: '该视频为充电视频内容，无法获取音频流',
        data: null
      });
    }

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
