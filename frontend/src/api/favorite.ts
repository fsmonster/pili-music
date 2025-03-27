/**
 * 收藏夹相关API
 */
import {request, biliRequest} from '../utils/request';
import type { ApiResponse,
  FavoriteListParams, FavoriteContentListParams,
  FavoriteListResponse, FavoriteList,
  FavoriteInfoResponse,
  FavoriteContentResponse,  
} from '../types';

/**
 * @desc 获取收藏夹 - 信息
 * @param media_id 收藏夹ID
 * @returns 收藏夹信息
 * @access  Public - 不需要登录
 */
export async function getFavoriteInfo(media_id: number): Promise<FavoriteInfoResponse> {
  try {
    const res = await biliRequest.get<ApiResponse<FavoriteInfoResponse>>('/v3/fav/folder/info', {
      params:{
        media_id
      }
    });
    if(res.data.code !== 0) {
      throw new Error(res.data.message || '获取收藏夹信息失败');
    }
    return res.data.data;
  } catch (error) {
    console.error('获取收藏夹信息失败:', error);
    throw error;
  }
}

/**
 * @desc 获取用户收藏夹 - 列表
 * 查询视频收藏信息
 * @param params 参数
 * @returns 收藏夹列表
 * @access  Optional - 可选登录
 */
export async function getFavoriteList(params: FavoriteListParams): Promise<FavoriteList[]> {
  try {
    const res = await request.get<ApiResponse<FavoriteListResponse>>('/favorite/list', {
      params
    });
    if(res.data.code !== 0) {
      throw new Error(res.data.message || '获取收藏夹列表失败');
    }
    return res.data.data.list;
  } catch (error) {
    console.error('获取收藏夹列表失败:', error);
    throw error;
  }
}

/**
 * @desc 获取收藏夹 - 信息 + 内容列表
 * @param params 参数
 * @returns 媒体列表
 * @access  Optional - 可选登录
 */
export async function getFavoriteContent(params: FavoriteContentListParams): Promise<FavoriteContentResponse> {
  try {
    const res = await request.get<ApiResponse<FavoriteContentResponse>>('/favorite/resource/list', {
      params
    });
    if(res.data.code !== 0) {
      throw new Error(res.data.message || '获取收藏夹内容失败');
    }
    return res.data.data;
  } catch (error) {
    console.error('获取收藏夹内容失败:', error);
    throw error;
  }
}

/**
 * 获取用户显示的收藏夹ID列表
 * @returns 收藏夹ID列表
 * @access  Private - 需要登录
 */ 
export async function getDisplayFavorites(): Promise<number[]> {
  try {
    const res = await request.get<ApiResponse<number[]>>('/favorite/display');
    return res.data.data;
  } catch (error) {
    console.error('获取显示收藏夹失败:', error);
    throw error;
  }
}

/**
 * 更新用户显示的收藏夹ID列表
 * @param displayIds 需要显示的收藏夹ID列表
 * @returns 更新后的收藏夹ID列表
 * @access  Private - 需要登录
 */
export async function updateDisplayFavorites(displayIds: number[]): Promise<number[]> { 
  try {
    const res = await request.put<ApiResponse<number[]>>('/favorite/display', { displayIds });
    return res.data.data;
  } catch (error) {
    console.error('更新显示收藏夹失败:', error);
    throw error;
  }
}
