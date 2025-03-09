
/**
 * 最近播放列表相关API
 */
import request from '../utils/request';
import type { 
  ApiResponse, 
  MediaItem,
  RecentPlay,
  RecentPlayResponse
} from '../types';

/**
 * @desc 获取最近播放记录
 * @param limit 限制数量
 * @returns 最近播放记录
 */
export async function getRecentPlays(limit: number = 20): Promise<RecentPlay[]> {
    try {
      const res = await request.get<RecentPlayResponse>('/recentPlay', {
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
  
      // 格式化为后端所需的格式
      const formattedMediaItem = {
        bvid: mediaItem.bvid,
        aid: mediaItem.id,  // 如果id是aid
        cid: mediaItem.ugc.first_cid,
        title: mediaItem.title,
        cover: mediaItem.cover,
        duration: mediaItem.duration,
        upper: {
          mid: mediaItem.upper.mid,
          name: mediaItem.upper.name,
          face: mediaItem.upper.face
        }
      };
      const res = await request.post<ApiResponse<RecentPlay>>('/recentPlay', formattedMediaItem);
      if (res.data.code !== 0) {
        throw new Error(res.data.message || '添加最近播放记录失败');
      }
      return res.data.data;
    } catch (error) {
      console.error('添加最近播放记录失败:', error);
      throw error;
    }
  }
  