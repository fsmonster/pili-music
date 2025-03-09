/**
 * 播放列表相关API
 */
import request from '../utils/request';
import type { 
  ApiResponse, 
  CustomPlaylist, 
  CreatePlaylistParams, 
  UpdatePlaylistParams,
  MediaItem,
  PlaylistResponse,
} from '../types';

/**
 * @desc 获取用户的所有自建歌单
 * @returns 用户的自建歌单列表
 */
export async function getUserPlaylists(): Promise<CustomPlaylist[]> {
  const res = await request.get<PlaylistResponse>('/custom');
  try {    
    if (res.data.code !== 0) {
      throw new Error(res.data.message || '获取用户歌单失败');
    }
    return res.data.data as CustomPlaylist[];
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
export async function getPlaylistById(playlistId: string): Promise<CustomPlaylist> {
  try {
    const res = await request.get<PlaylistResponse>(`/custom/${playlistId}`);
    if (res.data.code !== 0) {
      throw new Error(res.data.message || '获取歌单详情失败');
    }
    return res.data.data as CustomPlaylist;
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
export async function createPlaylist(playlistData: CreatePlaylistParams): Promise<CustomPlaylist> {
  try {
    const res = await request.post<PlaylistResponse>('/custom', playlistData);
    if (res.data.code !== 0) {
      throw new Error(res.data.message || '创建歌单失败');
    }
    return res.data.data as CustomPlaylist;
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
  updateData: UpdatePlaylistParams
): Promise<CustomPlaylist> {
  try {
    const res = await request.put<PlaylistResponse>(`/custom/${playlistId}`, updateData);
    if (res.data.code !== 0) {
      throw new Error(res.data.message || '更新歌单失败');
    }
    return res.data.data as CustomPlaylist;
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
): Promise<CustomPlaylist> {
  try {
    const res = await request.post<PlaylistResponse>(
      `/playlist/${playlistId}/media`, 
      mediaItem
    );
    if (res.data.code !== 0) {
      throw new Error(res.data.message || '添加媒体到歌单失败');
    }
    return res.data.data as CustomPlaylist;
  } catch (error) {
    console.error('添加媒体到歌单失败:', error);
    throw error;
  }
}

/**
 * @desc 从歌单移除媒体
 * @param playlistId 歌单ID
 * @param bvid 媒体ID
 * @returns 更新后的歌单
 */
export async function removeMediaFromPlaylist(
  playlistId: string, 
  bvid: string
): Promise<CustomPlaylist> {
  try {
    const res = await request.delete<PlaylistResponse>(
      `/custom/${playlistId}/media/${bvid}`
    );
    if (res.data.code !== 0) {
      throw new Error(res.data.message || '从歌单移除媒体失败');
    }
    return res.data.data as CustomPlaylist;
  } catch (error) {
    console.error('从歌单移除媒体失败:', error);
    throw error;
  }
}
