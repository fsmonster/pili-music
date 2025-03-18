import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 导入数据库连接
import { connectDB } from './models/db.js';

// 导入路由
import authRoutes from './routes/auth.js';
import favoriteRoutes from './routes/favorite.js'; // 收藏夹路由
import seasonRoutes from './routes/season.js'; // 合集路由
import infoRoutes from './routes/audioInfo.js'; // 音频信息路由
import playRoutes from './routes/play.js'; // 音频代理路由
import userRoutes from './routes/user.js'; // 用户路由
import sectionRoutes from './routes/section.js'; // 自定义路由

const app = express();
const PORT: number = parseInt(process.env.PORT || '3000', 10);

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
app.use('/api/audioInfo', infoRoutes); // 注册音频信息路由
app.use('/api/play', playRoutes); // 注册音频代理路由
app.use('/api/user', userRoutes); // 注册用户路由
app.use('/api/section', sectionRoutes); // 注册自定义路由

// B站API代理
const biliProxyOptions: Options = {
  target: 'https://api.bilibili.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api/bilibili': ''
  },
  onProxyReq: (proxyReq, _req, _res) => {
    // 设置必要的请求头
    proxyReq.setHeader('Referer', 'https://www.bilibili.com');
    proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  },
  onError: (err, _req, res) => {
    console.error('代理请求错误:', err);
    res.status(500).json({ 
      code: 500, 
      message: '代理请求失败' 
    });
  }
};

app.use('/api/bilibili', createProxyMiddleware(biliProxyOptions));

// 健康检查端点 - 用于监控
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// 错误处理中间件
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, async () => {
  console.log(`服务器运行在端口 ${PORT}`);
  
  // 连接到MongoDB数据库
  try {
    await connectDB();
    console.log('成功连接到MongoDB数据库');
  } catch (error) {
    console.error('MongoDB数据库连接失败:', error instanceof Error ? error.message : String(error));
  }
});
