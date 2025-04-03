import { biliRequest } from '../utils/request';
import { buildWbiUrl } from '../utils/wbi';
import type { ApiResponse } from '../types';

/**
 * 搜索类型枚举
 */
export enum SearchType {
  // 视频
  Video = 'video',
  // 番剧
  Anime = 'media_bangumi',
  // 影视
  Movie = 'media_ft',
  // 直播
  Live = 'live',
  // 专栏
  Article = 'article',
  // 话题
  Topic = 'topic',
  // 用户
  User = 'bili_user',
  // 相簿
  Photo = 'photo',
  // 音频
  Audio = 'audio',
}

/**
 * 搜索排序方式
 */
export enum SearchOrder {
  // 综合排序
  Default = '',
  // 播放多
  Views = 'click',
  // 弹幕多
  Danmaku = 'dm',
  // 发布日期
  PubDate = 'pubdate',
  // 收藏多
  Favorites = 'stow',
  // 评论多
  Comments = 'scores',
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
  order?: SearchOrder;
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
interface SearchResultItemBase {
  // 标题
  title: string;
  // 链接
  url: string;
}

/**
 * 音频搜索结果项
 */
export interface AudioSearchResultItem extends SearchResultItemBase {
  // 音频ID
  id: number;
  // 音频标题
  title: string;
  // 封面图片
  cover: string;
  // 作者
  author: string;
  // 播放次数
  play: number;
  // 收藏次数
  favorites: number;
  // 时长（秒）
  duration: number;
  // 创建时间
  ctime: number;
  // 类别
  type: number;
  // 类别名称
  type_name: string;
  // 用户ID
  uid: number;
  // 用户名
  uname: string;
}

/**
 * 搜索结果接口
 */
export interface SearchResponse {
  // 搜索结果列表
  result: AudioSearchResultItem[];
  // 总数
  numResults: number;
  // 总页数
  numPages: number;
  // 当前页码
  page: number;
  // 每页条数
  pagesize: number;
}

/**
 * 搜索接口
 * @param params 搜索参数
 * @returns 搜索结果
 * @access Public - 不需要登录，但需要 WBI 签名和 buvid3 cookie
 */
export async function search(params: SearchParams): Promise<SearchResponse> {
  try {
    // 构建带有 WBI 签名的 URL
    const url = await buildWbiUrl('/web-interface/search/type', {
      keyword: params.keyword,
      search_type: params.search_type,
      order: params.order || SearchOrder.Default,
      duration: params.duration || SearchDuration.All,
      page: params.page || 1,
      page_size: params.page_size || 20,
    });
    
    // 发送请求
    const res = await biliRequest.get<ApiResponse<SearchResponse>>(url);
    
    if (res.data.code !== 0) {
      throw new Error(`搜索失败: ${res.data.message}`);
    }
    
    return res.data.data;
  } catch (error) {
    console.error("搜索失败:", error);
    throw error;
  }
}