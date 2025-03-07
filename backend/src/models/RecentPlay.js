import mongoose from 'mongoose';

/**
 * 最近播放记录模型 - 只保留最近100条记录
 */
const RecentPlaySchema = new mongoose.Schema({
  // 关联用户
  userId: { 
    type: String, 
    required: true,
    index: true
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
  
  // 上次播放信息
  playedAt: { 
    type: Date, 
    default: Date.now 
  }, // 播放时间
  progress: { 
    type: Number, 
    default: 0 
  }, // 播放进度(秒)
  
  // UP主信息
  upper: {
    uid: { 
      type: String 
    }, // UP主ID
    name: { 
      type: String 
    } // UP主名称
  }
}, {
  timestamps: true // 自动管理createdAt和updatedAt字段
});

// 设置索引，按用户ID和播放时间排序
RecentPlaySchema.index({ userId: 1, playedAt: -1 });

/**
 * 保存前钩子 - 确保每个用户最多只有100条最近播放记录
 */
RecentPlaySchema.pre('save', async function(next) {
  try {
    // 如果是新记录，检查并删除多余的记录
    if (this.isNew) {
      const count = await this.constructor.countDocuments({ userId: this.userId });
      if (count >= 100) {
        // 查找并删除最早的记录，直到总数小于100
        const oldestRecords = await this.constructor.find({ userId: this.userId })
          .sort({ playedAt: 1 })
          .limit(count - 99);
        
        if (oldestRecords.length > 0) {
          const oldestIds = oldestRecords.map(record => record._id);
          await this.constructor.deleteMany({ _id: { $in: oldestIds } });
        }
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

// 创建并导出最近播放记录模型
const RecentPlay = mongoose.model('RecentPlay', RecentPlaySchema);

export default RecentPlay;
