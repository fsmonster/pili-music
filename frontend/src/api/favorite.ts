/**
 * 收藏夹相关API
 */
import request from '../utils/request';
import type { ApiResponse, FavoriteListResponse, FavoriteContentResponse } from '../types/types';

/**
 * 获取用户收藏夹列表
 * @param up_mid 用户UID
 */
export async function getFavoriteList(up_mid?: number) {
  return request.get<ApiResponse<FavoriteListResponse>>('/favorite/list', {
    params: { up_mid }
  });
}

/**
 * 获取收藏夹内容
 * @param media_id 收藏夹mlid
 */
export async function getFavoriteContent(media_id: string | number, params?: {
  pn?: number;  // 页码
  ps?: number;  // 每页项数
  keyword?: string;  // 搜索关键词
  order?: 'mtime' | 'view' | 'pubtime';  // 排序方式
  type?: number;  // 内容类型
  tid?: number;   // 分区ID
}) {
  return request.get<ApiResponse<FavoriteContentResponse>>('/favorite/resource/list', {
    params: {
      media_id,
      ...params
    }
  });
}

/**
 * 获取订阅合集列表
 */
export async function getSeasonList(params?: {
  pn?: number;  // 页码
  ps?: number;  // 每页项数
  up_mid?: number;  // 用户UID
}) {
  return request.get<ApiResponse>('/favorite/collected/list', {
    params
  });
}

/**
 * 获取收藏夹资源ID列表
 * @param media_id 收藏夹mlid
 */
export async function getFavoriteIds(media_id: string | number) {
  return request.get<ApiResponse>('/favorite/resource/ids', {
    params: { media_id }
  });
}
