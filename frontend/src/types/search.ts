/**
 * 搜索类型枚举
 */
export enum SearchType {
  // 视频
  Video = "video",
  // 番剧
  Anime = "media_bangumi",
  // 影视
  Movie = "media_ft",
  // 直播
  Live = "live",
  // 专栏
  Article = "article",
  // 话题
  Topic = "topic",
  // 用户
  User = "bili_user",
  // 相簿
  Photo = "photo",
}

/**
 * 视频搜索排序方式
 */
export enum VideoSearchOrder {
  /** 综合排序（默认） */
  TotalRank = 'totalrank',

  /** 最多点击 */
  Click = 'click',

  /** 最新发布 */
  PubDate = 'pubdate',

  /** 最多弹幕 */
  Danmaku = 'dm',

  /** 最多收藏 */
  Favorite = 'stow',

  /** 最多评论 */
  Comment = 'scores',

  /** 最多喜欢（仅专栏） */
  Like = 'attention',
}

/**
 * 用户搜索排序方式
 */
export enum UserSearchOrder {
  /** 默认排序 */
  Default = '0',

  /** 粉丝数排序 */
  Fans = 'fans',

  /** 用户等级排序 */
  Level = 'level',
}


/**
 * 搜索时间范围
 */
export enum SearchDuration {
  // 全部时长
  All = 0,
  // 10分钟以下
  ShortThan10Min = 1,
  // 10-30分钟
  Between10And30Min = 2,
  // 30-60分钟
  Between30And60Min = 3,
  // 60分钟以上
  LongerThan60Min = 4,
}

/**
 * 搜索参数接口
 */
export interface SearchParams {
  // 搜索关键词
  keyword: string;
  // 搜索类型
  search_type: SearchType;
  // 排序方式
  order?: VideoSearchOrder | UserSearchOrder;
  // 时长筛选
  duration?: SearchDuration;
  // 页码，从1开始
  page?: number;
  // 每页条数，默认20
  page_size?: number;
}

/**
 * 搜索结果项基础接口
 */
export interface SearchResponse {
  /**
   * 搜索耗时分析
   */
  cost_time: CostTime;
  /**
   * 可能与彩蛋相关（待确认）
   */
  egg_hit: number;
  /**
   * 经验标识，可能用于 A/B 测试
   */
  exp_list: any;
  /**
   * 是否在黑名单关键词内
   */
  in_black_key: number;
  /**
   * 是否在白名单关键词内
   */
  in_white_key: number;
  /**
   * 下一页索引
   */
  next: number;
  /**
   * 结果总页数
   */
  numPages: number;
  /**
   * 搜索结果总数量
   */
  numResults: number;
  /**
   * 当前页码
   */
  page: number;
  /**
   * 每页返回的结果数量
   */
  pagesize: number;
  /**
   * 实时缓存标识
   */
  realtime_cache: string;
  /**
   * 搜索结果数组
   */
  result: SearchResult[];
  rqt_type: string;
  /**
   * 搜索会话 ID，用于追踪搜索请求
   */
  seid: string;
  /**
   * 是否显示额外栏目
   */
  show_column: number;
  /**
   * 推荐关键词（可能为空）
   */
  suggest_keyword: string;
  [property: string]: any;
}

export interface OfficialVerify {
  /**
   * 认证描述
   */
  desc: string;
  /**
   * 认证类型，0 未认证，1 官方认证等
   */
  type: number;
  [property: string]: any;
}

/**
 * 用户推荐视频
 */
export interface Res {
  /**
   * AV 号
   */
  aid: number;
  /**
   * 视频链接
   */
  arcurl: string;
  /**
   * BV 号
   */
  bvid: string;
  /**
   * 投币数
   */
  coin: number;
  /**
   * 简介
   */
  desc: string;
  /**
   * 弹幕数量
   */
  dm: number;
  /**
   * 时长
   */
  duration: string;
  /**
   * 是否启用 vt
   */
  enable_vt: number;
  /**
   * 收藏数
   */
  fav: number;
  /**
   * 是否为收费视频
   */
  is_charge_video: number;
  /**
   * 是否付费
   */
  is_pay: number;
  /**
   * 是否为联合投稿
   */
  is_union_video: number;
  /**
   * 封面图 URL
   */
  pic: string;
  /**
   * 播放量
   */
  play: string;
  /**
   * 发布时间（时间戳）
   */
  pubdate: number;
  /**
   * 视频标题
   */
  title: string;
  /**
   * 视频类型
   */
  vt: number;
  /**
   * vt 展示名称
   */
  vt_display: string;
  [property: string]: any;
}


/**
 * 搜索耗时分析
 */
export interface CostTime {
  /**
   * 请求耗时
   */
  as_request: string;
  /**
   * 请求格式转换耗时
   */
  as_request_format: string;
  /**
   * 响应格式转换耗时
   */
  as_response_format: string;
  /**
   * 反序列化响应耗时
   */
  deserialize_response: string;
  /**
   * 获取词库耗时
   */
  fetch_lexicon: string;
  /**
   * 违规处理耗时
   */
  illegal_handler: string;
  /**
   * 是否为风险查询
   */
  is_risk_query: string;
  /**
   * 主搜索处理耗时
   */
  main_handler: string;
  /**
   * 参数校验耗时
   */
  params_check: string;
  /**
   * 总耗时
   */
  total: string;
  [property: string]: any;
}

export interface SearchResult extends SearchVideoResult, SearchUserResult {}

/**
 * 搜索用户结果
 */
export interface SearchUserResult {
  /**
   * 是否为 NFT 头像
   */
  face_nft: number;
  /**
   * NFT 类型
   */
  face_nft_type: number;
  /**
   * 粉丝数
   */
  fans: number;
  /**
   * 性别（0 未知，1 男，2 女）
   */
  gender: number;
  /**
   * 命中字段
   */
  hit_columns: string[];
  /**
   * 是否正在直播
   */
  is_live: number;
  /**
   * 是否为硬核会员
   */
  is_senior_member: number;
  /**
   * 是否为 UP 主（冗余字段）
   */
  is_upuser: number;
  /**
   * 等级
   */
  level: number;
  /**
   * UP 主 UID
   */
  mid: number;
  official_verify: OfficialVerify;
  /**
   * 用户推荐视频列表
   */
  res: Res[];
  /**
   * 直播间 ID
   */
  room_id: number;
  /**
   * 类型：upuser
   */
  type: string;
  /**
   * UP 主昵称
   */
  uname: string;
  /**
   * 头像 URL
   */
  upic: string;
  /**
   * 个性签名
   */
  usign: string;
  /**
   * 认证信息
   */
  verify_info: string;
  /**
   * 投稿视频数量
   */
  videos: number;
  [property: string]: any;
}

/**
 * 搜索视频结果
 */
export interface SearchVideoResult {
  /**
   * 视频 AV 号
   */
  aid: number;
  /**
   * 可能表示排名或优先级
   */
  arcrank: string;
  /**
   * 视频页面 URL
   */
  arcurl: string;
  /**
   * 区域 ID
   */
  area: number;
  /**
   * UP 主名称
   */
  author: string;
  /**
   * 是否为付费内容
   */
  badgepay: boolean;
  /**
   * 业务数据（可能为空）
   */
  biz_data: null;
  /**
   * 视频 BV 号
   */
  bvid: string;
  /**
   * 分类名称
   */
  cate_name: string;
  /**
   * 角标信息
   */
  corner: string;
  /**
   * 视频封面 URL（可能与 pic 相同）
   * 为空 - 暂时不使用
   */
  cover?: string;
  /**
   * 弹幕数
   */
  danmaku: number;
  /**
   * 视频简介（可能与 description 相同）
   */
  desc: string;
  /**
   * 视频简介
   */
  description: string;
  /**
   * 视频时长，格式为 HH:MM:SS
   */
  duration: string;
  /**
   * 是否启用 vt
   */
  enable_vt: number;
  /**
   * 剧集集数
   */
  episode_count_text: string;
  /**
   * 收藏次数
   */
  favorites: number;
  /**
   * 命中搜索关键词的字段
   */
  hit_columns: string[];
  /**
   * 结果 ID（取决于 type 类型）
   */
  id: number;
  /**
   * 是否为充电视频
   */
  is_charge_video: number;
  /**
   * 是否人为干预推荐
   */
  is_intervene: number;
  /**
   * 是否为直播
   */
  is_live_room_inline: number;
  /**
   * 是否付费视频（1 表示是）
   */
  is_pay: number;
  /**
   * 是否为联合投稿视频
   */
  is_union_video: number;
  /**
   * 点赞数
   */
  like: number;
  /**
   * 直播状态
   */
  live_status: number;
  /**
   * 直播时间
   */
  live_time: string;
  /**
   * UP 主的用户 ID
   */
  mid: number;
  /**
   * 推荐标签
   */
  new_rec_tags: string[];
  /**
   * 直播在线观看人数
   */
  online: number;
  /**
   * 父区域 ID
   */
  parent_area_id: number;
  /**
   * 父区域名称
   */
  parent_area_name: string;
  /**
   * 视频封面 URL
   */
  pic: string;
  /**
   * 播放次数
   */
  play: number;
  /**
   * 发布时间（时间戳格式）
   */
  pubdate: number;
  /**
   * 排名索引
   */
  rank_index: number;
  /**
   * 排名偏移
   */
  rank_offset: number;
  /**
   * 排名分数
   */
  rank_score: number;
  /**
   * 推荐理由
   */
  rec_reason: string;
  /**
   * 可能用于推荐的标签
   */
  rec_tags: null;
  /**
   * 发行状态
   */
  release_status: number;
  /**
   * 评论数
   */
  review: number;
  /**
   * 直播间 ID
   */
  roomid: number;
  /**
   * 发送时间（可能与 pubdate 相同）
   */
  senddate: number;
  /**
   * 直播短 ID
   */
  short_id: number;
  /**
   * 推广 ID
   */
  spread_id: number;
  /**
   * 风格 ID
   */
  style: number;
  /**
   * 字幕信息
   */
  subtitle: string;
  /**
   * 视频标签
   */
  tag: string;
  /**
   * 额外标签
   */
  tags: string;
  /**
   * 视频标题
   */
  title: string;
  type: string;
  /**
   * 视频分类 ID
   */
  typeid: string;
  /**
   * 视频分类名称
   */
  typename: string;
  /**
   * UP 主头像 URL（可能与 upic 相同）
   */
  uface: string;
  /**
   * UP 主 ID（可能与 mid 相同）
   */
  uid: number;
  /**
   * UP 主名称（可能与 author 相同）
   */
  uname: string;
  /**
   * UP 主头像 URL
   */
  upic: string;
  /**
   * 视频 URL（可能与 arcurl 相同）
   */
  url: string;
  /**
   * 用户封面图
   */
  user_cover: string;
  /**
   * 弹幕数量
   */
  video_review: number;
  /**
   * 视图类型
   */
  view_type: string;
  /**
   * 视频类型
   */
  vt: number;
  /**
   * vt 显示字段
   */
  vt_display: string;
  /**
   * 观看展示信息
   */
  watched_show: null;
  [property: string]: any;
}

/**
 * 搜索建议结果
 */
export interface SearchSuggestionResponse {
    // 0：成功
    code: number;
    exp_str: string;
    result: SearchSuggestionResult;
    stoken: string;
    total_count: number;
    [property: string]: any;
}

export interface SearchSuggestionResult {
    tag: Tag[];
    [property: string]: any;
}

export interface Tag {
    // 带有 <em class="suggest_high_light"> 的 XML 标签
    name: string;
    ref: number;
    spid: number;
    term: string;
    type: string;
    value: string;
    [property: string]: any;
}
