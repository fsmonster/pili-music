/**
 * API响应类型定义
 */

// 通用API响应格式
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 收藏夹列表响应
export interface FavoriteListResponse {
  count: number;
  list: Favorite[];
}

// 收藏夹类型
export interface Favorite {
  id: number;          // 收藏夹mlid
  fid: number;         // 收藏夹原始id
  mid: number;         // 创建者mid
  title: string;       // 收藏夹标题
  cover: string;       // 收藏夹封面
  media_count: number; // 收藏夹内容数
}

// 收藏夹内容响应
export interface FavoriteContentResponse {
  info: FavoriteInfo;
  medias: FavoriteItem[];
}

// 收藏夹详细信息
export interface FavoriteInfo extends Favorite {
  upper: {
    mid: number;
    name: string;
    face: string;
  };
}

// 收藏内容类型
export interface FavoriteItem {
  id: number;           // 视频avid
  type: number;         // 类型
  title: string;        // 标题
  cover: string;        // 封面
  intro: string;        // 简介
  page: number;         // 分P数
  duration: number;     // 时长
  upper: {              // UP主信息
    mid: number;
    name: string;
  };
  cid?: number;         // 分P的cid
  bvid: string;        // 视频bvid
}

// 合集类型
export interface Season {
  id: number;
  title: string;
  cover: string;
  media_count: number;
}

// 音频流信息
export interface AudioStream {
  id: number;
  baseUrl: string;
  bandwidth: number;
  mimeType: string;
  codecs: string;
}
