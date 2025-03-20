/**
 * 合集相关API
 */
import request from "../utils/request";
import type { 
  ApiResponse,
  SeasonListParams,
  SeasonListResponse,
  SeasonList,
  SeasonContentParams,
  SeasonContent,
  SeasonContentResponse
} from "../types";

/**
 * 获取订阅合集列表
 */
export async function getSeasonList(
  params: SeasonListParams
): Promise<SeasonList[]> {
  try {
    const res = await request.get<ApiResponse<SeasonListResponse>>(
      "/season/collected/list",
      {
        params,
      }
    );
    return res.data.data.list;
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
