import type { FavoriteInfo } from './favorite';

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
  mediaIds: number[];
  media_count?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 自定义分区扩展信息，包含收藏夹基本信息
 */
export interface SectionWithFavorites extends Section {
  favorites: FavoriteInfo[];
}

