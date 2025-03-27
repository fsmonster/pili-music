/**
 * 系列相关API
 */
import { request, biliRequest } from "../utils/request";
import type { 
    ApiResponse, 
    UserSeriesList,
    SeasonAndSeriesParams, SeasonAndSeriesResponse, 
    SeriesArchivesParams, SeriesArchivesResponse, 
    SeriesMetaResponse, SeriesMeta,
    Archive} from "../types";

/**
 * @desc 获取系列的元数据
 * @param series_id 系列ID
 * @returns 系列元数据
 * @access  Public - 不需要登录
 */
export async function getSeriesMeta(
    series_id: number
): Promise<SeriesMeta> {
    try {
        const res = await biliRequest.get<ApiResponse<SeriesMetaResponse>>(
            "/series/series",
            {
                params: { series_id },
            }
        );
        return res.data.data.meta;
    } catch (error) {
        console.error("获取系列元数据失败:", error);
        throw error;
    }
}

/**
 * @desc 获取用户的系列列表
 * @param params 系列参数
 * @returns 系列列表
 * @access  Public - 不需要登录
 */
export async function getSeriesList(
    params: SeasonAndSeriesParams
): Promise<UserSeriesList[]> {
    try {
        const res = await biliRequest.get<ApiResponse<SeasonAndSeriesResponse>>(
            "/series/archives",
            {
                params,
            }
        );
        return res.data.data.items_lists.series_list;
    } catch (error) {
        console.error("获取用户合集和系列列表失败:", error);
        throw error;
    }
}

/**
 * @desc 获取系列的媒体列表
 * @param params 系列参数
 * @returns 系列媒体列表
 * @access  Public - 不需要登录
 */
export async function getSeriesArchives(
    params: SeriesArchivesParams
): Promise<Archive[]> {
    try {
        const res = await biliRequest.get<ApiResponse<SeriesArchivesResponse>>(
            "/series/archives",
            {
                params,
            }
        );
        return res.data.data.archives;
    } catch (error) {
        console.error("获取系列内容失败:", error);
        throw error;
    }
}

/**
 * @desc 获取系列封面
 * @param series_id 系列ID
 * @param mid 用户ID
 * @returns 系列封面图片URL
 * @access  Public - 不需要登录
 */
export async function getSeriesCover(
    series_id: number,
    mid: number
): Promise<string> {
    try {
        const res = await biliRequest.get<ApiResponse<SeriesArchivesResponse>>(
            "/series/archives",
            {
                params: { series_id, mid, pn: 1, ps: 1 },
            }
        );
        return res.data.data.archives[0].pic;
    } catch (error) {
        console.error("获取系列封面失败:", error);
        throw error;
    }
}

/**
 * @desc 获取用户显示的系列ID列表
 * @returns 系列显示设置列表
 * @access  Private - 需要登录
 */
export async function getDisplaySeries(): Promise<number[]> {
    try {
      const res = await request.get<ApiResponse<number[]>>("/series/display");
      return res.data.data;
    } catch (error) {
      console.error("获取显示系列失败:", error);
      throw error;
    }
  }

/**
 * 更新用户显示的系列ID列表
 * @param displayIds 需要显示的系列ID列表
 * @access  Private - 需要登录
 */
export async function updateDisplaySeries(
    displayIds: number[]
): Promise<number[]> {
    try {
      const res = await request.put<ApiResponse<number[]>>("/series/display", {
        displayIds,
      });
      return res.data.data;
    } catch (error) {
      console.error("更新显示系列失败:", error);
      throw error;
    }
  }