import express from 'express';
import axios from 'axios';
const router = express.Router();

/**
 * 音频流代理接口
 * 接收音频URL参数，获取音频流并返回给前端
 */
router.get('/url', async (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: '缺少音频URL参数' });
  }

  try {
    console.log('❤❤❤获取音频流:', url);
    
    const audioStreamResponse = await axios.get(url, {
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.bilibili.com',
      },
    });

    // 设置响应头
    res.set('Content-Type', 'audio/mp4');
    if (audioStreamResponse.headers['content-length']) {
      res.set('Content-Length', audioStreamResponse.headers['content-length']);
    }
    
    // 将音频流管道传输到响应
    audioStreamResponse.data.pipe(res);
  } catch (error) {
    console.error('获取音频流失败:', error.message);
    res.status(500).json({ error: '获取音频流失败' });
  }
});

export default router;
