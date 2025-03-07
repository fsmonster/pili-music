import User from '../models/User.js';
import axios from 'axios';

/**
 * @desc 处理用户登录后的信息保存
 * @param {Object} userData - B站返回的用户数据
 * @returns {Object} 处理后的用户数据
 */
export const saveUserInfo = async (userData) => {
  try {
    // 从B站API响应中提取用户信息
    const { mid: uid, uname: username, face: avatar } = userData;
    
    // 查找用户是否已存在
    let user = await User.findOne({ uid });
    
    if (user) {
      // 如果用户存在，更新信息
      user = await User.findOneAndUpdate(
        { uid },
        { 
          username, 
          avatar,
          updatedAt: new Date()
        },
        { new: true }
      );
    } else {
      // 如果用户不存在，创建新用户
      user = await User.create({
        uid,
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
 * @param {String} uid - 用户ID
 * @returns {Object} 用户信息
 */
export const getUserInfo = async (uid) => {
  try {
    const user = await User.findOne({ uid });
    return user;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    throw new Error('获取用户信息失败');
  }
};

/**
 * @desc 更新用户偏好设置
 * @param {String} uid - 用户ID
 * @param {Object} preferences - 用户偏好设置
 * @returns {Object} 更新后的用户信息
 */
export const updateUserPreferences = async (uid, preferences) => {
  try {
    const user = await User.findOneAndUpdate(
      { uid },
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
 * @param {String} uid - 用户ID
 * @param {Array} favoriteIds - 收藏夹ID列表
 * @returns {Object} 更新后的用户信息
 */
export const updateDisplayFavorites = async (uid, favoriteIds) => {
  try {
    const user = await User.findOneAndUpdate(
      { uid },
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
 * @param {String} uid - 用户ID
 * @param {Array} seasonIds - 合集ID列表
 * @returns {Object} 更新后的用户信息
 */
export const updateDisplaySeasons = async (uid, seasonIds) => {
  try {
    const user = await User.findOneAndUpdate(
      { uid },
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
