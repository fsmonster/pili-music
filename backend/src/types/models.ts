/**
 * 数据模型相关类型定义
 */
import { Document } from 'mongoose';

/**
 * 用户偏好设置接口
 */
export interface UserPreferences {
  theme?: string;
  audioQuality?: string;
  [key: string]: any;
}

/**
 * 用户模型接口
 */
export interface IUser extends Document {
  mid: number;
  username: string;
  avatar: string;
  isLogin: boolean;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: Date;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
  preferences?: UserPreferences;
  displayFavoriteIds?: string[];
  displaySeasonIds?: string[];
}

/**
 * UP主信息接口
 */
export interface IUpper {
  mid: number;
  name: string;
}

/**
 * 自建歌单列表项目接口
 */
export interface IPlaylistItem {
  avid?: number;
  bvid: string;
  cid?: number;
  title: string;
  cover?: string;
  duration?: number;
  upper?: IUpper;
  addedAt: Date;
}
