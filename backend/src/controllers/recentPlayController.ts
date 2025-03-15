import RecentPlay from '../models/recent.js';
import { IRecentPlay } from '../types/models.js';

/**
 * @desc 获取用户的最近播放记录
 * @param {Number} mid - 用户ID
 * @param {Number} limit - 限制返回数量，默认100
 * @returns {Promise<IRecentPlay[]>} 最近播放记录列表
 */
export const getUserRecentPlays = async (mid: number, limit: number = 100): Promise<IRecentPlay[]> => {
  try {
    const recentPlays = await RecentPlay.find({ mid })
      .sort({ playedAt: -1 })
      .limit(limit);
    return recentPlays;
  } catch (error) {
    console.error('获取最近播放记录失败:', error);
    throw new Error('获取最近播放记录失败');
  }
};

/**
 * 媒体数据接口
 */
interface MediaData {
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
 * @desc 添加或更新播放记录
 * @param {Number} mid - 用户ID
 * @param {MediaData} mediaData - 媒体数据
 * @returns {Promise<IRecentPlay>} 更新后的播放记录
 */
export const addOrUpdateRecentPlay = async (mid: number, mediaData: MediaData): Promise<IRecentPlay> => {
  try {
    const { bvid, aid, cid, title, cover, duration, upper } = mediaData;
    
    // 查找是否已有该媒体的播放记录
    let recentPlay = await RecentPlay.findOne({ mid, bvid });
    
    if (recentPlay) {
      // 如果已存在，更新播放时间
      recentPlay = await RecentPlay.findOneAndUpdate(
        { mid, bvid },
        { 
          playedAt: new Date(),
          title,
          cover,
          duration,
          upper
        },
        { new: true }
      );
      
      // TypeScript 类型保护
      if (!recentPlay) {
        throw new Error('更新播放记录失败');
      }
    } else {
      // 如果不存在，创建新记录
      recentPlay = await RecentPlay.create({
        mid,
        bvid,
        aid,
        cid,
        title,
        cover,
        duration,
        upper,
        playedAt: new Date()
      });
    }
    
    return recentPlay;
  } catch (error) {
    console.error('添加播放记录失败:', error);
    throw new Error('添加播放记录失败');
  }
};

/**
 * @desc 删除播放记录
 * @param {Number} mid - 用户ID
 * @param {Number} avid - 视频ID
 * @param {Number} cid - 章节ID
 * @returns {Promise<boolean>} 是否删除成功
 */
export const deleteRecentPlay = async (mid: number, avid: number, cid: number): Promise<boolean> => {
  try {
    await RecentPlay.findOneAndDelete({ mid, avid, cid });
    return true;
  } catch (error) {
    console.error('删除播放记录失败:', error);
    throw new Error('删除播放记录失败');
  }
};

/**
 * @desc 清空用户的所有播放记录
 * @param {Number} mid - 用户ID
 * @returns {Promise<boolean>} 是否清空成功
 */
export const clearAllRecentPlays = async (mid: number): Promise<boolean> => {
  try {
    await RecentPlay.deleteMany({ mid });
    return true;
  } catch (error) {
    console.error('清空播放记录失败:', error);
    throw new Error('清空播放记录失败');
  }
};
