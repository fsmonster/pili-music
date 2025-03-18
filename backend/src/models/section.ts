import mongoose, { Schema, Document } from 'mongoose';

/**
 * 自定义分区接口 - 只包含基本信息
 */
export interface ISection extends Document {
  mid: number;                 // 用户ID
  name: string;                // 分区名称
  description?: string;        // 分区描述
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 自定义分区模型 - 存储用户创建的自定义分区基本信息
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

/**
 * 分区内容接口 - 存储分区内的媒体ID
 */
export interface ISectionContent extends Document {
  sectionId: mongoose.Types.ObjectId; // 关联的分区ID
  mid: number;                        // 用户ID
  mediaIds: number[];                 // 分区内的媒体ID列表
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 分区内容模型 - 存储分区内的媒体ID列表
 */
const SectionContentSchema = new Schema<ISectionContent>({
  // 关联的分区ID
  sectionId: {
    type: Schema.Types.ObjectId,
    ref: 'Section',
    required: true,
    index: true
  },
  
  // 用户ID
  mid: { 
    type: Number, 
    required: true,
    index: true
  },
  
  // 分区内的媒体ID列表
  mediaIds: { 
    type: [Number], 
    default: [] 
  }
}, {
  timestamps: true // 自动管理createdAt和updatedAt字段
});

// 复合索引：确保每个分区只有一个内容记录
SectionContentSchema.index({ sectionId: 1 }, { unique: true });

// 更新前自动更新updatedAt字段
SectionContentSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// 创建并导出模型
const Section = mongoose.model<ISection>('Section', SectionSchema);
const SectionContent = mongoose.model<ISectionContent>('SectionContent', SectionContentSchema);

export { Section, SectionContent };