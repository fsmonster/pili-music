/**
 * 自建歌单相关类型定义
 */
import type { MediaItem } from './common';

/**
 * 自建歌单类型
 */
export interface Custom {
  _id: string;
  title: string;
  description: string;
  cover?: string;
  mid: number;
  mediaItems: MediaItem[];
  createdAt: string;
  updatedAt: string;
}

/**
 * 自建歌单列表响应类型
 */
export interface CustomResponse {
  code: number;
  message: string;
  data: Custom[] | Custom;
}

/**
 * 创建自建歌单请求参数
 */
export interface CreateCustomParams {
    title: string;
    description?: string;
    cover?: string;
  }
  
  /**
   * 更新自建歌单请求参数
   */
  export interface UpdateCustomParams {
    title: string;
    description?: string;
    cover?: string;
  }