import FavoriteDisplay from '../models/favorite.js';

/**
 * @desc 获得用户显示收藏夹ID列表
 * @param {number} mid - 用户ID
 * @returns {Promise<number[]>} 收藏夹ID列表
 */
export const getDisplayFavorites = async (mid: number): Promise<number[]> => {
  try {
    // 获取收藏夹显示设置
    const favoriteDisplay = await FavoriteDisplay.findOne({ mid });
    
    if (favoriteDisplay && favoriteDisplay.displayIds.length > 0) {
      return favoriteDisplay.displayIds;
    }
    
    // 如果用户不存在或没有设置显示的收藏夹ID，则返回空数组
    return [];
  } catch (error) {
    console.error('获取用户显示收藏夹失败:', error);
    throw new Error('获取用户显示收藏夹失败');
  }
};

/**
 * @desc 更新用户显示的收藏夹ID列表
 * @param {number} mid - 用户ID
 * @param {number[]} displayIds - 收藏夹ID列表
 * @returns {Promise<number[]>} 更新后的收藏夹ID列表
 */
export const updateDisplayFavorites = async (mid: number, displayIds: number[]): Promise<number[]> => {
  try {
    // 更新专用的收藏夹显示设置模型
    await FavoriteDisplay.findOneAndUpdate(
      { mid },
      { displayIds: displayIds },
      { upsert: true, new: true }
    );
    
    return displayIds;
  } catch (error) {
    console.error('更新用户显示收藏夹失败:', error);
    throw new Error('更新用户显示收藏夹失败');
  }
};