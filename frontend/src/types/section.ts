/**
 * 自定义分区相关类型定义
 */
import type { CustomSection } from '../api/sectionContents';
import type { MediaItem } from './index';

/**
 * 📦 自定义分区项目（包含 📂 收藏夹信息）
 * 📦 自定义分区 - 用户创建的分类，用于组织 📂 收藏夹
 * 📂 收藏夹 - B站的收藏夹，包含多个 🎵 媒体
 * 🎵 媒体 - 具体的视频/音频内容
 */
export interface CustomSectionWithInfo extends CustomSection {
  cover?: string;
  title?: string;
  media_count?: number;
}

/**
 * 📦 自定义分区内容响应
 */
export interface SectionContentResponse {
  info: CustomSectionWithInfo;
  items: MediaItem[];
}

/**
 * 📂 收藏夹项目
 * 注意：实际使用时，直接使用 MediaItem 类型
 */
export type FavoriteItem = MediaItem;
