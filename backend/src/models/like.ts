import mongoose, { Schema } from 'mongoose';
import { ILike } from '../types/models.js';

/**
 * 我的喜欢模型 - 用户在应用内标记喜欢的歌曲
 */
const LikeSchema = new Schema<ILike>({
  // 关联用户
  mid: { 
    type: String, 
    required: true 
  }, // B站用户ID
  
  // 媒体基本信息 (只存储必要信息)
  bvid: { 
    type: String, 
    required: true 
  }, // B站视频ID
  avid: { 
    type: Number 
  }, // B站av号
  cid: { 
    type: Number 
  }, // B站cid
  
  // 喜欢信息
  likedAt: { 
    type: Date, 
    default: Date.now 
  } // 喜欢时间
}, {
  timestamps: true // 自动管理createdAt和updatedAt字段
});

// 设置复合唯一索引，确保每个用户对每个视频只有一个喜欢记录
LikeSchema.index({ mid: 1,avid: 1, bvid: 1, cid: 1 }, { unique: true });

// 创建并导出我的喜欢模型
const Like = mongoose.model<ILike>('Like', LikeSchema);

export default Like;
