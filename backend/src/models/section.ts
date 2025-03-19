import mongoose, { Schema, Document } from 'mongoose';

/**
 * 自定义分区接口 - 包含基本信息和媒体ID列表
 */
export interface ISection extends Document {
  mid: number;                 // 用户ID
  name: string;                // 分区名称
  description?: string;        // 分区描述
  mediaIds: number[];          // 分区内的媒体ID列表
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 自定义分区模型 - 存储用户创建的自定义分区信息和媒体列表
 */
const SectionSchema = new Schema<ISection>({
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
  }
}, {
  timestamps: true // 自动管理createdAt和updatedAt字段
});

// 复合索引：确保每个用户的分区名称唯一
SectionSchema.index({ mid: 1, name: 1 }, { unique: true });

// 更新前自动更新updatedAt字段
SectionSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// 创建并导出模型
const Section = mongoose.model<ISection>('Section', SectionSchema);

export { Section };