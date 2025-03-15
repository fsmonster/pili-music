import type { MediaItem } from './common';

/**
 * 最近播放记录
 */
export interface RecentPlay {
    _id: string;
    mediaItem: MediaItem;
    mid: number;
    lastPlayed: string;  // 最后播放时间
}
  
/**
 * 最近播放记录响应
 */
export interface RecentPlayResponse {
    code: number;
    message: string;
    data: RecentPlay[];
}
