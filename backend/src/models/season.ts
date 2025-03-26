import mongoose, { Schema } from 'mongoose';
import { Document } from 'mongoose';

/**
 * 用户合集显示设置接口
 */
interface ISeasonDisplay extends Document {
  mid: string;                 // 用户ID
  displayIds: number[];        // 显示的合集ID列表
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 合集显示设置模型 - 只保存用户选择显示的合集ID列表
 * 注意：实际合集数据通过B站API获取，这里只保存ID
 */
const SeasonDisplaySchema = new Schema<ISeasonDisplay>({
  // 用户ID
  mid: { 
    type: String, 
    required: true,
    unique: true
  },
  
  // 显示的合集ID列表
  displayIds: { 
    type: [Number], 
    default: [] 
  },
}, {
  timestamps: true // 自动管理createdAt和updatedAt字段
});

// 更新前自动更新updatedAt字段
SeasonDisplaySchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// 创建并导出合集显示设置模型
const SeasonDisplay = mongoose.model<ISeasonDisplay>('Season', SeasonDisplaySchema);

export default SeasonDisplay;