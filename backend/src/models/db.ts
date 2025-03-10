import mongoose from 'mongoose';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// MongoDB连接URI
const MONGODB_URI: string = process.env.MONGODB_URI || 'mongodb://localhost:27017/bilibili-music';

/**
 * 连接MongoDB数据库
 */
export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB数据库连接成功');
  } catch (error) {
    const err = error as Error;
    console.error('MongoDB数据库连接失败:', err.message);
    process.exit(1);
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
