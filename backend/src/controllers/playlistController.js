import CustomPlaylist from '../models/CustomPlaylist.js';

/**
 * @desc 获取用户的所有自建歌单
 * @param {String} userId - 用户ID
 * @returns {Array} 用户的自建歌单列表
 */
export const getUserPlaylists = async (userId) => {
  try {
    const playlists = await CustomPlaylist.find({ userId }).sort({ updatedAt: -1 });
    return playlists;
  } catch (error) {
    console.error('获取用户歌单失败:', error);
    throw new Error('获取用户歌单失败');
  }
};

/**
 * @desc 获取单个歌单详情
 * @param {String} playlistId - 歌单ID
 * @returns {Object} 歌单详情
 */
export const getPlaylistById = async (playlistId) => {
  try {
    const playlist = await CustomPlaylist.findById(playlistId);
    if (!playlist) {
      throw new Error('歌单不存在');
    }
    return playlist;
  } catch (error) {
    console.error('获取歌单详情失败:', error);
    throw new Error(error.message || '获取歌单详情失败');
  }
};

/**
 * @desc 创建新歌单
 * @param {String} userId - 用户ID
 * @param {Object} playlistData - 歌单数据
 * @returns {Object} 创建的歌单
 */
export const createPlaylist = async (userId, playlistData) => {
  try {
    const newPlaylist = await CustomPlaylist.create({
      ...playlistData,
      userId,
      mediaItems: []
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
 * @param {String} userId - 用户ID (用于验证权限)
 * @param {Object} updateData - 更新的数据
 * @returns {Object} 更新后的歌单
 */
export const updatePlaylist = async (playlistId, userId, updateData) => {
  try {
    // 查找并验证歌单所有权
    const playlist = await CustomPlaylist.findOne({ _id: playlistId, userId });
    if (!playlist) {
      throw new Error('歌单不存在或无权限修改');
    }
    
    // 更新歌单信息
    const updatedPlaylist = await CustomPlaylist.findByIdAndUpdate(
      playlistId,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );
    
    return updatedPlaylist;
  } catch (error) {
    console.error('更新歌单失败:', error);
    throw new Error(error.message || '更新歌单失败');
  }
};

/**
 * @desc 删除歌单
 * @param {String} playlistId - 歌单ID
 * @param {String} userId - 用户ID (用于验证权限)
 * @returns {Boolean} 是否删除成功
 */
export const deletePlaylist = async (playlistId, userId) => {
  try {
    // 查找并验证歌单所有权
    const playlist = await CustomPlaylist.findOne({ _id: playlistId, userId });
    if (!playlist) {
      throw new Error('歌单不存在或无权限删除');
    }
    
    // 删除歌单
    await CustomPlaylist.findByIdAndDelete(playlistId);
    return true;
  } catch (error) {
    console.error('删除歌单失败:', error);
    throw new Error(error.message || '删除歌单失败');
  }
};

/**
 * @desc 向歌单添加媒体
 * @param {String} playlistId - 歌单ID
 * @param {String} userId - 用户ID (用于验证权限)
 * @param {Object} mediaItem - 媒体信息
 * @returns {Object} 更新后的歌单
 */
export const addMediaToPlaylist = async (playlistId, userId, mediaItem) => {
  try {
    // 查找并验证歌单所有权
    const playlist = await CustomPlaylist.findOne({ _id: playlistId, userId });
    if (!playlist) {
      throw new Error('歌单不存在或无权限修改');
    }
    
    // 检查媒体是否已存在于歌单中
    const mediaExists = playlist.mediaItems.some(item => item.bvid === mediaItem.bvid);
    if (mediaExists) {
      throw new Error('该媒体已存在于歌单中');
    }
    
    // 添加媒体到歌单
    const updatedPlaylist = await CustomPlaylist.findByIdAndUpdate(
      playlistId,
      { 
        $push: { 
          mediaItems: {
            ...mediaItem,
            addedAt: new Date()
          } 
        },
        updatedAt: new Date()
      },
      { new: true }
    );
    
    return updatedPlaylist;
  } catch (error) {
    console.error('添加媒体到歌单失败:', error);
    throw new Error(error.message || '添加媒体到歌单失败');
  }
};

/**
 * @desc 从歌单移除媒体
 * @param {String} playlistId - 歌单ID
 * @param {String} userId - 用户ID (用于验证权限)
 * @param {String} bvid - 媒体ID
 * @returns {Object} 更新后的歌单
 */
export const removeMediaFromPlaylist = async (playlistId, userId, bvid) => {
  try {
    // 查找并验证歌单所有权
    const playlist = await CustomPlaylist.findOne({ _id: playlistId, userId });
    if (!playlist) {
      throw new Error('歌单不存在或无权限修改');
    }
    
    // 移除媒体
    const updatedPlaylist = await CustomPlaylist.findByIdAndUpdate(
      playlistId,
      { 
        $pull: { mediaItems: { bvid } },
        updatedAt: new Date()
      },
      { new: true }
    );
    
    return updatedPlaylist;
  } catch (error) {
    console.error('从歌单移除媒体失败:', error);
    throw new Error(error.message || '从歌单移除媒体失败');
  }
};
