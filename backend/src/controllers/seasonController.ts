import SeasonDisplay from '../models/season.js';

/**
 * @desc 获得用户显示合集ID列表
 * @param {number} mid - 用户ID
 * @returns {Promise<number[]>} 合集ID列表
 */
export const getDisplaySeasons = async (mid: number): Promise<number[]> => {
  try {
    // 获取合集显示设置
    const seasonDisplay = await SeasonDisplay.findOne({ mid });
    
    if (seasonDisplay && seasonDisplay.displayIds.length > 0) {
      return seasonDisplay.displayIds;
    }
    
    // 如果用户不存在或没有设置显示的合集ID，则返回空数组
    return [];
  } catch (error) {
    console.error('获取用户显示合集失败:', error);
    throw new Error('获取用户显示合集失败');
  }
};

/**
 * @desc 更新用户显示的合集ID列表
 * @param {number} mid - 用户ID
 * @param {number[]} seasonIds - 合集ID列表
 * @returns {Promise<number[]>} 更新后的合集ID列表
 */
export const updateDisplaySeasons = async (mid: number, seasonIds: number[]): Promise<number[]> => {
  try {
    // 更新合集显示设置
    await SeasonDisplay.findOneAndUpdate(
      { mid },
      { displayIds: seasonIds },
      { upsert: true, new: true }
    );
    
    return seasonIds;
  } catch (error) {
    console.error('更新用户显示合集失败:', error);
    throw new Error('更新用户显示合集失败');
  }
};