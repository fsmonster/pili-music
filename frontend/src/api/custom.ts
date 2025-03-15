/**
 * 播放列表相关API
 */
import request from '../utils/request';
import type { 
  ApiResponse, 
  Custom, 
  CreateCustomParams, 
  UpdateCustomParams,
  MediaItem,
  CustomResponse,
} from '../types';

/**
 * @desc 获取用户的所有自建歌单
 * @returns 用户的自建歌单列表
 */
export async function getUserPlaylists(): Promise<Custom[]> {
  const res = await request.get<CustomResponse>('/custom');
  try {    
    if (res.data.code !== 0) {
      throw new Error(res.data.message || '获取用户歌单失败');
    }
    return res.data.data as Custom[];
  } catch (error) {
    console.error('获取用户歌单失败:', error);
    throw error;
  }
}

/**
 * @desc 获取单个歌单详情
 * @param playlistId 歌单ID
 * @returns 歌单详情
 */
export async function getPlaylistById(playlistId: string): Promise<Custom> {
  try {
    const res = await request.get<CustomResponse>(`/custom/${playlistId}`);
    if (res.data.code !== 0) {
      throw new Error(res.data.message || '获取歌单详情失败');
    }
    return res.data.data as Custom;
  } catch (error) {
    console.error('获取歌单详情失败:', error);
    throw error;
  }
}

/**
 * @desc 创建新歌单
 * @param playlistData 歌单数据
 * @returns 创建的歌单
 */
export async function createPlaylist(playlistData: CreateCustomParams): Promise<Custom> {
  try {
    const res = await request.post<CustomResponse>('/custom', playlistData);
    if (res.data.code !== 0) {
      throw new Error(res.data.message || '创建歌单失败');
    }
    return res.data.data as Custom;
  } catch (error) {
    console.error('创建歌单失败:', error);
    throw error;
  }
}

/**
 * @desc 更新歌单信息
 * @param playlistId 歌单ID
 * @param updateData 更新的数据
 * @returns 更新后的歌单
 */
export async function updatePlaylist(
  playlistId: string, 
  updateData: UpdateCustomParams
): Promise<Custom> {
  try {
    const res = await request.put<CustomResponse>(`/custom/${playlistId}`, updateData);
    if (res.data.code !== 0) {
      throw new Error(res.data.message || '更新歌单失败');
    }
    return res.data.data as Custom;
  } catch (error) {
    console.error('更新歌单失败:', error);
    throw error;
  }
}

/**
 * @desc 删除歌单
 * @param playlistId 歌单ID
 * @returns 是否删除成功
 */
export async function deletePlaylist(playlistId: string): Promise<boolean> {
  try {
    const res = await request.delete<ApiResponse<boolean>>(`/custom/${playlistId}`);
    if (res.data.code !== 0) {
      throw new Error(res.data.message || '删除歌单失败');
    }
    return true;
  } catch (error) {
    console.error('删除歌单失败:', error);
    throw error;
  }
}

/**
 * @desc 向歌单添加媒体
 * @param playlistId 歌单ID
 * @param mediaItem 媒体信息
 * @returns 更新后的歌单
 */
export async function addMediaToPlaylist(
  playlistId: string, 
  mediaItem: MediaItem
): Promise<Custom> {
  try {
    const res = await request.post<CustomResponse>(
      `/custom/${playlistId}/media`, 
      mediaItem
    );
    if (res.data.code !== 0) {
      throw new Error(res.data.message || '添加媒体到歌单失败');
    }
    return res.data.data as Custom;
  } catch (error) {
    console.error('添加媒体到歌单失败:', error);
    throw error;
  }
}

/**
 * @desc 从歌单移除媒体
 * @param playlistId 歌单ID
 * @param avid 媒体AV号
 * @param cid 媒体CID
 * @returns 更新后的歌单
 */
export async function removeMediaFromPlaylist(
  playlistId: string, 
  avid: number,
  cid: number
): Promise<Custom> {
  const payload = {
    avid,
    cid
  };
  try {
    const res = await request.delete<CustomResponse>(
      `/custom/${playlistId}/media`,
      {
        data: payload
      }
    );
    if (res.data.code !== 0) {
      throw new Error(res.data.message || '从歌单移除媒体失败');
    }
    return res.data.data as Custom;
  } catch (error) {
    console.error('从歌单移除媒体失败:', error);
    throw error;
  }
}
