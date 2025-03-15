/**
 * 通用 API 响应格式
 */
export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}

/**
 * @desc 媒体列表项类型 - 用于显示歌单列表(没有cid)
 */
export interface MediaItem {
    id: number;           // 视频avid
    bvid: string;        // 视频bvid
    cid: number;          // 视频cid
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
}

