import type { MediaItem } from './common';

/**
 * 收藏夹 - 列表参数
 */
export interface FavoriteListParams {
  /**
   * 目标用户mid
   */
  up_mid: number;
  /**
   * 视频avid，查看视频是否收藏
   */
  rid?: number;
  [property: string]: any;
}

export interface FavoriteListResponse {
  /**
   * 创建的收藏夹数
   */
  count: number;
  /**
   * 收藏夹列表
   */
  list: FavoriteList[];
  season: null;
  [property: string]: any;
}

export interface FavoriteList {
  /**
   * 属性位，- 22 - 公开
   * - 2 - 公开、有描述
   * - 23 - 私密
   * - 119 - 私密，有描述
   */
  attr: number;
  /**
   * 目标id是否存在于该收藏夹，存在于该收藏夹：1
   * 不存在于该收藏夹：0
   */
  fav_state: number;
  /**
   * 收藏夹原始id
   */
  fid: number;
  /**
   * 收藏夹mlid（完整id），收藏夹原始id+创建者mid尾号2位
   */
  id: number;
  /**
   * 收藏夹内容数量
   */
  media_count: number;
  /**
   * 创建者mid
   */
  mid: number;
  /**
   * 收藏夹标题
   */
  title: string;
  [property: string]: any;
}

export interface FavoriteInfoParams {
  /**
   * 目标收藏夹id（完整id）
   */
  media_id: number;
  [property: string]: any;
}

export type FavoriteInfo = FavoriteInfoResponse;

/**
 * 信息本体，无效时返回 null
 */
export interface FavoriteInfoResponse {
  /**
   * - 22 - 公开
   * - 2 - 公开、有描述
   * - 23 - 私密
   * - 119 - 私密，有描述
   */
  attr: number;
  /**
   * 收藏夹状态数
   */
  cnt_info: CntInfo;
  /**
   * 收藏夹封面图片 URL
   */
  cover: string;
  /**
   * 封面图类别（？）
   */
  cover_type: number;
  /**
   * 创建时间（时间戳）
   */
  ctime: number;
  /**
   * 收藏夹收藏状态（1：已收藏，0：未收藏，需要登录）
   */
  fav_state: number;
  /**
   * 收藏夹原始id
   */
  fid: number;
  /**
   * 收藏夹mlid（完整id），收藏夹原始id+创建者mid尾号2位
   */
  id: number;
  /**
   * 备注
   */
  intro: string;
  /**
   * 是否置顶
   */
  is_top: boolean;
  /**
   * 点赞状态（1：已点赞，0：未点赞，需要登录）
   */
  like_state: number;
  /**
   * 收藏夹内容数量
   */
  media_count: number;
  /**
   * 创建者mid
   */
  mid: number;
  /**
   * 收藏时间（时间戳）
   */
  mtime: number;
  /**
   * 状态（？），一般为0
   */
  state: number;
  /**
   * 收藏夹标题
   */
  title: string;
  /**
   * 类型（？），一般是11
   */
  type: number;
  /**
   * 创建者信息
   */
  upper: Upper;
  [property: string]: any;
}

/**
 * 收藏夹状态数
 */
export interface CntInfo {
  /**
   * 收藏数
   */
  collect: number;
  /**
   * 播放数
   */
  play: number;
  /**
   * 分享数
   */
  share: number;
  /**
   * 点赞数
   */
  thumb_up: number;
  [property: string]: any;
}

/**
 * 创建者信息
 */
export interface Upper {
  /**
   * 创建者头像 URL
   */
  face: string;
  /**
   * 是否已关注创建者
   */
  followed: boolean;
  /**
   * 创建者mid
   */
  mid: number;
  /**
   * 创建者昵称
   */
  name: string;
  vip_statue: number;
  /**
   * 会员类别（0：无，1：月大会员，2：年度及以上大会员）
   */
  vip_type: number;
  [property: string]: any;
}

export interface FavoriteContentListParams {
  /**
   * 搜索关键字
   */
  keyword?: string;
  media_id: number;
  /**
   * 按收藏时间:mtime；按播放量: view；按投稿时间：pubtime
   */
  order?: string;
  /**
   * 平台标识
   * 可为web（影响内容列表类型）
   */
  platform?: string;
  /**
   * 页码，默认为1
   */
  pn: number;
  /**
   * 每页数量，定义域：1-20
   */
  ps?: number;
  /**
   * 分区tid
   */
  tid?: number;
  /**
   * 查询范围
   * 0：当前收藏夹（对应media_id）
   * 1：全部收藏夹
   */
  type?: number;
  [property: string]: any;
}

export type FavoriteContent = FavoriteContentResponse;

export interface FavoriteContentResponse {
  /**
   * 收藏夹是否有下一页
   */
  has_more: boolean;
  /**
   * 收藏夹元数据
   */
  info: Info;
  /**
   * 收藏夹内容
   */
  medias: MediaItem[];
  /**
   * 接口返回时间
   */
  ttl: number;
  [property: string]: any;
}

/**
 * 收藏夹元数据
 */
export interface Info {
  /**
   * 属性
   */
  attr: number;
  /**
   * 收藏夹状态数
   */
  cnt_info: InfoCntInfo;
  /**
   * 收藏夹封面图片url
   */
  cover: string;
  /**
   * 封面图类别（？）
   */
  cover_type: number;
  /**
   * 创建时间
   */
  ctime: number;
  /**
   * 收藏夹收藏状态，已收藏收藏夹：1
   * 未收藏收藏夹：0
   * 需要登录
   */
  fav_state: number;
  /**
   * 收藏夹原始id
   */
  fid: number;
  /**
   * 收藏夹mlid（完整id），收藏夹原始id+创建者mid尾号2位
   */
  id: number;
  /**
   * 收藏夹简介
   */
  intro: string;
  is_top: boolean;
  /**
   * 点赞状态，已点赞：1
   * 未点赞：0
   * 需要登录
   */
  like_state: number;
  /**
   * 收藏夹内容数量
   */
  media_count: number;
  /**
   * 创建者mid
   */
  mid: number;
  /**
   * 收藏时间
   */
  mtime: number;
  state: number;
  /**
   * 收藏夹标题
   */
  title: string;
  type: number;
  /**
   * 创建者信息
   */
  upper: InfoUpper;
  [property: string]: any;
}

/**
 * 收藏夹状态数
 */
export interface InfoCntInfo {
  /**
   * 收藏数
   */
  collect: number;
  /**
   * 播放数
   */
  play: number;
  /**
   * 分享数
   */
  share: number;
  /**
   * 点赞数
   */
  thumb_up: number;
  [property: string]: any;
}

/**
 * 创建者信息
 */
export interface InfoUpper {
  /**
   * 创建者头像url
   */
  face: string;
  /**
   * 是否已关注创建者
   */
  followed: boolean;
  /**
   * 创建者mid
   */
  mid: number;
  /**
   * 创建者昵称
   */
  name: string;
  /**
   * 会员开通状态
   */
  vip_statue: number;
  /**
   * 会员类别
   */
  vip_type: number;
  [property: string]: any;
}
