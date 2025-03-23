import SeriesDisplay from '../models/series.js';

/**
 * @desc 获得用户显示系列ID列表
 * @param {number} mid - 用户ID
 * @returns {Promise<number[]>} 系列ID列表
 */
export const getDisplaySeries = async (mid: number): Promise<number[]> => {
  try {
    // 获取系列显示设置
    const seriesDisplay = await SeriesDisplay.findOne({ mid });
    
    if (seriesDisplay && seriesDisplay.displayIds.length > 0) {
      return seriesDisplay.displayIds;
    }
    
    // 如果用户不存在或没有设置显示的系列ID，则返回空数组
    return [];
  } catch (error) {
    console.error('获取用户显示系列失败:', error);
    throw new Error('获取用户显示系列失败');
  }
};

/**
 * @desc 更新用户显示的系列ID列表
 * @param {number} mid - 用户ID
 * @param {number[]} displayIds - 系列ID列表
 * @returns {Promise<number[]>} 更新后的系列ID列表
 */
export const updateDisplaySeries = async (mid: number, displayIds: number[]): Promise<number[]> => {
  try {
    // 更新系列显示设置
    const updatedDisplaySeries = await SeriesDisplay.findOneAndUpdate(
      { mid },
      { $set: { displayIds } },
      { upsert: true, new: true }
    );
    return updatedDisplaySeries.displayIds;
  } catch (error) {
    console.error(`更新用户 ${mid} 显示系列失败:`, error);
    throw new Error(`更新用户 ${mid} 显示系列失败`);
  }
};
