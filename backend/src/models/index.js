// 导出所有模型，方便统一引入
import User from './User.js';
import CustomPlaylist from './CustomPlaylist.js';
import RecentPlay from './RecentPlay.js';
import Like from './Like.js';
import { connectDB, closeDB } from './db.js';

export {
  User,
  CustomPlaylist,
  RecentPlay,
  Like,
  connectDB,
  closeDB
};
