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
 * 获取收藏夹-信息
 * @param media_id 收藏夹mlid
 */
export async function getFavoriteInfo(media_id: string | number) {
  return request.get('/favorite/folder/info', {
    params: { media_id }
  });
}

/**
 * 获取收藏夹-内容
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
  }).then(res => res.data);
}

/**
 * 获取收藏夹内容明细列表
 * @param media_id 收藏夹mlid
 */
export async function getFavoriteIds(media_id: string | number) {
  return request.get<ApiResponse>('/favorite/resource/ids', {
    params: { media_id }
  });
}

