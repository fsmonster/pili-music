/**
 * 系列相关API
 */
import request from "../utils/request";
import type { 
    ApiResponse, 
    UserSeriesList,
    SeasonAndSeriesParams, SeasonAndSeriesResponse, 
    SeriesArchivesParams, SeriesArchivesResponse, 
    SeriesMetaParams, SeriesMetaResponse, SeriesMeta,
    Archive} from "../types";

/**
 * 获取用户的系列列表
 */
export async function getSeriesList(
    params: SeasonAndSeriesParams
): Promise<UserSeriesList[]> {
    try {
        const res = await request.get<ApiResponse<SeasonAndSeriesResponse>>(
            "/season/series/list",
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
 * 获取系列的元数据
 */
export async function getSeriesMeta(
    params: SeriesMetaParams
): Promise<SeriesMeta> {
    try {
        const res = await request.get<ApiResponse<SeriesMetaResponse>>(
            "/series/meta",
            {
                params,
            }
        );
        return res.data.data.meta;
    } catch (error) {
        console.error("获取系列元数据失败:", error);
        throw error;
    }
}

/**
 * 获取系列的媒体列表
 */
export async function getSeriesArchives(
    params: SeriesArchivesParams
): Promise<Archive[]> {
    try {
        const res = await request.get<ApiResponse<SeriesArchivesResponse>>(
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
 * 获取用户显示的系列ID列表
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