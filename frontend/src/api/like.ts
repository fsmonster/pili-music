/**
 * 点赞列表相关API
 */
import request from '../utils/request';
import type { 
  ApiResponse, 
  LikeStatus,
  LikeStatusResponse
} from '../types';

/**
 * @desc 获取用户的点赞列表
 * @returns 用户的点赞列表
 */
export async function getLikedMedia(): Promise<LikeStatus[]> {
    try {
      const res = await request.get<LikeStatusResponse>('/like');
      if (res.data.code !== 0) {
        throw new Error(res.data.message || '获取点赞列表失败');
      }
      return res.data.data;
    } catch (error) {
      console.error('获取点赞列表失败:', error);
      throw error;
    }
  }
  
  /**
   * @desc 点赞/取消点赞媒体
   * @param mediaId 媒体ID (avid)
   * @param liked 是否点赞
   * @returns 点赞状态
   */
  export async function toggleLike(mediaId: number, liked: boolean): Promise<LikeStatus> {
    try {
      const res = await request.post<ApiResponse<LikeStatus>>('/like', { mediaId, liked });
      if (res.data.code !== 0) {
        throw new Error(res.data.message || '操作失败');
      }
      return res.data.data;
    } catch (error) {
      console.error('点赞操作失败:', error);
      throw error;
    }
  }
  