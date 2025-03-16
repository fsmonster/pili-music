import mongoose, { Schema, Document } from 'mongoose';

/**
 * 自定义分区接口
 */
export interface ICustomSection extends Document {
  mid: number;                 // 用户ID
  name: string;                // 分区名称
  description?: string;        // 分区描述
  mediaIds: number[];          // 分区内的媒体ID列表
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 自定义分区模型 - 存储用户创建的自定义分区及其包含的媒体ID
 * 注意：实际媒体数据通过B站API获取，这里只保存ID
 */
const CustomSectionSchema = new Schema<ICustomSection>({
  // 用户ID
  mid: { 
    type: Number, 
    required: true,
    index: true
  },
  
  // 分区名称
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  
  // 分区描述
  description: { 
    type: String, 
    default: '',
    trim: true
  },
  
  // 分区内的媒体ID列表
  mediaIds: { 
    type: [Number], 
    default: [] 
  },
}, {
  timestamps: true // 自动管理createdAt和updatedAt字段
});

// 复合索引：确保每个用户的分区名称唯一
CustomSectionSchema.index({ mid: 1, name: 1 }, { unique: true });

// 更新前自动更新updatedAt字段
CustomSectionSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// 创建并导出自定义分区模型
const CustomSection = mongoose.model<ICustomSection>('CustomSection', CustomSectionSchema);

export default CustomSection;