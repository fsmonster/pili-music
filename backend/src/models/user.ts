import mongoose, { Schema } from 'mongoose';
import { IUser } from '../types/models.ts';

/**
 * 用户模型 - 只存储基本信息，不存储敏感凭证
 */
const UserSchema = new Schema<IUser>({
  // 用户基本信息
  userId: { 
    type: String, 
    required: true, 
    unique: true 
  }, // B站用户ID
  mid: { 
    type: String, 
    required: true 
  }, // B站mid
  username: { 
    type: String, 
    required: true 
  }, // 用户名
  avatar: { 
    type: String 
  }, // 头像URL
  
  // 认证信息
  accessToken: {
    type: String
  },
  refreshToken: {
    type: String
  },
  tokenExpiry: {
    type: Date
  },
  
  // 登录信息
  lastLogin: { 
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
const User = mongoose.model<IUser>('User', UserSchema);

export default User;
