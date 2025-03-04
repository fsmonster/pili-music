/**
 * @desc 媒体列表项类型 - 用于显示歌单列表
 */
export interface MediaItem {
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