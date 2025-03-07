import mongoose from 'mongoose';

/**
 * 自建歌单模型 - 用户在应用内创建的歌单
 */
const CustomPlaylistSchema = new mongoose.Schema({
  // 歌单基本信息
  title: { 
    type: String, 
    required: true 
  }, // 歌单标题
  cover: { 
    type: String 
  }, // 封面图URL
  description: { 
    type: String 
  }, // 描述
  
  // 关联用户
  userId: { 
    type: String, 
    required: true,
    index: true
  }, // B站用户ID
  
  // 包含的媒体
  mediaItems: [{
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
  }],
  
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true // 自动管理createdAt和updatedAt字段
});

// 更新前自动更新updatedAt字段
CustomPlaylistSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// 创建并导出自建歌单模型
const CustomPlaylist = mongoose.model('CustomPlaylist', CustomPlaylistSchema);

export default CustomPlaylist;
