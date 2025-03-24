import mongoose, { Schema } from 'mongoose';
import { ISection, CollocationType } from '../types/section.js';

/**
 * 自定义分区模型 - 存储用户创建的自定义分区信息和媒体列表
 */
const SectionSchema = new Schema<ISection>(
  {
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
    collocationIds: [
      {
        type: {
          type: String,
          enum: ['favorite', 'season', 'series'],
          required: true
        },
        id: { type: Number, required: true }
      }
    ]
  },
  {
    timestamps: true // 自动管理 createdAt 和 updatedAt
  }
);

// 复合索引：确保每个用户的分区名称唯一
SectionSchema.index({ mid: 1, name: 1 }, { unique: true });

// **新增索引**：加快按 `id` 查询分区
SectionSchema.index({ 'collocationIds.id': 1 });

// **去重逻辑**：防止 `collocationIds` 存储重复 ID
SectionSchema.pre('save', function (next) {
  const seen = new Set();
  this.collocationIds = this.collocationIds.filter(item => {
    const key = `${item.type}-${item.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  next();
});

// 更新前自动更新 updatedAt 字段
SectionSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// 创建并导出模型
const Section = mongoose.model<ISection>('Section', SectionSchema);

export { Section };

/**
 * 获取包含特定 ID 的所有分区
 */
export async function getSectionsByTypeAndId(mid: number, type: CollocationType, id: number) {
  return await Section.find({ mid, 'collocationIds.type': type, 'collocationIds.id': id });
}

