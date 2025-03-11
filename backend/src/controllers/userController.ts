import User from '../models/user.js';
import { IUser } from '../types/models.js';

/**
 * B站用户数据接口
 */
interface BilibiliUserData {
  mid: string;
  uname: string;
  face: string;
  [key: string]: any;
}

/**
 * 用户偏好设置接口
 */
interface UserPreferences {
  theme?: string;
  audioQuality?: string;
  showLyrics?: boolean;
  [key: string]: any;
}

/**
 * @desc 处理用户登录后的信息保存
 * @param {BilibiliUserData} userData - B站返回的用户数据
 * @returns {Promise<IUser>} 处理后的用户数据
 */
export const saveUserInfo = async (userData: BilibiliUserData): Promise<IUser> => {
  try {
    // 从B站API响应中提取用户信息
    const { mid: mid, uname: username, face: avatar } = userData;    
    
    // 查找用户是否已存在
    let user = await User.findOne({ mid });
    
    if (user) {
      // 如果用户存在，更新信息
      user = await User.findOneAndUpdate(
        { mid },
        { 
          username, 
          avatar,
          updatedAt: new Date()
        },
        { new: true }
      );
      
      if (!user) {
        throw new Error('更新用户信息失败');
      }
    } else {
      // 如果用户不存在，创建新用户
      user = await User.create({
        mid,
        username,
        avatar,
        displayFavoriteIds: [],
        displaySeasonIds: []
      });
    }
    
    return user;
  } catch (error) {
    console.error('保存用户信息失败:', error);
    throw new Error('保存用户信息失败');
  }
};

/**
 * @desc 获取用户信息
 * @param {string} mid - 用户ID
 * @returns {Promise<IUser | null>} 用户信息
 */
export const getUserInfo = async (mid: string): Promise<IUser | null> => {
  try {
    const user = await User.findOne({ mid });
    return user;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    throw new Error('获取用户信息失败');
  }
};

/**
 * @desc 更新用户偏好设置
 * @param {string} mid - 用户ID
 * @param {UserPreferences} preferences - 用户偏好设置
 * @returns {Promise<IUser | null>} 更新后的用户信息
 */
export const updateUserPreferences = async (mid: string, preferences: UserPreferences): Promise<IUser | null> => {
  try {
    const user = await User.findOneAndUpdate(
      { mid },
      { 
        preferences,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    return user;
  } catch (error) {
    console.error('更新用户偏好设置失败:', error);
    throw new Error('更新用户偏好设置失败');
  }
};

/**
 * @desc 更新用户显示的收藏夹ID列表
 * @param {string} mid - 用户ID
 * @param {string[]} favoriteIds - 收藏夹ID列表
 * @returns {Promise<IUser | null>} 更新后的用户信息
 */
export const updateDisplayFavorites = async (mid: string, favoriteIds: string[]): Promise<IUser | null> => {
  try {
    const user = await User.findOneAndUpdate(
      { mid },
      { 
        displayFavoriteIds: favoriteIds,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    return user;
  } catch (error) {
    console.error('更新用户显示收藏夹失败:', error);
    throw new Error('更新用户显示收藏夹失败');
  }
};

/**
 * @desc 更新用户显示的合集ID列表
 * @param {string} mid - 用户ID
 * @param {string[]} seasonIds - 合集ID列表
 * @returns {Promise<IUser | null>} 更新后的用户信息
 */
export const updateDisplaySeasons = async (mid: string, seasonIds: string[]): Promise<IUser | null> => {
  try {
    const user = await User.findOneAndUpdate(
      { mid },
      { 
        displaySeasonIds: seasonIds,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    return user;
  } catch (error) {
    console.error('更新用户显示合集失败:', error);
    throw new Error('更新用户显示合集失败');
  }
};
