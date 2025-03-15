
/**
 * 最近播放列表相关API
 */
import request from '../utils/request';
import type { 
  ApiResponse, 
  RecentPlay,
  RecentPlayResponse,
  MediaItem
} from '../types';
import { getCid } from './audio';

/**
 * @desc 获取最近播放记录
 * @param limit 限制数量
 * @returns 最近播放记录
 */
export async function getRecentPlays(limit: number = 20): Promise<RecentPlay[]> {
    try {
      const res = await request.get<RecentPlayResponse>('/recent', {
        params: { limit }
      });
      if (res.data.code !== 0) {
        throw new Error(res.data.message || '获取最近播放记录失败');
      }
      return res.data.data;
    } catch (error) {
      console.error('获取最近播放记录失败:', error);
      throw error;
    }
  }
  
  /**
   * @desc 添加最近播放记录
   * @param mediaItem 媒体信息
   * @returns 更新后的最近播放记录
   */
  export async function addRecentPlay(mediaItem: MediaItem): Promise<RecentPlay> {
    try {
      if(!mediaItem.cid)
      {
        mediaItem.cid = await getCid(mediaItem.id);
      }
      const res = await request.post<ApiResponse<RecentPlay>>('/recent', mediaItem);
      if (res.data.code !== 0) {
        throw new Error(res.data.message || '添加最近播放记录失败');
      }
      return res.data.data;
    } catch (error) {
      console.error('添加最近播放记录失败:', error);
      throw error;
    }
  }
  