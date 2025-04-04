import { biliRequest, biliSearchRequest } from '../utils/request';
import { buildWbiUrl } from '../utils/wbi';
import type { ApiResponse, 
  SearchParams, 
  SearchResponse,
  SearchSuggestionResponse } from '../types';

/**
 * 搜索接口
 * @param params 搜索参数
 * @returns 搜索结果
 * @access Public - 不需要登录，但需要 WBI 签名和 buvid3 cookie
 */
export async function search(params: SearchParams): Promise<SearchResponse> {
  try {
    // 构建带有 WBI 签名的 URL
    const url = await buildWbiUrl('/web-interface/search/type', params);
    
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

/**
 * 搜索建议接口
 * @param term 搜索关键词
 * @returns 搜索建议列表
 * @access Public - 不需要登录
 */
export async function searchSuggestion(term: string): Promise<SearchSuggestionResponse> {
  try {
    const response = await biliSearchRequest.get<SearchSuggestionResponse>('/main/suggest',
      { params: { term } });
    if (response.data.code !== 0) {
      throw new Error(response.data.message || '搜索失败');
    }
    return response.data;
  } catch (error) {
    console.error('搜索失败:', error);
    throw error;
  }
}