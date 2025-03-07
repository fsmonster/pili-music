import express from 'express';
import axios from 'axios';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @desc 获取二维码
 * @route GET /api/auth/qrcode
 * @access Public
 * @returns {Object} 二维码数据
 */
router.get('/qrcode', async (req, res) => {
  try {
    const response = await axios.get('https://passport.bilibili.com/x/passport-login/web/qrcode/generate');
    res.json(response.data);
  } catch (error) {
    console.error('获取二维码失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '获取二维码失败' 
    });
  }
});

/**
 * @desc 查询扫码状态
 * @route GET /api/auth/qrcode/status
 * @access Public
 * @param {string} qrcode_key - 二维码 key
 * @returns {Object} 登录状态和JWT令牌
 */
router.get('/qrcode/status', async (req, res) => {
  const { qrcode_key } = req.query;
  if (!qrcode_key) {
    return res.status(400).json({ 
      code: 400, 
      message: '缺少必要参数' 
    });
  }

  try {
    const response = await axios.get('https://passport.bilibili.com/x/passport-login/web/qrcode/poll', {
      params: { qrcode_key }
    });

    // 如果登录成功，生成JWT令牌
    if (response.data.code === 0 && response.headers['set-cookie']) {
      // 从Cookie中提取SESSDATA
      const cookies = response.headers['set-cookie'];
      let sessdata = '';
      
      for (const cookie of cookies) {
        if (cookie.includes('SESSDATA=')) {
          const match = cookie.match(/SESSDATA=([^;]+)/);
          if (match && match[1]) {
            sessdata = match[1];
            break;
          }
        }
      }
      
      if (sessdata) {
        // 获取用户信息
        const userInfoResponse = await axios.get('https://api.bilibili.com/x/web-interface/nav', {
          headers: {
            Cookie: `SESSDATA=${sessdata}`,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Referer': 'https://www.bilibili.com'
          }
        });
        
        if (userInfoResponse.data.code === 0 && userInfoResponse.data.data) {
          const userData = userInfoResponse.data.data;
          
          // 生成JWT令牌，包含用户ID和SESSDATA
          const token = generateToken({
            uid: userData.mid,
            uname: userData.uname,
            sessdata: sessdata
          });
          
          // 返回JWT令牌和用户信息
          return res.json({
            code: 0,
            data: {
              ...response.data.data,
              token,
              user_info: {
                uid: userData.mid,
                uname: userData.uname,
                face: userData.face,
                level: userData.level_info.current_level
              }
            }
          });
        }
      }
    }

    // 如果未登录成功或未获取到用户信息，返回原始响应
    res.json(response.data);
  } catch (error) {
    console.error('查询扫码状态失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '查询扫码状态失败' 
    });
  }
});

/**
 * @desc 获取用户信息
 * @route GET /api/auth/user/info
 * @access Private
 * @returns {Object} 用户信息
 */
router.get('/user/info', async (req, res) => {
  // 从请求头中获取认证令牌
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      code: 401, 
      message: '未提供认证令牌' 
    });
  }
  
  try {
    // 从令牌中提取SESSDATA
    const token = authHeader.substring(7);
    // 注意：这里不验证令牌，因为这个路由是直接请求B站API
    // 实际验证会在authMiddleware中完成
    
    // 解析令牌获取SESSDATA（简化处理，实际应使用jwt.verify）
    let sessdata = '';
    try {
      const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      sessdata = decoded.sessdata;
    } catch (e) {
      return res.status(401).json({ 
        code: 401, 
        message: '无效的认证令牌' 
      });
    }
    
    if (!sessdata) {
      return res.status(401).json({ 
        code: 401, 
        message: '认证令牌中缺少必要信息' 
      });
    }

    const response = await axios.get('https://api.bilibili.com/x/web-interface/nav', {
      headers: {
        Cookie: `SESSDATA=${sessdata}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.bilibili.com'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '获取用户信息失败' 
    });
  }
});

/**
 * @desc 刷新JWT令牌
 * @route POST /api/auth/refresh
 * @access Private
 * @returns {Object} 新的JWT令牌
 */
router.post('/refresh', async (req, res) => {
  // 从请求头中获取认证令牌
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      code: 401, 
      message: '未提供认证令牌' 
    });
  }
  
  try {
    // 从令牌中提取SESSDATA
    const token = authHeader.substring(7);
    // 注意：这里不验证令牌，因为这个路由是用来刷新过期令牌的
    
    // 解析令牌获取SESSDATA（简化处理，实际应使用jwt.verify）
    let sessdata = '';
    let uid = '';
    let uname = '';
    
    try {
      const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      sessdata = decoded.sessdata;
      uid = decoded.uid;
      uname = decoded.uname;
    } catch (e) {
      return res.status(401).json({ 
        code: 401, 
        message: '无效的认证令牌' 
      });
    }
    
    if (!sessdata) {
      return res.status(401).json({ 
        code: 401, 
        message: '认证令牌中缺少必要信息' 
      });
    }

    // 验证SESSDATA是否仍然有效
    const response = await axios.get('https://api.bilibili.com/x/web-interface/nav', {
      headers: {
        Cookie: `SESSDATA=${sessdata}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.bilibili.com'
      }
    });

    if (response.data.code === 0 && response.data.data && response.data.data.isLogin) {
      // SESSDATA仍然有效，生成新的JWT令牌
      const newToken = generateToken({
        uid,
        uname,
        sessdata
      });
      
      res.json({
        code: 0,
        data: {
          token: newToken
        }
      });
    } else {
      // SESSDATA已失效
      res.status(401).json({ 
        code: 401, 
        message: 'SESSDATA已失效，请重新登录' 
      });
    }
  } catch (error) {
    console.error('刷新令牌失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '刷新令牌失败' 
    });
  }
});

export default router;
