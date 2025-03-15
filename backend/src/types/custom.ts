import { MediaItem } from './common.js';

/**
 * @desc 自建歌单中的媒体项
 */
export interface Custom extends MediaItem {
  addedAt: Date;
}

/**
 * @desc 自建歌单
 */
export interface CustomList {
  title: string;
  intro?: string;
  cover?: string;
  isPublic: boolean;
  items: Custom[];
  createdAt: Date;
  updatedAt: Date;
}
