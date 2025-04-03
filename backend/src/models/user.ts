import mongoose, { Schema } from 'mongoose';

/**
 * 用户偏好设置接口
 */
export interface UserPreferences {
  theme?: string;
  audioQuality?: string;
  [key: string]: any;
}

/**
 * 用户模型接口
 */
export interface IUser extends Document {
  mid: number;
  username: string;
  avatar: string;
  isLogin: boolean;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: Date;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
  preferences?: UserPreferences;
  displayFavoriteIds?: string[];
  displaySeasonIds?: string[];
}

/**
 * 用户模型 - 只存储基本信息，不存储敏感凭证
 */
const UserSchema = new Schema<IUser>({
  // 用户基本信息
  mid: { 
    type: Number, 
    required: true 
  }, // B站用户ID
  username: { 
    type: String, 
    required: true 
  }, // 用户名
  avatar: { 
    type: String 
  }, // 头像URL
  isLogin: { 
    type: Boolean, 
    default: false 
  }, // 登录状态
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
