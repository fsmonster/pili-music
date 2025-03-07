import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { createProxyMiddleware } from 'http-proxy-middleware';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import favoriteRoutes from './routes/favorite.js'; // 新增收藏夹路由
import seasonRoutes from './routes/season.js'; // 新增合集路由
import infoRoutes from './routes/info.js'; // 新增视频信息路由
import playRoutes from './routes/play.js'; // 新增音频代理路由

const app = express();
const PORT = process.env.PORT || 3000;

// 环境变量
// const NODE_ENV = process.env.NODE_ENV || 'development';
// const CORS_ORIGIN = NODE_ENV === 'production' 
//   ? ['https://your-zeabur-domain.zeabur.app', 'http://localhost', 'http://localhost:80'] 
//   : 'http://localhost:5173';

// 基础中间件
app.use(cors({
  origin: true,
  credentials: true // 允许跨域携带 cookie
}));
app.use(helmet({
  contentSecurityPolicy: false, // 在生产环境中可能需要配置CSP
  crossOriginEmbedderPolicy: false
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 限制每个IP在windowMs内最多100个请求
});
app.use(limiter);

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/favorite', favoriteRoutes); // 注册收藏夹路由
app.use('/api/season', seasonRoutes); // 注册合集路由
app.use('/api/info', infoRoutes); // 注册视频信息路由
app.use('/api/play', playRoutes); // 注册音频代理路由

// B站API代理
const biliProxy = createProxyMiddleware({
  target: 'https://api.bilibili.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api/bilibili': ''
  },
  onProxyReq: (proxyReq, req, res) => {
    // 转发Cookie
    if (req.headers.cookie) {
      proxyReq.setHeader('Cookie', req.headers.cookie);
    }
    // 设置必要的请求头
    proxyReq.setHeader('Referer', 'https://www.bilibili.com');
    proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  }
});

app.use('/api/bilibili', biliProxy);

// 健康检查端点 - 用于Zeabur监控
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in development mode`);
});
