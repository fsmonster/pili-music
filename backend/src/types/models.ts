/**
 * 数据模型相关类型定义
 */
import { Document, Types } from 'mongoose';

// 用户偏好设置接口
export interface UserPreferences {
  theme?: string;
  audioQuality?: string;
  [key: string]: any;
}

// 用户模型接口
export interface IUser extends Document {
  mid: string | number;
  username: string;
  avatar: string;
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

// UP主信息接口
export interface IUpper {
  mid: string;
  name: string;
}

// 最近播放记录模型接口
export interface IRecentPlay extends Document {
  mid: string;
  bvid: string;
  aid?: number;
  cid?: number;
  title: string;
  cover?: string;
  duration?: number;
  playedAt: Date;
  upper?: IUpper;
  createdAt: Date;
  updatedAt: Date;
}

// 喜欢的音乐模型接口
export interface ILike extends Document {
  mid: string;
  bvid: string;
  aid?: number;
  cid?: number;
  title: string;
  cover?: string;
  duration?: number;
  upper?: IUpper;
  likedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 自定义播放列表模型接口
export interface ICustomPlaylist extends Document {
  mid: string;
  name: string;
  description?: string;
  cover?: string;
  isPublic: boolean;
  items: IPlaylistItem[];
  createdAt: Date;
  updatedAt: Date;
}

// 播放列表项目接口
export interface IPlaylistItem {
  bvid: string;
  aid?: number;
  cid?: number;
  title: string;
  cover?: string;
  duration?: number;
  upper?: IUpper;
  addedAt: Date;
}
