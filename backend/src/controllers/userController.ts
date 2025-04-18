import User from '../models/user.js';
import { IUser } from '../models/user.js';
import { BilibiliUserData, UserPreferences } from '../types/user.js';

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
 * @param {number} mid - 用户ID
 * @param {UserPreferences} preferences - 用户偏好设置
 * @returns {Promise<IUser | null>} 更新后的用户信息
 */
export const updateUserPreferences = async (mid: number, preferences: UserPreferences): Promise<IUser | null> => {
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
 * @desc 登出
 * @param {number} mid - 用户ID
 * @returns {Promise<IUser | null>} 更新后的用户信息
 */
export const logout = async (mid: number): Promise<IUser | null> => {
  try {
    const user = await User.findOneAndUpdate(
      { mid },
      { 
        isLogin: false,
        accessToken: null,
        refreshToken: null,
        tokenExpiry: null,
        updatedAt: new Date()
      },
      { new: true }
    );

    return user;
  } catch (error) {
    console.error('登出失败:', error);
    throw new Error('登出失败');
  }
};

