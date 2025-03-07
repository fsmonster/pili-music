import mongoose from 'mongoose';

/**
 * 用户模型 - 只存储基本信息，不存储敏感凭证
 */
const UserSchema = new mongoose.Schema({
  // 用户基本信息
  uid: { 
    type: String, 
    required: true, 
    unique: true 
  }, // B站用户ID
  username: { 
    type: String, 
    required: true 
  }, // 用户名
  avatar: { 
    type: String 
  }, // 头像URL
  
  // 用户偏好设置
  preferences: {
    theme: { 
      type: String, 
      default: 'light' 
    }, // 主题偏好
    volume: { 
      type: Number, 
      default: 0.7 
    }, // 音量设置
    quality: { 
      type: String, 
      default: 'standard' 
    } // 音质偏好
  },
  
  // 收藏夹和合集显示设置
  displayFavoriteIds: [{ 
    type: Number 
  }], // 要显示的收藏夹ID列表
  displaySeasonIds: [{ 
    type: Number 
  }], // 要显示的合集ID列表
  
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
UserSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// 创建并导出用户模型
const User = mongoose.model('User', UserSchema);

export default User;
