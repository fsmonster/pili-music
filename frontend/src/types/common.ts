/**
 * 通用 API 响应格式
 */
export interface ApiResponse<T> {
  code: number;
  message: string;
  ttl: number;
  data: T;
}

export interface MediaItem {
  /**
   * 失效，0: 正常；9: up自己删除；1: 其他原因删除
   */
  attr: number;
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
   * 投稿时间
   */
  ctime: number;
  /**
   * 音频/视频时长
   */
  duration: number;
  /**
   * 收藏时间
   */
  fav_time: number;
  /**
   * 内容id，视频稿件：视频稿件avid
   * 音频：音频auid
   * 视频合集：视频合集id
   */
  id: number;
  /**
   * cid
   */
  cid: number;
  /**
   * 简介
   */
  intro: string;
  /**
   * 跳转uri
   */
  link: string;
  media_list_link: string;
  ogv: null;
  /**
   * 视频分P数
   */
  page: number;
  /**
   * 发布时间
   */
  pubtime: number;
  season: null;
  /**
   * 标题
   */
  title: string;
  /**
   * 内容类型，2：视频稿件
   * 12：音频
   * 21：视频合集
   */
  type: number;
  ugc: Ugc;
  /**
   * UP主信息
   */
  upper: MediaUpper;
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
export interface MediaUpper {
  face: string;
  mid: number;
  name: string;
  [property: string]: any;
}
