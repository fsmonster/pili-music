import type { MediaItem } from './mediaItem'

// 合集 - 列表响应
export interface SeasonListResponse {
    count: number;
    list: Season[];
}

// 合集 - 类型
export interface Season {
    id: number;
    title: string;
    cover: string;
    media_count: number;
}

// 合集 - 内容响应
export interface SeasonContentResponse {
    info: Season;
    medias: MediaItem[];
}
  
// 合集 - 详细信息
export interface SeasonInfo extends Season {
  upper: {
    mid: number;
    name: string;
    face: string;
  };
}
  
