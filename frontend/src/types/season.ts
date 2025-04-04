import type { MediaItem, Info, MediaUpper, Archive, SeriesArchivesResponse } from "./index";

/**
 * 该合集的元数据请求参数
 * 请求一条数据获取相关Meta
 */
export interface SeasonMetaParams {
  /**
   * 风控验证? 若被风控则必要(如User-Agent不正常)
   */
  gaia_vtoken?: string;
  /**
   * 目标用户mid
   */
  mid?: number;
  /**
   * 页码索引
   */
  page_num: number;
  /**
   * 单页内容数量
   */
  page_size: number;
  /**
   * 合集ID
   */
  season_id: number;
  w_rid?: string;
  web_location?: string;
  wts?: number;
  [property: string]: any;
}

/**
 * 该合集的视频列表请求参数
 */
export type SeasonArchivesParams = SeasonMetaParams;

/**
 * 该合集的元数据
 */
export interface SeasonMeta {
  /**
   * 合集类别 ID（具体类别待确认）
   */
  category: number;
  /**
   * 合集封面 URL
   */
  cover: string;
  /**
   * 合集描述
   */
  description: string;
  /**
   * 创建合集的用户 ID
   */
  mid: number;
  /**
   * 合集名称
   */
  name: string;
  /**
   * 合集发布时间（时间戳，单位：秒）
   */
  ptime: number;
  /**
   * 合集 ID
   */
  season_id: number;
  /**
   * 合集中包含的视频总数
   */
  total: number;
  [property: string]: any;
}

/**
 * 该合集的视频列表信息
 */
export interface SeasonArchivesResponse extends SeriesArchivesResponse{
  meta: SeasonMeta;
};

/**
 * 该合集的视频列表请求参数
 */
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

/**
 * 该合集列表元素的元数据
 */
export interface SeasonListItemMeta {
  /**
   * 该合集所属分类
   */
  category: number;
  /**
   * 该合集的封面 URL
   */
  cover: string;
  /**
   * 该合集的描述
   */
  description: string;
  /**
   * 创建该合集的用户 ID
   */
  mid: number;
  /**
   * 该合集的名称
   */
  name: string;
  /**
   * 该合集的发布时间（时间戳）
   */
  ptime: number;
  /**
   * 该合集的 ID
   */
  season_id: number;
  /**
   * 该合集包含的视频总数
   */
  total: number;
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
  upper: MediaUpper;
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
 * 合集内容
 */
export type SeasonContent = SeasonContentResponse;

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
 * 用户合集
 */
export interface UserSeasonList {
  /**
   * 该合集下的视频列表
   */
  archives: Archive[];
  /**
   * 该合集的元数据
   */
  meta: SeasonListItemMeta;
  /**
   * 该合集中最近更新的视频 AV 号
   */
  recent_aids: number[];
  [property: string]: any;
}