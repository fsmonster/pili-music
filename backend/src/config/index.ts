import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 根据环境加载不同的 .env 文件
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

// 环境变量
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';
const isDevelopment = NODE_ENV === 'development';

// 配置对象
const config = {
  // 环境
  env: {
    isProduction,
    isDevelopment,
    nodeEnv: NODE_ENV,
  },
  
  // 服务器配置
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  },
  
  // 数据库配置
  db: {
    uri: isProduction
      ? process.env.MONGODB_URI_PROD
      : process.env.MONGODB_URI || 'mongodb://localhost:27017/bilibili-music',
    options: {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  },
  
  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'default_jwt_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  // 速率限制配置
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || (isProduction ? '300' : '500'), 10),
    standardHeaders: isProduction,
    legacyHeaders: !isProduction,
  },
  
  // B站API配置
  bilibili: {
    apiBaseUrl: process.env.BILIBILI_API_BASE_URL || 'https://api.bilibili.com',
    cookie: process.env.BILIBILI_COOKIE || '',
  },
  
  // 日志配置
  log: {
    level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  },
};

export default config;
