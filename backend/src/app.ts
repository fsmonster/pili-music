import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 导入配置
import config from './config/index.js';
const { env, server, rateLimit: rateLimitConfig, db } = config;

// 导入数据库连接
import { connectDB } from './models/db.js';

// 导入路由
import authRoutes from './routes/auth.js';
import favoriteRoutes from './routes/favorite.js'; // 收藏夹路由
import seasonRoutes from './routes/season.js'; // 合集路由
import sectionRoutes from './routes/section.js'; // 自定义路由
import seriesRoutes from './routes/series.js'; // 系列路由
import infoRoutes from './routes/audioInfo.js'; // 音频信息路由
import playRoutes from './routes/play.js'; // 音频代理路由
import userRoutes from './routes/user.js'; // 用户路由

const app = express();
const PORT: number = server.port;

console.log(`当前运行环境: ${env.nodeEnv}`);

// 基础中间件
app.use(cors({
  origin: env.isProduction 
    ? server.allowedOrigins
    : true,
  credentials: true // 允许跨域携带 cookie
}));

app.use(helmet({
  contentSecurityPolicy: env.isProduction, // 生产环境启用 CSP
  crossOriginEmbedderPolicy: false
}));

// 根据环境配置日志
app.use(morgan(env.isDevelopment ? 'dev' : 'combined'));
app.use(express.json());
// app.use(cookieParser());

// 速率限制 - 根据环境设置不同的限制
const limiter = rateLimit({
  windowMs: rateLimitConfig.windowMs,
  max: rateLimitConfig.max,
  standardHeaders: rateLimitConfig.standardHeaders,
  legacyHeaders: rateLimitConfig.legacyHeaders
});
app.use(limiter);

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/favorite', favoriteRoutes); // 注册收藏夹路由
app.use('/api/season', seasonRoutes); // 注册合集路由
app.use('/api/section', sectionRoutes); // 注册自定义路由
app.use('/api/series', seriesRoutes); // 注册系列路由
app.use('/api/audioInfo', infoRoutes); // 注册音频信息路由
app.use('/api/play', playRoutes); // 注册音频代理路由
app.use('/api/user', userRoutes); // 注册用户路由

// 健康检查端点 - 用于监控
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'ok',
    environment: env.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

// 错误处理中间件
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: env.isProduction ? 'Internal Server Error' : err.message,
    stack: env.isProduction ? undefined : err.stack
  });
});

app.listen(PORT, async () => {
  console.log(`服务器运行在端口 ${PORT} (${env.nodeEnv}环境)`);
  
  // 连接到MongoDB数据库
  try {
    await connectDB(db.uri);
    console.log('成功连接到MongoDB数据库');
  } catch (error) {
    console.error('MongoDB数据库连接失败:', error instanceof Error ? error.message : String(error));
  }
});
