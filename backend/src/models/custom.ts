import mongoose, { Schema } from 'mongoose';
import { ICustomPlaylist, IPlaylistItem } from '../types/models.ts';

/**
 * 自建歌单模型 - 用户在应用内创建的歌单
 */
const CustomPlaylistSchema = new Schema<ICustomPlaylist>({
  // 歌单基本信息
  name: { 
    type: String, 
    required: true 
  }, // 歌单标题
  description: { 
    type: String 
  }, // 描述
  cover: { 
    type: String 
  }, // 封面图URL
  isPublic: {
    type: Boolean,
    default: false
  }, // 是否公开
  
  // 关联用户
  userId: { 
    type: String, 
    required: true,
    index: true
  }, // B站用户ID
  
  // 包含的媒体
  items: [{
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
    upper: {
      uid: { 
        type: String 
      }, // UP主ID
      name: { 
        type: String 
      } // UP主名称
    },
    addedAt: {
      type: Date,
      default: Date.now
    } // 添加到歌单的时间
  }]
}, {
  timestamps: true // 自动管理createdAt和updatedAt字段
});

// 更新前自动更新updatedAt字段
CustomPlaylistSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// 创建并导出自建歌单模型
const CustomPlaylist = mongoose.model<ICustomPlaylist>('CustomPlaylist', CustomPlaylistSchema);

export default CustomPlaylist;
