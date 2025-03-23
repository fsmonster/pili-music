import mongoose, { Schema } from 'mongoose';
import { Document } from 'mongoose';

/**
 * 用户系列显示设置接口
 */
interface ISeriesDisplay extends Document {
  mid: number;                 // 用户ID
  displayIds: number[];        // 显示的系列ID列表
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 系列显示设置模型 - 只保存用户选择显示的系列ID列表
 * 注意：实际系列数据通过B站API获取，这里只保存ID
 */
const SeriesDisplaySchema = new Schema<ISeriesDisplay>({
  // 用户ID
  mid: { 
    type: Number, 
    required: true,
    unique: true
  },
  
  // 显示的系列ID列表
  displayIds: { 
    type: [Number], 
    default: []
  },
}, {
  timestamps: true // 自动管理createdAt和updatedAt字段
});

// 更新前自动更新updatedAt字段
SeriesDisplaySchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// 创建并导出系列显示设置模型
const SeriesDisplay = mongoose.model<ISeriesDisplay>('Series', SeriesDisplaySchema);

export default SeriesDisplay;