import express from 'express';
import axios from 'axios';
const router = express.Router();

/**
 * @desc 音频流代理接口
 * @param {string} url - 音频URL
 * @param {string} range - 前端传来的 Range 头，用于支持 Range 请求
 * @returns {stream} - 音频流
 */
router.get("/url", async (req, res) => {
  const { url } = req.query;
  const range = req.headers.range; // 获取前端传来的 Range 头

  if (!url) {
    return res.status(400).json({ error: "缺少音频URL参数" });
  }

  try {
    // 设置请求头，支持 Range 请求
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      Referer: "https://www.bilibili.com",
    };
    if (range) {
      headers.Range = range; // 透传前端的 Range 请求头
    }

    // 发起请求获取音频流
    const audioStreamResponse = await axios.get(url, {
      responseType: "stream",
      headers,
    });

    // 透传 B 站返回的 Content-Range
    if (audioStreamResponse.headers["content-range"]) {
      res.set("Content-Range", audioStreamResponse.headers["content-range"]);
      res.status(206); // 部分内容响应
    } else {
      res.status(200); // 全量内容响应
    }

    // 设置其他响应头
    res.set("Content-Type", "audio/mp4");
    if (audioStreamResponse.headers["content-length"]) {
      res.set("Content-Length", audioStreamResponse.headers["content-length"]);
    }
    
    // 传输音频流
    audioStreamResponse.data.pipe(res);
  } catch (error) {
    console.error("获取音频流失败:", error.message);
    res.status(500).json({ error: "获取音频流失败" });
  }
});

export default router;
