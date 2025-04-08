import type { 
    SeriesArchivesResponse,
    Page,
    UserSeasonList,
    UserSeriesList,
     } from "./index";

/**
 * B站用户信息接口（仅保留必要字段）
 * 从B站API获取的原始用户数据结构
 */
export interface BiliUserInfo {
  isLogin: boolean; // 登录状态
  face: string; // 头像URL
  mid: number; // 用户ID
  uname: string; // 用户名
}

/**
 * 本地存储的精简用户状态
 * 只保存必要的用户信息，减少存储空间占用
 */
export interface UserInfo {
  isLoggedIn: boolean;
  userInfo: {
    avatar: string; // 经过处理的头像URL（已转换为代理URL）
    username: string; // 用户名
    mid: number; // 用户ID
  } | null;
}

/**
 * B站up主信息接口响应
 */
export interface UpInfoCardResponse {
  archive_count: number;
  article_count: number;
  card: UpInfoCard;
  follower: number;
  following: boolean;
  like_num: number;
  [property: string]: any;
}

/**
 * B站up主信息接口
 */
export interface UpInfoCard extends Upper {
  approve: boolean; // 是否通过审核
  article: number; // 文章数量
  attention: number; // 关注的用户数
  attentions: string[]; // 关注的用户 mid 列表
  birthday: string; // 生日（格式：MM-DD）
  description: string; // 个人简介
  DisplayRank: string; // 显示的等级排名
  face_nft: number; // 是否是 NFT 头像（0：否，1：是）
  face_nft_type: number; // NFT 头像类型
  fans: number; // 粉丝数
  friend: number; // 互相关注数
  is_senior_member: number; // 是否是高阶会员（1：是，0：否）
  level_info: any; // 用户等级信息
  name_render: null; // 可能用于存储用户名的额外渲染信息，当前为 null
  nameplate: any; // 勋章信息（具体结构未知，使用 any）
  Official: any; // 认证信息（结构可能复杂，使用 any）
  official_verify: any; // 旧版认证信息（已废弃，使用 any）
  pendant: any; // 头像挂件信息（使用 any）
  place: string; // 可能表示位置信息（目前一般为空）
  rank: string; // 排名信息（官方已废弃）
  regtime: number; // 注册时间（Unix 时间戳）
  sex: string; // 性别（男/女/保密）
  sign: string; // 个性签名
  spacesta: number; // 主页状态（0：正常，-2：封禁）
  vip: any; // 会员信息（可能包含大会员、年度大会员等信息，使用 any）
  [property: string]: any; // 允许额外的未知字段
}

export interface Upper {
  mid: string;
  name: string;
  face: string;
}

/**
 * B站up主主页视频接口
 */
export interface VideoResponse extends SeriesArchivesResponse {}

export interface SearchVideoByKeywordsParams {
  /**
   * 用于使用关键词搜索该UP主视频稿件
   */
  keywords?: string;
  /**
   * :目标用户mid
   */
  mid: number;
  /**
   * 默认为pubdate
   * 最新发布：pubdate
   * 最多播放：click
   * 最多收藏：stow
   */
  orderby?: string;
  /**
   * 页码
   */
  pn?: number;
  /**
   * 每页数量    默认为 0, 留空为 20
   */
  ps?: number;
  [property: string]: any;
}

/**
 * 用户空间相关的数据
 */
export interface SettingsResponse {
  /**
   * 主页板块布局顺序
   */
  index_order: IndexOrder[];
  /**
   * 隐私设置，值为 0 表示未隐藏，可能的值未明确
   */
  privacy: Privacy;
  /**
   * 是否显示 NFT 开关
   */
  show_nft_switch: boolean;
  /**
   * 用户主页的主题（可能是主题 ID 或名称）
   */
  theme: string;
  /**
   * 主题预览图的路径
   */
  theme_preview_img_path: string;
  /**
   * 头像相关信息
   */
  toutu: Toutu;
  [property: string]: any;
}

export interface IndexOrder {
  /**
   * 板块 ID（未给出具体枚举）
   */
  id: number;
  /**
   * 板块名称
   */
  name: string;
  [property: string]: any;
}

/**
 * 隐私设置，值为 0 表示未隐藏，可能的值未明确
 */
export interface Privacy {
  /**
   * 番剧追番隐私设置
   */
  bangumi: number;
  /**
   * B 站短视频（BBQ）隐私设置
   */
  bbq: number;
  /**
   * 频道隐私设置
   */
  channel: number;
  /**
   * 充电视频隐私设置
   */
  charge_video: number;
  /**
   * 关闭空间勋章显示
   */
  close_space_medal: number;
  /**
   * 投币视频隐私设置
   */
  coins_video: number;
  /**
   * 订阅漫画隐私设置
   */
  comic: number;
  /**
   * 是否隐藏关注列表
   */
  disable_following: number;
  /**
   * 是否隐藏粉丝列表
   */
  disable_show_fans: number;
  /**
   * 是否隐藏学校信息
   */
  disable_show_school: number;
  /**
   * 个人装扮隐私设置
   */
  dress_up: number;
  /**
   * 收藏视频隐私设置
   */
  fav_video: number;
  /**
   * 关注的兴趣圈子隐私设置
   */
  groups: number;
  /**
   * 课程视频隐私设置
   */
  lesson_video: number;
  /**
   * 点赞视频隐私设置
   */
  likes_video: number;
  /**
   * 直播回放隐私设置
   */
  live_playback: number;
  /**
   * 是否仅展示当前佩戴的装扮
   */
  only_show_wearing: number;
  /**
   * 玩过的游戏隐私设置
   */
  played_game: number;
  /**
   * 个人标签隐私设置
   */
  tags: number;
  /**
   * 个人信息隐私设置
   */
  user_info: number;
  [property: string]: any;
}

/**
 * 头像相关信息
 */
export interface Toutu {
  /**
   * 安卓端头像 URL
   */
  android_img: string;
  /**
   * 头像过期时间戳
   */
  expire: number;
  /**
   * iPad 端头像 URL
   */
  ipad_img: string;
  /**
   * iPhone 端头像 URL
   */
  iphone_img: string;
  /**
   * 大头像图片 URL
   */
  l_img: string;
  /**
   * 适用的平台（未明确具体取值）
   */
  platform: number;
  /**
   * 小头像图片 URL
   */
  s_img: string;
  /**
   * 头像 ID
   */
  sid: number;
  /**
   * 头像缩略图 URL
   */
  thumbnail_img: string;
  [property: string]: any;
}

/**
 * 请求参数
 */
export interface SeasonAndSeriesParams {
    /**
     * 目标用户mid
     */
    mid: number;
    /**
     * 页码
     */
    page_num: number;
    /**
     * 每页数量
     */
    page_size: number;
    [property: string]: any;
}

/**
 * 响应数据
 */
export interface SeasonAndSeriesResponse {
    items_lists: ItemsLists;
    [property: string]: any;
}

export interface ItemsLists {
    page: Page;
    /**
     * 归类为“合集”的视频列表
     */
    seasons_list: UserSeasonList[];
    /**
     * 归类为“系列”的视频列表
     */
    series_list: UserSeriesList[];
    [property: string]: any;
}