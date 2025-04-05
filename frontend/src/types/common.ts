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
 * 内容id，视频稿件：视频稿件avid
 * 音频：音频auid
 * 视频合集：视频合集id
 */
  id: number;
  // 视频稿件bvid
  bv_id: string;
  // 视频稿件bvid
  bvid: string;
  // cid
  cid?: number;
  // 标题
  title: string;
  // 封面url
  cover: string;
  // 音频/视频时长
  duration: number;
  // 发布时间
  pubtime: number;
  // 失效，0: 正常；9: up自己删除；1: 其他原因删除
  attr?: number;
  // 状态数
  cnt_info?: MediaCntInfo;
  // 投稿时间
  ctime?: number;
  // 收藏时间
  fav_time?: number;
  // 简介
  intro?: string;
  // 跳转uri
  link?: string;
  // 媒体列表链接
  media_list_link?: string;
  // OGV 信息
  ogv?: null;
  // 视频分P数
  page?: number;
  // 剧集信息
  season?: null;
  /**
   * 内容类型，2：视频稿件
   * 12：音频
   * 21：视频合集
   */
  type?: number;
  // first_cid
  ugc?: Ugc;
  // UP主信息
  upper?: MediaUpper;
  // 是否启用 vt
  enable_vt?: number;
  // vt 显示信息
  vt_display?: string;
  // 是否是用户自己创建或观看的合集
  is_self_view?: boolean;
  // 状态数 - archive 特有
  stat?: Stat;
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
  cover: string;
  enable_vt: number;
  /**
   * 收藏夹 ID
   */
  id: number;
  intro: string;
  /**
   * 收藏夹内资源数量
   */
  media_count: number;
  season_type: number;
  title: string;
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

export interface Archive {
  /**
   * 视频 AV 号
   */
  aid: number;
  /**
   * 视频 BV 号
   */
  bvid: string;
  /**
   * 视频创建时间（时间戳）
   */
  ctime: number;
  /**
   * 视频时长（单位：秒）
   */
  duration: number;
  /**
   * 是否启用“互动视频”功能
   */
  enable_vt: boolean;
  /**
   * 是否为互动视频
   */
  interactive_video: boolean;
  /**
   * 是否为课程视频
   */
  is_lesson_video: number;
  /**
   * 视频封面 URL
   */
  pic: string;
  /**
   * 用户上次播放的位置（秒）
   */
  playback_position: number;
  /**
   * 视频发布时间（时间戳）
   */
  pubdate: number;
  /**
   * 视频的统计信息
   */
  stat: Stat;
  /**
   * 视频状态（可能用于表示审核、删除等状态）
   */
  state: number;
  /**
   * 视频标题
   */
  title: string;
  /**
   * 是否为付费内容（0 表示免费）
   */
  ugc_pay: number;
  /**
   * 互动视频的显示文本
   */
  vt_display: string;
  [property: string]: any;
}

/**
 * 视频的统计信息
 */
export interface Stat {
  /**
   * 播放量
   */
  view: number;
  /**
   * 互动视频相关数据
   */
  vt?: number;
  [property: string]: any;
}
