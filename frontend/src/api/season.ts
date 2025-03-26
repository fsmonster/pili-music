/**
 * 合集相关API
 */
import request from "../utils/request";
import type { 
  ApiResponse,
  UserSeasonList,
  SeasonListParams,
  SeasonListResponse,
  // SeasonList,
  SeasonContentParams,
  SeasonContent,
  SeasonContentResponse,
  SeasonAndSeriesParams,
  SeasonAndSeriesResponse,
  // SeasonMetaParams,
  SeasonMeta,
  SeasonArchivesParams,
  SeasonArchivesResponse,
  Archive,
} from "../types";

/**
 * 获取合集的元数据 - page_num: 1, page_size: 1
 * @returns 合集元数据
 */
export async function getSeasonMeta(
  season_id: number
): Promise<SeasonMeta> {
  const params = { season_id, page_num: 1, page_size: 1 };
  try {
      const res = await request.get<ApiResponse<SeasonArchivesResponse>>(
          "/season/meta",
          {
              params,
          }
      );
      return res.data.data.meta;
  } catch (error) {
      console.error("获取合集元数据失败:", error);
      throw error;
  }
}

/**
 * 获取合集的媒体列表
 * 暂时不考虑实现分区里添加合集
 */
export async function getSeasonArchives(
  params: SeasonArchivesParams
): Promise<Archive[]> {
  try {
      const res = await request.get<ApiResponse<SeasonArchivesResponse>>(
          "/season/archives",
          {
              params,
          }
      );
      return res.data.data.archives;
  } catch (error) {
      console.error("获取合集媒体列表失败:", error);
      throw error;
  }
}

/**
 * 获取用户的合集列表
 */
export async function getUserSeasonList(
  params: SeasonAndSeriesParams
): Promise<UserSeasonList[]> {
  try {
      const res = await request.get<ApiResponse<SeasonAndSeriesResponse>>(
          "/season/series/list",
          {
              params,
          }
      );
      return res.data.data.items_lists.seasons_list;
  } catch (error) {
      console.error("获取用户合集和系列列表失败:", error);
      throw error;
  }
}

/**
 * 获取订阅合集列表
 */
export async function getSeasonList(
  params: SeasonListParams
): Promise<SeasonListResponse> {
  try {
    const res = await request.get<ApiResponse<SeasonListResponse>>(
      "/season/collected/list",
      {
        params,
      }
    );
    return res.data.data;
  } catch (error) {
    console.error("获取订阅合集列表失败:", error);
    throw error;
  }
}


/**
 * @desc 获取当前订阅 - 内容明细列表
 * @param params 合集ID
 * @returns 返回合集中的所有媒体项
 */
export async function getSeasonDetail(
  params: SeasonContentParams
): Promise<SeasonContent> {
  try {
    // 注意：虽然我们传递了pn和ps参数，但B站API会返回所有内容
    // 前端将负责处理分页逻辑
    const res = await request.get<ApiResponse<SeasonContentResponse>>(
      "/season/season/list",
      {
        params,
      }
    );
    return res.data.data;
  } catch (error) {
    console.error("获取订阅合集内容失败:", error);
    throw error;
  }
}

/**
 * 获取用户显示的合集ID列表
 * @returns 合集ID列表
 * @access  Private - 需要登录
 */
export async function getDisplaySeasons(): Promise<number[]> {
  try {
    const res = await request.get<ApiResponse<number[]>>("/season/display");
    return res.data.data;
  } catch (error) {
    console.error("获取显示合集失败:", error);
    throw error;
  }
}

/**
 * 更新用户显示的合集ID列表
 * @param displayIds 需要显示的合集ID列表
 * @returns 更新后的合集ID列表
 * @access  Private - 需要登录
 */
export async function updateDisplaySeasons(
  displayIds: number[]
): Promise<number[]> {
  try {
    const res = await request.put<ApiResponse<number[]>>("/season/display", {
      displayIds,
    });
    return res.data.data;
  } catch (error) {
    console.error("更新显示合集失败:", error);
    throw error;
  }
}
