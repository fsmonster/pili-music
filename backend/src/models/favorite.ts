import mongoose, { Schema } from 'mongoose';
import { Document } from 'mongoose';

/**
 * 用户收藏夹显示设置接口
 */
interface IFavoriteDisplay extends Document {
  mid: number;                 // 用户ID
  displayIds: number[];        // 显示的收藏夹ID列表
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 收藏夹显示设置模型 - 只保存用户选择显示的收藏夹ID列表
 * 注意：实际收藏夹数据通过B站API获取，这里只保存ID
 */
const FavoriteDisplaySchema = new Schema<IFavoriteDisplay>({
  // 用户ID
  mid: { 
    type: Number, 
    required: true,
    unique: true
  },
  
  // 显示的收藏夹ID列表
  displayIds: { 
    type: [Number], 
    default: [] 
  },
}, {
  timestamps: true // 自动管理createdAt和updatedAt字段
});

// 更新前自动更新updatedAt字段
FavoriteDisplaySchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// 创建并导出收藏夹显示设置模型
const FavoriteDisplay = mongoose.model<IFavoriteDisplay>('Favorite', FavoriteDisplaySchema);

export default FavoriteDisplay;
