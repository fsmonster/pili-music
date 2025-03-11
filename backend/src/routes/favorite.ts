import express, { Request, Response } from 'express';
import axios from 'axios';
import authMiddleware from '../middleware/auth.js';
import { AuthRequest } from '../types/index.js';

const router = express.Router();

// 应用认证中间件到所有路由
router.use(authMiddleware);

/**
 * @route   GET /api/favorite/list
 * @desc    获取用户收藏夹列表
 * @param {number} up_mid - 用户uid
 * @access  Private - 需要JWT认证
 */
router.get('/list', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        code: 401, 
        message: '未授权访问' 
      });
    }

    const { up_mid } = req.query;   
    const { sessdata } = req.user;
    console.log("up_mid", up_mid, "sessdata", sessdata);
    
    
    // 调用B站API获取收藏夹列表
    const response = await axios.get('https://api.bilibili.com/x/v3/fav/folder/created/list-all', {
      params: {
        up_mid
      },
      headers: {
        Cookie: `SESSDATA=${sessdata}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.bilibili.com'
      }
    });

    console.log(response.data);    

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
 * @desc    获取收藏夹信息
 * @param {number} media_id - 收藏夹ID
 * @access  Private - 需要JWT认证
 */
router.get('/folder/info', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        code: 401, 
        message: '未授权访问' 
      });
    }
    
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
router.get('/resource/list', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        code: 401, 
        message: '未授权访问' 
      });
    }
    
    const { sessdata } = req.user;
    
    const { media_id, ps, pn, keyword = '', order = 'mtime'} = req.query;
    
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
// router.get('/resource/ids', async (req: AuthRequest, res: Response) => {
//   try {
//     if (!req.user) {
//       return res.status(401).json({ 
//         code: 401, 
//         message: '未授权访问' 
//       });
//     }
    
//     const { sessdata } = req.user;
    
//     const { media_id } = req.query;
//     if (!media_id) {
//       return res.status(400).json({ 
//         code: 400, 
//         message: '缺少必要参数media_id' 
//       });
//     }

//     const response = await axios.get('https://api.bilibili.com/x/v3/fav/resource/ids', {
//       params: {
//         media_id,
//         jsonp: 'jsonp'
//       },
//       headers: {
//         Cookie: `SESSDATA=${sessdata}`,
//         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
//         'Referer': 'https://www.bilibili.com'
//       }
//     });

//     res.json(response.data);
//   } catch (error) {
//     console.error('获取收藏夹资源ID列表失败:', error);
//     res.status(500).json({ 
//       code: 500, 
//       message: '获取收藏夹资源ID列表失败' 
//     });
//   }
// });

export default router;
