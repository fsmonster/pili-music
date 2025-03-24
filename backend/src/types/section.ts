import { Document } from 'mongoose';

/**
 * 资源类型
 */
export type CollocationType = 'favorite' | 'season' | 'series';

/**
 * 资源id
 */
export interface CollocationId {
  type: CollocationType;
  id: number;
}

/**
 * 分区接口 - 包含基本信息和资源ID列表
 */
export interface Section {
    mid: number;                 // 用户ID
    name: string;                // 分区名称
    description?: string;        // 分区描述
    collocationIds: CollocationId[];   // 存储不同类型的 ID
    createdAt: Date;
    updatedAt: Date;
}

/**
 * 定义模型接口
 */
export interface ISection extends Document, Section {}
export type ICollocationItem = CollocationId;

// 创建分区参数类型
export interface SectionParams {
    mid: number;
    name: string;
    description: string;
}

// 更新分区参数类型
export interface UpdateSectionParams {
    mid: number;
    sectionId: string;
    updateData: {name?: string, description?: string};
}

// 添加资源到分区参数类型
export interface CollocationParams {
    mid: number;
    sectionId: string;
    type: CollocationType;
    collocationId: number;
}