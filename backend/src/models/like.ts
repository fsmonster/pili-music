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
  aid: { 
    type: Number 
  }, // B站av号
  cid: { 
    type: Number 
  }, // B站cid
  title: { 
    type: String, 
    required: true 
  }, // 标题
  cover: { 
    type: String 
  }, // 封面图URL
  duration: { 
    type: Number 
  }, // 时长(秒)
  
  // UP主信息
  upper: {
    mid: { 
      type: String 
    }, // UP主ID
    name: { 
      type: String 
    } // UP主名称
  },
  
  // 喜欢信息
  likedAt: { 
    type: Date, 
    default: Date.now 
  } // 喜欢时间
}, {
  timestamps: true // 自动管理createdAt和updatedAt字段
});

// 设置复合唯一索引，确保每个用户对每个视频只有一个喜欢记录
LikeSchema.index({ mid: 1, bvid: 1 }, { unique: true });

// 创建并导出我的喜欢模型
const Like = mongoose.model<ILike>('Like', LikeSchema);

export default Like;
