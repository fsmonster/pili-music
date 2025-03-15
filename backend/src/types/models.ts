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
 * 最近播放记录模型接口
 */
export interface IRecentPlay extends Document {
  mid: number;
  bvid: string;
  avid?: number;
  cid?: number;
  title: string;
  cover?: string;
  duration?: number;
  playedAt: Date;
  upper?: IUpper;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 喜欢的音乐模型接口
 */
export interface ILike extends Document {
  mid: number;
  bvid: string;
  avid?: number;
  cid?: number;
  title: string;
  cover?: string;
  duration?: number;
  upper?: IUpper;
  likedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 自建歌单列表模型
 */
export interface ICustomPlaylist extends Document {
  mid: number;
  title: string;
  intro?: string;
  cover?: string;
  isPublic: boolean;
  items: IPlaylistItem[];
  createdAt: Date;
  updatedAt: Date;
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
