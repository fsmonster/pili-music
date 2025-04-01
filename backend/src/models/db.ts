import mongoose from 'mongoose';
import dotenv from 'dotenv';
import config from '../config/index.js';

// 加载环境变量
dotenv.config();

// 环境变量
const { env, db } = config;

/**
 * 连接MongoDB数据库
 * @param uri 可选的数据库连接字符串，如果不提供则使用环境变量中的配置
 */
export const connectDB = async (uri?: string): Promise<void> => {
  try {
    const mongoURI = uri || db.uri;
    console.log(`正在连接到数据库: ${mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`); // 隐藏敏感信息
    
    await mongoose.connect(mongoURI, db.options);
    
    console.log(`MongoDB数据库连接成功 (${env.nodeEnv}环境)`);
  } catch (error) {
    const err = error as Error;
    console.error('MongoDB数据库连接失败:', err.message);
    
    // 在生产环境中不要立即退出，而是记录错误并尝试恢复
    if (!env.isProduction) {
      process.exit(1);
    }
  }
};

/**
 * 关闭MongoDB数据库连接
 */
export const closeDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB数据库连接已关闭');
  } catch (error) {
    const err = error as Error;
    console.error('关闭MongoDB数据库连接失败:', err.message);
  }
};

// 监听连接事件
mongoose.connection.on('connected', () => {
  console.log('Mongoose已连接到MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose连接错误:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose已断开与MongoDB的连接');
});

// 应用关闭时关闭数据库连接
process.on('SIGINT', async () => {
  await closeDB();
  process.exit(0);
});
