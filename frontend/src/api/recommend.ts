import { biliRequest } from '../utils/request';
import type { ApiResponse, Archive } from '../types';

/**
 * 推荐参数
 */
export interface RecommendParams {
    device?: string;
    display_id?: number;
    /**
     * 分区代码
     * 音乐区-1008
     */
    from_region: number;
    plat?: number;
    /**
     * 请求页数
     */
    request_cnt: number;
    /**
     * WBI 签名鉴权
     */
    w_rid?: string;
    web_location?: string;
    /**
     * WBI 签名鉴权
     */
    wts?: number;
    [property: string]: any;
}

/**
 * 推荐响应
 */
export interface RecommendResponse {
    code: number;
    message: string;
    data: Archive[];
}

/**
 * 获取推荐音频
 * @param params 推荐参数
 * @returns 推荐音频列表
 * @access Public - 不需要登录
 */
export async function recommend(params: RecommendParams): Promise<RecommendResponse> {
  try {
    const response = await biliRequest.get<RecommendResponse>('/web-interface/region/feed/rcmd',
      { params });
    if (response.data.code !== 0) {
      throw new Error(response.data.message || '获取推荐失败');
    }
    return response.data;
  } catch (error) {
    console.error('获取推荐失败:', error);
    throw error;
  }
}