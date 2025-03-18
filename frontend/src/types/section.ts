/**
 * 自定义分区相关类型定义
 */
import type { MediaItem } from './index';

/**
 * 自定义分区接口参数
 */
export interface SectionParams {
  name?: string;
  description?: string;
}

/**
 * 自定义分区基本信息
 */
export interface Section {
  _id: string;
  mid: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 分区内容信息
 */
export interface SectionContent {
  _id: string;
  sectionId: string;
  mid: number;
  mediaIds: number[];
  createdAt: string;
  updatedAt: string;
}

/**
 * 分区内容状态
 */
export interface SectionContentState {
  favorites: MediaItem[];  // 收藏夹列表
  loading: boolean;        // 加载状态
  error: string;           // 错误信息
}
