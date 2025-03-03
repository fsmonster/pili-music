import express from 'express';
import axios from 'axios';

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
    res.status(500).json({ error: '获取二维码失败' });
  }
});

/**
 * @desc 查询扫码状态
 * @route GET /api/auth/qrcode/status
 * @access Public
 * @param {string} qrcode_key - 二维码 key
 * @returns {Object} 登录状态
 */
router.get('/qrcode/status', async (req, res) => {
  const { qrcode_key } = req.query;
  if (!qrcode_key) {
    return res.status(400).json({ error: '缺少必要参数' });
  }

  try {
    const response = await axios.get('https://passport.bilibili.com/x/passport-login/web/qrcode/poll', {
      params: { qrcode_key }
    });

    // 如果登录成功，处理 Cookie
    if (response.data.code === 0 && response.headers['set-cookie']) {
      // 将 B 站返回的 Cookie 传递给前端
      const cookies = response.headers['set-cookie'].map(cookie => {
        // 修改 cookie 的 domain 和 path
        return cookie
          .replace(/Domain=[^;]+/, 'Domain=localhost')
          .replace(/Path=[^;]+/, 'Path=/')
          .replace(/SameSite=[^;]+/, 'SameSite=Lax');
      });

      cookies.forEach(cookie => {
        res.append('Set-Cookie', cookie);
      });
    }

    res.json(response.data);
  } catch (error) {
    console.error('查询扫码状态失败:', error);
    res.status(500).json({ error: '查询扫码状态失败' });
  }
});

/**
 * @desc 获取用户信息
 * @route GET /api/auth/user/info
 * @access Private
 * @returns {Object} 用户信息
 */
router.get('/user/info', async (req, res) => {
  // 从请求中获取 SESSDATA
  const sessdata = req.cookies.SESSDATA;
  
  if (!sessdata) {
    return res.status(401).json({ error: '未登录' });
  }

  try {
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
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

export default router;
