/**
 * 收藏夹相关API
 */
import request from '../utils/request';
import type { ApiResponse, Favorite, FavoriteListResponse, FavoriteContentResponse, FavoriteInfo, MediaItem } from '../types';

/**
 * 获取用户收藏夹 - 列表
 * @param up_mid 用户UID
 * @returns 收藏夹列表
 */
export async function getFavoriteList(up_mid?: number): Promise<Favorite[]> {
  try {
    const res = await request.get<ApiResponse<FavoriteListResponse>>('/favorite/list', {
      params: { up_mid }
    });
    return res.data.data.list;
  } catch (error) {
    console.error('获取收藏夹列表失败:', error);
    throw error;
  }
}

/**
 * 获取收藏夹 - 信息
 * @param media_id 收藏夹mlid
 * @returns 收藏夹信息
 */
export async function getFavoriteInfo(media_id: string | number): Promise<FavoriteInfo | null> {
  try {
    const res = await request.get<ApiResponse<FavoriteInfo>>('/favorite/folder/info', {
      params: { media_id }
    });
    if(res.data.code !== 0) {
      throw new Error(res.data.message || '获取收藏夹信息失败');
    }
    return res.data.data;
  } catch (error) {
    console.error('获取收藏夹信息失败:', error);
    return null;
  }
}

/**
 * 获取收藏夹 - 信息 + 内容列表
 * @param media_id 收藏夹mlid
 * @param params 参数
 * @returns 
 */
export async function getFavoriteContent(media_id: number, params?: {
  pn?: number;  // 页码
  ps: number;  // 每页项数
  order?: 'mtime' | 'view' | 'pubtime';  // 排序方式
}): Promise<MediaItem[]> {
  try {
    const res = await request.get<ApiResponse<FavoriteContentResponse>>('/favorite/resource/list', {
      params: {
        media_id,
        ...params
      }
    });
    return res.data.data.medias;
  } catch (error) {
    console.error('获取收藏夹内容失败:', error);
    throw error;
  }
}

// /**
//  * 获取收藏夹内容明细列表
//  * @param media_id 收藏夹mlid
//  */
// export async function getFavoriteIds(media_id: string | number) {
//   return request.get<ApiResponse>('/favorite/resource/ids', {
//     params: { media_id }
//   });
// }

