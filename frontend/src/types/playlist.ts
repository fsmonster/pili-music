/**
 * 播放列表相关类型定义
 */
import type { MediaItem } from './index';

/**
 * 自定义播放列表类型
 */
export interface CustomPlaylist {
  _id: string;
  name: string;
  description: string;
  coverUrl?: string;
  userId: string;
  mediaItems: MediaItem[];
  createdAt: string;
  updatedAt: string;
}

/**
 * 创建播放列表请求参数
 */
export interface CreatePlaylistParams {
  title: string;
  cover: string;
  description: string;
}

/**
 * 更新播放列表请求参数
 */
export interface UpdatePlaylistParams {
  name?: string;
  description?: string;
  coverUrl?: string;
}

/**
 * 播放列表响应类型
 */
export interface PlaylistResponse {
  code: number;
  message: string;
  data: CustomPlaylist | CustomPlaylist[];
}

/**
 * 点赞状态
 */
export interface LikeStatus {
  mediaId: number; // 媒体ID (avid)
  liked: boolean;   // 是否已点赞
  timestamp: string; // 点赞时间
}

/**
 * 最近播放记录
 */
export interface RecentPlay {
  mediaItem: MediaItem;
  playCount: number;   // 播放次数
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

/**
 * 点赞状态响应
 */
export interface LikeStatusResponse {
  code: number;
  message: string;
  data: LikeStatus[];
}
