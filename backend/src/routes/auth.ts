import express, { Request, Response } from 'express';
import axios from 'axios';
import { authMiddleware, generateToken, verifyToken } from '../middleware/auth.js';
import * as userController from '../controllers/userController.js';
import { ApiResponse, AuthRequest, JwtPayload, BilibiliUserData, QRCodeStatusData } from '../types/index.js';
import { getHeaders } from '../utils/getHeader.js';

const router = express.Router();
/**
 * @desc 获取二维码
 * @route GET /api/auth/qrcode
 * @access Public
 * @returns {Object} 二维码数据
 */
router.get('/qrcode', async (req: Request, res: Response) => {
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
router.get('/qrcode/status', async (req: Request, res: Response) => {
  const { qrcode_key } = req.query;
  if (!qrcode_key) {
    return res.status(400).json({ 
      code: 400, 
      message: '缺少必要参数' 
    });
  }

  try {
    const response = await axios.get<ApiResponse<QRCodeStatusData>>('https://passport.bilibili.com/x/passport-login/web/qrcode/poll', {
      params: { qrcode_key }
    });

    // 如果登录成功，生成JWT令牌
    if(response.data.code === 0 && response.headers['set-cookie']) {
      // 从Cookie中提取SESSDATA
      const cookies = response.headers['set-cookie'] as string[];
      let sessdata = '';
      let dedeUserID = '';
      let dedeUserID__ckMd5 = '';
      let bili_jct = '';
      
      // 遍历所有cookie
      for (const cookie of cookies) {
        // 提取SESSDATA
        if (cookie.includes('SESSDATA=')) {
          const match = cookie.match(/SESSDATA=([^;]+)/);
          if (match && match[1]) {
            sessdata = match[1];
          }
        }
        
        // 提取DedeUserID
        else if (cookie.includes('DedeUserID=')) {
          const match = cookie.match(/DedeUserID=([^;]+)/);
          if (match && match[1]) {
            dedeUserID = match[1];
          }
        }
        
        // 提取DedeUserID__ckMd5
        else if (cookie.includes('DedeUserID__ckMd5=')) {
          const match = cookie.match(/DedeUserID__ckMd5=([^;]+)/);
          if (match && match[1]) {
            dedeUserID__ckMd5 = match[1];
          }
        }
        
        // 提取bili_jct
        else if (cookie.includes('bili_jct=')) {
          const match = cookie.match(/bili_jct=([^;]+)/);
          if (match && match[1]) {
            bili_jct = match[1];
          }
        }
      }
      
      // 验证是否获取了所有必要信息
      if (!sessdata || !dedeUserID || !dedeUserID__ckMd5 || !bili_jct) {
        throw new Error('无法获取完整的登录凭证');
      }
      
      // 生成JWT令牌，包含用户ID和SESSDATA
      const token = generateToken({
        mid: Number(dedeUserID),
        sessdata: sessdata,
        ckMd5: dedeUserID__ckMd5,
        biliJct: bili_jct
      });
          
      // 返回JWT令牌和用户信息
      return res.json({
        code: 0,
        message: '登录成功',
        data: {
          code: response.data.data.code,
          token,
          mid: dedeUserID
        }
      });
    }
    
    // 如果不是登录成功状态，直接返回B站API的状态码和消息
    return res.json({
      code: 0,
      message: '查询成功',
      data: {
        code: response.data.data.code,
        message: response.data.data.message || response.data.message
      }
    });
  } catch (error) {
    console.error('查询扫码状态失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '查询扫码状态失败' 
    });
  }
});

// 鉴权中间件
router.use(authMiddleware);

/**
 * @desc 获取用户信息
 * @route GET /api/auth/user/info
 * @access Private
 * @returns {Object} 用户信息 - 包含B站API返回的信息
 */
router.get('/user/info', async (req: AuthRequest, res: Response) => {
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
    
    // 解析令牌获取用户信息
    let decoded: JwtPayload | null = null;
    try {
      // 首先尝试使用verifyToken函数验证
      decoded = verifyToken(token);
      
      // 如果验证失败，尝试使用Base64解码
      if (!decoded) {
        decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      }
    } catch (e) {
      return res.status(401).json({ 
        code: 401, 
        message: '无效的认证令牌' 
      });
    }
    
    if (!decoded || !decoded.sessdata) {
      return res.status(401).json({ 
        code: 401, 
        message: '认证令牌中缺少必要信息' 
      });
    }
    
    const { sessdata } = decoded;

    // 调用B站API获取用户信息
    const response = await axios.get<ApiResponse<BilibiliUserData>>('https://api.bilibili.com/x/web-interface/nav', {
      headers: getHeaders(sessdata)
    });

    if (response.data.code === 0 && response.data.data) {
      const userData = response.data.data;   
      
      // 保存用户信息到MongoDB
      const user = await userController.saveUserInfo(userData);
      
      // 返回合并后的用户信息
      return res.json({
        code: 0,
        data: userData
      });
    } else {
      // 如果B站API返回错误，直接返回原始响应
      return res.json(response.data);
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '获取用户信息失败' 
    });
  }
});

/**
 * @desc 验证JWT令牌是否过期
 * @route POST /api/auth/validate
 * @access Private
 * @returns Boolean - 是否过期
 */
router.post('/validate', async (req: AuthRequest, res: Response) => {
  // 从请求头中获取认证令牌
  const sessdata = req.auth?.sessdata;
  
  try {
    // 验证SESSDATA是否仍然有效
    try {
      const response = await axios.get('https://api.bilibili.com/x/web-interface/nav', {
        headers: getHeaders(sessdata)
      });
      if (response.data.code !== 0) {
        return res.status(401).json({ 
          code: 401, 
          data: true,
          message: 'SESSDATA已过期' 
        });
      }
    } catch (e) {
      return res.status(401).json({ 
        code: 401, 
        message: '无效的认证令牌' 
      });
    }

    res.json({
      code: 0,
      data: false
    });
  } catch (error) {
    console.error('验证令牌失败:', error);
    res.status(500).json({ 
      code: 500, 
      message: '验证令牌失败' 
    });
  }
});

export default router;
