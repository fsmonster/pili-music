import type { MediaItem, Info, Upper } from "./common";
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
