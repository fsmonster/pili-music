import Like from '../models/like.js';

/**
 * @desc 获取用户喜欢的所有媒体
 * @param {String} userId - 用户ID
 * @returns {Array} 用户喜欢的媒体列表
 */
export const getUserLikes = async (userId) => {
  try {
    const likes = await Like.find({ userId }).sort({ likedAt: -1 });
    return likes;
  } catch (error) {
    console.error('获取用户喜欢列表失败:', error);
    throw new Error('获取用户喜欢列表失败');
  }
};

/**
 * @desc 添加媒体到喜欢列表
 * @param {String} userId - 用户ID
 * @param {Object} mediaData - 媒体数据
 * @returns {Object} 添加的喜欢记录
 */
export const addLike = async (userId, mediaData) => {
  try {
    const { bvid, aid, cid, title, cover, duration, upper } = mediaData;
    
    // 检查是否已经喜欢过
    const existingLike = await Like.findOne({ userId, bvid });
    if (existingLike) {
      return existingLike; // 已经喜欢过，直接返回
    }
    
    // 创建新的喜欢记录
    const newLike = await Like.create({
      userId,
      bvid,
      aid,
      cid,
      title,
      cover,
      duration,
      upper,
      likedAt: new Date()
    });
    
    return newLike;
  } catch (error) {
    console.error('添加喜欢失败:', error);
    throw new Error('添加喜欢失败');
  }
};

/**
 * @desc 从喜欢列表移除媒体
 * @param {String} userId - 用户ID
 * @param {String} bvid - 视频ID
 * @returns {Boolean} 是否移除成功
 */
export const removeLike = async (userId, bvid) => {
  try {
    await Like.findOneAndDelete({ userId, bvid });
    return true;
  } catch (error) {
    console.error('移除喜欢失败:', error);
    throw new Error('移除喜欢失败');
  }
};

/**
 * @desc 检查媒体是否在喜欢列表中
 * @param {String} userId - 用户ID
 * @param {String} bvid - 视频ID
 * @returns {Boolean} 是否在喜欢列表中
 */
export const checkIsLiked = async (userId, bvid) => {
  try {
    const like = await Like.findOne({ userId, bvid });
    return !!like;
  } catch (error) {
    console.error('检查喜欢状态失败:', error);
    throw new Error('检查喜欢状态失败');
  }
};
