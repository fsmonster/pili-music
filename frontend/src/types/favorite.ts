import type { MediaItem } from "./mediaItem";

/** 
 * @desc  收藏夹 - 列表响应
 * @property {number} count - 收藏夹数量
 * @property {Favorite[]} list - 收藏夹列表
 */

export interface FavoriteListResponse {
    count: number;
    list: Favorite[];
}
  
// 收藏夹 - 类型
export interface Favorite {
    id: number;          // 收藏夹mlid
    fid: number;         // 收藏夹原始id
    mid: number;         // 创建者mid
    title: string;       // 收藏夹标题
    cover?: string;      // 收藏夹封面
    media_count: number; // 收藏夹内容数
}

/** 
 * @desc 收藏夹 - 元信息 
 */
export interface FavoriteInfo extends Favorite {
    upper?: {
      mid: number;
      name: string;
      face: string;
    };
}
  
/**
 * @desc  收藏夹 - 内容响应列表(收藏夹元信息 + 内容列表)
 */
export interface FavoriteContentResponse {
    info: FavoriteInfo;
    medias: MediaItem[];
}