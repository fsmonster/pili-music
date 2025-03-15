import type { MediaItem } from "./common";
export interface SeasonListParams {
  /**
   * 填写web 返回值才会包含用户收藏的视频合集
   */
  platform: string;
  /**
   * 页码
   */
  pn: number;
  /**
   * 每页数量
   */
  ps: number;
  /**
   * 目标用户mid
   */
  up_mid: number;
  [property: string]: any;
}

export interface SeasonListResponse {
  /**
   * 创建的合集数
   */
  count: number;
  has_more: boolean;
  list: SeasonList[];
  [property: string]: any;
}

/**
 * 合集
 */
export interface SeasonList {
  attr: number;
  attr_desc: string;
  bvid: string;
  cover: string;
  cover_type: number;
  ctime: number;
  fav_state: number;
  fid: number;
  /**
   * 合集id
   */
  id: number;
  intro: string;
  is_top: boolean;
  link: string;
  media_count: number;
  /**
   * 创建用户mid
   */
  mid: number;
  mtime: number;
  play_switch: number;
  recent_fav: null;
  state: number;
  title: string;
  type: number;
  upper: Upper;
  view_count: number;
  vt: number;
  [property: string]: any;
}

export interface Upper {
  face: string;
  mid: number;
  name: string;
  [property: string]: any;
}

export interface SeasonContentParams {
  /**
   * 合集ID
   */
  season_id: number;
  [property: string]: any;
}

/**
 * 合集内容响应数据
 */
export interface SeasonContentResponse {
  /**
   * 收藏夹基本信息
   */
  info: Info;
  /**
   * 收藏夹中的具体媒体列表
   */
  medias: MediaItem[];
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
