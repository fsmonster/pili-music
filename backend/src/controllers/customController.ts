import CustomPlaylist from '../models/custom.js';
import { ICustomPlaylist } from '../types/models.js';
import { Types } from 'mongoose';

/**
 * 媒体项接口
 */
interface MediaItem {
  bvid: string;
  aid?: number;
  cid?: number;
  title: string;
  cover?: string;
  duration?: number;
  upper?: {
    mid: string;
    name: string;
  };
}

/**
 * 播放列表数据接口
 */
interface PlaylistData {
  name: string;
  description?: string;
  cover?: string;
  isPublic?: boolean;
}

/**
 * @desc 获取用户的所有自建歌单
 * @param {String} mid - 用户ID
 * @returns {Promise<ICustomPlaylist[]>} 用户的自建歌单列表
 */
export const getUserPlaylists = async (mid: string): Promise<ICustomPlaylist[]> => {
  try {
    const playlists = await CustomPlaylist.find({ mid }).sort({ updatedAt: -1 });
    console.log('获取用户歌单:', playlists);    
    return playlists;
  } catch (error) {
    console.error('获取用户歌单失败:', error);
    throw new Error('获取用户歌单失败');
  }
};

/**
 * @desc 获取单个歌单详情
 * @param {String} playlistId - 歌单ID
 * @returns {Promise<ICustomPlaylist>} 歌单详情
 */
export const getPlaylistById = async (playlistId: string): Promise<ICustomPlaylist> => {
  try {
    const playlist = await CustomPlaylist.findById(playlistId);
    if (!playlist) {
      throw new Error('歌单不存在');
    }
    return playlist;
  } catch (error) {
    console.error('获取歌单详情失败:', error);
    throw new Error(error instanceof Error ? error.message : '获取歌单详情失败');
  }
};

/**
 * @desc 创建新歌单
 * @param {String} mid - 用户ID
 * @param {PlaylistData} playlistData - 歌单数据
 * @returns {Promise<ICustomPlaylist>} 创建的歌单
 */
export const createPlaylist = async (mid: string, playlistData: PlaylistData): Promise<ICustomPlaylist> => {
  try {
    const newPlaylist = await CustomPlaylist.create({
      ...playlistData,
      mid,
      items: []
    });
    return newPlaylist;
  } catch (error) {
    console.error('创建歌单失败:', error);
    throw new Error('创建歌单失败');
  }
};

/**
 * @desc 更新歌单信息
 * @param {String} playlistId - 歌单ID
 * @param {String} mid - 用户ID (用于验证权限)
 * @param {Partial<PlaylistData>} updateData - 更新的数据
 * @returns {Promise<ICustomPlaylist>} 更新后的歌单
 */
export const updatePlaylist = async (
  playlistId: string, 
  mid: string, 
  updateData: Partial<PlaylistData>
): Promise<ICustomPlaylist> => {
  try {
    // 查找并验证歌单所有权
    const playlist = await CustomPlaylist.findOne({ 
      _id: new Types.ObjectId(playlistId), 
      mid 
    });
    
    if (!playlist) {
      throw new Error('歌单不存在或无权限修改');
    }
    
    // 更新歌单信息
    const updatedPlaylist = await CustomPlaylist.findByIdAndUpdate(
      playlistId,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );
    
    if (!updatedPlaylist) {
      throw new Error('更新歌单失败');
    }
    
    return updatedPlaylist;
  } catch (error) {
    console.error('更新歌单失败:', error);
    throw new Error(error instanceof Error ? error.message : '更新歌单失败');
  }
};

/**
 * @desc 删除歌单
 * @param {String} playlistId - 歌单ID
 * @param {String} mid - 用户ID (用于验证权限)
 * @returns {Promise<boolean>} 是否删除成功
 */
export const deletePlaylist = async (playlistId: string, mid: string): Promise<boolean> => {
  try {
    // 查找并验证歌单所有权
    const playlist = await CustomPlaylist.findOne({ 
      _id: new Types.ObjectId(playlistId), 
      mid 
    });
    
    if (!playlist) {
      throw new Error('歌单不存在或无权限删除');
    }
    
    // 删除歌单
    await CustomPlaylist.findByIdAndDelete(playlistId);
    return true;
  } catch (error) {
    console.error('删除歌单失败:', error);
    throw new Error(error instanceof Error ? error.message : '删除歌单失败');
  }
};

/**
 * @desc 向歌单添加媒体
 * @param {String} playlistId - 歌单ID
 * @param {String} mid - 用户ID (用于验证权限)
 * @param {MediaItem} mediaItem - 媒体信息
 * @returns {Promise<ICustomPlaylist>} 更新后的歌单
 */
export const addMediaToPlaylist = async (
  playlistId: string, 
  mid: string, 
  mediaItem: MediaItem
): Promise<ICustomPlaylist> => {
  try {
    // 查找并验证歌单所有权
    const playlist = await CustomPlaylist.findOne({ 
      _id: new Types.ObjectId(playlistId), 
      mid 
    });
    
    if (!playlist) {
      throw new Error('歌单不存在或无权限修改');
    }
    
    // 检查媒体是否已存在于歌单中
    const mediaExists = playlist.items.some(item => item.bvid === mediaItem.bvid);
    if (mediaExists) {
      throw new Error('该媒体已存在于歌单中');
    }
    
    // 添加媒体到歌单
    const updatedPlaylist = await CustomPlaylist.findByIdAndUpdate(
      playlistId,
      { 
        $push: { 
          items: {
            ...mediaItem,
            addedAt: new Date()
          } 
        },
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!updatedPlaylist) {
      throw new Error('添加媒体到歌单失败');
    }
    
    return updatedPlaylist;
  } catch (error) {
    console.error('添加媒体到歌单失败:', error);
    throw new Error(error instanceof Error ? error.message : '添加媒体到歌单失败');
  }
};

/**
 * @desc 从歌单移除媒体
 * @param {String} playlistId - 歌单ID
 * @param {String} mid - 用户ID (用于验证权限)
 * @param {String} bvid - 媒体ID
 * @returns {Promise<ICustomPlaylist>} 更新后的歌单
 */
export const removeMediaFromPlaylist = async (
  playlistId: string, 
  mid: string, 
  bvid: string
): Promise<ICustomPlaylist> => {
  try {
    // 查找并验证歌单所有权
    const playlist = await CustomPlaylist.findOne({ 
      _id: new Types.ObjectId(playlistId), 
      mid 
    });
    
    if (!playlist) {
      throw new Error('歌单不存在或无权限修改');
    }
    
    // 移除媒体
    const updatedPlaylist = await CustomPlaylist.findByIdAndUpdate(
      playlistId,
      { 
        $pull: { items: { bvid } },
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!updatedPlaylist) {
      throw new Error('从歌单移除媒体失败');
    }
    
    return updatedPlaylist;
  } catch (error) {
    console.error('从歌单移除媒体失败:', error);
    throw new Error(error instanceof Error ? error.message : '从歌单移除媒体失败');
  }
};
