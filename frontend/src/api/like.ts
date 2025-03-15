/**
 * 点赞列表相关API
 */
import request from '../utils/request';
import type { 
  ApiResponse, 
  Like,
  LikeStatusResponse
} from '../types';

/**
 * @desc 获取用户的点赞列表
 * @returns 用户的点赞列表
 */
export async function getLikedMedia(): Promise<Like[]> {
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
   * @desc 检查媒体是否已点赞
   * @param avid 媒体avid
   * @param cid 媒体cid
   * @returns 是否已点赞
   */
  export async function checkIsLiked(avid: number, cid: number): Promise<boolean> {
    try {
      const res = await request.get<ApiResponse<boolean>>(`/like/check/${avid}/${cid}`);
      if (res.data.code !== 0) {
        throw new Error(res.data.message || '检查喜欢状态失败');
      }
      return res.data.data;
    } catch (error) {
      console.error('检查喜欢状态失败:', error);
      throw error;
    }
  }
  
  /**
   * @desc 点赞媒体
   * @param avid 媒体avid
   * @param bvid 媒体bvid
   * @param cid 媒体cid
   * @returns 点赞状态
   */
  export async function addLike(avid: number, bvid: string, cid: number): Promise<Like> {
    try {
      const res = await request.post<ApiResponse<Like>>('/like', { avid, bvid, cid });
      if (res.data.code !== 0) {
        throw new Error(res.data.message || '操作失败');
      }
      return res.data.data;
    } catch (error) {
      console.error('点赞操作失败:', error);
      throw error;
    }
  }

  /**
   * @desc 取消点赞媒体
   * @param avid 媒体avid
   * @param cid 媒体cid
   * @returns 取消点赞状态
   */
  export async function removeLike(avid: number, cid: number): Promise<Like> {
    try {
      const res = await request.delete<ApiResponse<Like>>(`/like/${avid}/${cid}`);
      if (res.data.code !== 0) {
        throw new Error(res.data.message || '操作失败');
      }
      return res.data.data;
    } catch (error) {
      console.error('取消点赞操作失败:', error);
      throw error;
    }
  }
  
  