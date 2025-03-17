/**
 * 通用 API 响应格式
 */
export interface ApiResponse<T> {
  code: number;
  message: string;
  ttl: number;
  data: T;
}

/**
 * 📌 收藏特有  🎵 合集特有
 */

export interface MediaItem {
  /**
   * 失效，0: 正常；9: up自己删除；1: 其他原因删除
   */
  attr?: number;
  /**
   * 视频稿件bvid
   */
  bv_id: string;
  /**
   * 视频稿件bvid
   */
  bvid: string;
  /**
   * 状态数
   */
  cnt_info: MediaCntInfo;
  /**
   * 封面url
   */
  cover: string;
  /**
   * 📌 投稿时间
   */
  ctime?: number;
  /**
   * 音频/视频时长
   */
  duration: number;
  /**
   * 📌 收藏时间
   */
  fav_time?: number;
  /**
   * 内容id，视频稿件：视频稿件avid
   * 音频：音频auid
   * 视频合集：视频合集id
   */
  id: number;
  /**
   * 📌 cid
   */
  cid?: number;
  /**
   * 📌 简介
   */
  intro?: string;
  /**
   * 📌 跳转uri
   */
  link?: string;
  /**
   * 📌 媒体列表链接
   */
  media_list_link?: string;
  /**
   * 📌 OGV 信息
   */
  ogv?: null;
  /**
   * 📌 视频分P数
   */
  page?: number;
  /**
   * 发布时间
   */
  pubtime: number;
  /**
   * 📌 剧集信息
   */
  season?: null;
  /**
   * 标题
   */
  title: string;
  /**
   * 📌 内容类型，2：视频稿件
   * 12：音频
   * 21：视频合集
   */
  type?: number;
  /**
   * first_cid
   */
  ugc?: Ugc;
  /**
   * UP主信息
   */
  upper: MediaUpper;
  /**
   * 🎵 是否启用 vt
   */
  enable_vt?: number;
  /**
   * 🎵 vt 显示信息
   */
  vt_display?: string;
  /**
   * 🎵 是否是用户自己创建或观看的合集
   */
  is_self_view?: boolean;
  [property: string]: any;
}

/**
 * 状态数
 */
export interface MediaCntInfo {
  /**
   * 收藏数
   */
  collect: number;
  /**
   * 弹幕数
   */
  danmaku: number;
  /**
   * 播放数
   */
  play: number;
  play_switch: number;
  reply: number;
  view_text_1: string;
  vt: number;
  [property: string]: any;
}

/**
 * first_cid
 */
export interface Ugc {
  first_cid: number;
  [property: string]: any;
}

/**
 * UP主信息
 */
export type Upper = MediaUpper;

export interface MediaUpper {
  /**
   * 创建者头像 URL
   */
  face: string;
  /**
   * 是否已关注创建者
   */
  followed?: boolean;
  /**
   * 创建者mid
   */
  mid: number;
  /**
   * 创建者昵称
   */
  name: string;
  vip_statue?: number;
  /**
   * 会员类别（0：无，1：月大会员，2：年度及以上大会员）
   */
  vip_type?: number;
  [property: string]: any;
}

/**
 * 收藏夹基本信息
 */
export interface Info {
  /**
   * 收藏夹统计信息
   */
  cnt_info: InfoCntInfo;
  /**
   * 收藏夹封面图片 URL
   */
  cover: string;
  /**
   * 是否启用虚拟化（未知用途）
   */
  enable_vt: number;
  /**
   * 收藏夹 ID
   */
  id: number;
  /**
   * 收藏夹简介
   */
  intro: string;
  /**
   * 收藏夹内资源数量
   */
  media_count: number;
  /**
   * 收藏夹类型（例如视频、番剧等）
   */
  season_type: number;
  /**
   * 收藏夹名称
   */
  title: string;
  /**
   * 收藏夹创建者信息
   */
  upper: InfoUpper;
  [property: string]: any;
}

/**
 * 收藏夹统计信息
 */
export interface InfoCntInfo {
  /**
   * 收藏量
   */
  collect: number;
  /**
   * 弹幕量
   */
  danmaku: number;
  /**
   * 播放量
   */
  play: number;
  /**
   * 未知字段，可能是虚拟观看数
   */
  vt: number;
  [property: string]: any;
}

/**
 * 收藏夹创建者信息
 */
export interface InfoUpper {
  /**
   * 创建者 UID
   */
  mid: number;
  /**
   * 创建者昵称
   */
  name: string;
  [property: string]: any;
}


