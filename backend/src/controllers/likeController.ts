import Like from '../models/like.js';
import { ILike } from '../types/models.js';

/**
 * 媒体数据接口
 */
interface MediaData {
  avid: number;
  bvid?: string;
  cid?: number;
}

/**
 * @desc 获取用户喜欢的所有媒体
 * @param {number} mid - 用户ID
 * @returns {Promise<ILike[]>} 用户喜欢的媒体列表
 */
export const getUserLikes = async (mid: number): Promise<ILike[]> => {
  try {
    const likes = await Like.find({ mid }).sort({ likedAt: -1 });
    return likes;
  } catch (error) {
    console.error('获取用户喜欢列表失败:', error);
    throw new Error('获取用户喜欢列表失败');
  }
};

/**
 * @desc 检查媒体是否在喜欢列表中
 * @param {number} mid - 用户ID
 * @param {number} avid - 媒体ID
 * @param {number} cid - 媒体ID
 * @returns {Promise<boolean>} 是否在喜欢列表中
 */
export const checkIsLiked = async (mid: number, avid: number, cid: number): Promise<boolean> => {
  try {
    const like = await Like.findOne({ mid, avid, cid });
    return !!like;
  } catch (error) {
    console.error('检查喜欢状态失败:', error);
    throw new Error('检查喜欢状态失败');
  }
};

/**
 * @desc 添加媒体到喜欢列表
 * @param {number} mid - 用户ID
 * @param {MediaData} mediaData - 媒体数据
 * @returns {Promise<ILike>} 添加的喜欢记录
 */
export const addLike = async (mid: number, mediaData: MediaData): Promise<ILike> => {
  try {
    const { bvid, avid, cid } = mediaData;
    
    // 检查是否已经喜欢过
    const existingLike = await Like.findOne({ mid, avid, bvid, cid });
    if (existingLike) {
      return existingLike; // 已经喜欢过，直接返回
    }
    
    // 创建新的喜欢记录
    const newLike = await Like.create({
      mid,
      bvid,
      avid,
      cid,
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
 * @param {number} mid - 用户ID
 * @param {number} avid - 媒体ID
 * @param {number} cid - 媒体ID
 * @returns {Promise<boolean>} 是否移除成功
 */
export const removeLike = async (mid: number, avid: number, cid: number): Promise<boolean> => {
  try {
    await Like.findOneAndDelete({ mid, avid, cid });
    return true;
  } catch (error) {
    console.error('移除喜欢失败:', error);
    throw new Error('移除喜欢失败');
  }
};

