import type { ApiResponse, 
  UpInfoCardResponse, 
  Upper, 
  VideoResponse, 
  SearchVideoByKeywordsParams,
  SettingsResponse,
  SeasonAndSeriesParams,
  SeasonAndSeriesResponse,
} from "../types";
import { biliRequest } from "../utils/request";

/**
 * 获取用户信息
 * @param mid 用户ID
 * @returns 用户信息
 * @access  Public - 不需要登录
 */
export async function getUserInfo(mid: number): Promise<Upper> {
  try {
    const response = await biliRequest.get<ApiResponse<UpInfoCardResponse>>('/web-interface/card',
      { params: { mid } });
    if (response.data.code !== 0) {
      throw new Error(response.data.message || '获取用户信息失败');
    }
    const card = response.data.data.card;
    return {
      mid: card.mid,
      name: card.name,
      face: card.face
    };
  } catch (error) {
    console.error('获取用户信息失败:', error);
    throw error;
  }
}

/**
 * 获取用户设置 - 隐私设置
 * @param mid 用户ID
 * @returns 用户设置
 * @access  Public - 不需要登录
 */
export async function getUserSettings(mid: number): Promise<ApiResponse<SettingsResponse>> {
  try {
    const response = await biliRequest.get<ApiResponse<SettingsResponse>>('/space/setting',
      { params: { mid } });
    if (response.data.code !== 0) {
      throw new Error(response.data.message || '获取用户设置失败');
    }
    return response.data;
  } catch (error) {
    console.error('获取用户设置失败:', error);
    throw error;
  }
}

/**
 * @desc 根据关键词查找视频 - 获得up主主页视频
 * @param params 参数
 * @returns 视频列表
 * @access  Public - 不需要登录
 */
export async function searchVideoByKeywords(params: SearchVideoByKeywordsParams): Promise<ApiResponse<VideoResponse>> {
  try {
    const response = await biliRequest.get<ApiResponse<VideoResponse>>('/series/recArchivesByKeywords',
      { params: { ...params, keywords:'' } });
    if (response.data.code !== 0) {
      throw new Error(response.data.message || '搜索视频失败');
    }
    return response.data;
  } catch (error) {
    console.error('搜索视频失败:', error);
    throw error;
  }
}

/**
 * @desc 获取用户合集、系列
 * @param params 参数
 * @returns 合集、系列列表
 * @access  Public - 不需要登录
 */
export async function getUserSeasonsAndSeries(params: SeasonAndSeriesParams): Promise<ApiResponse<SeasonAndSeriesResponse>> {
  try {
    const response = await biliRequest.get<ApiResponse<SeasonAndSeriesResponse>>('/polymer/web-space/home/seasons_series',
      { params });
    if (response.data.code !== 0) {
      throw new Error(response.data.message || '获取用户合集、系列失败');
    }
    return response.data;
  } catch (error) {
    console.error('获取用户合集、系列失败:', error);
    throw error;
  }
}