import type { MediaItem } from './common';

/**
 * 点赞状态
 */
export interface Like {
    _id: string;
    mediaItem: MediaItem;
    mid: number;
    lastLiked: string;  // 最后点赞时间
}
  
/**
 * 点赞状态响应
 */
export interface LikeStatusResponse {
    code: number;
    message: string;
    data: Like[];
}