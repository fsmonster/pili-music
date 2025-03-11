/**
 * 合集相关API
 */
import request from '../utils/request';
import type { ApiResponse, SeasonListResponse, SeasonContentResponse, Season, MediaItem } from '../types';

/**
 * 获取订阅合集列表
 */
export async function getSeasonList(params: {
    up_mid: number;  // 用户UID
    pn?: number;  // 页码
    ps?: number;  // 每页项数
  }):Promise<Season[]> {
    try {
      const res = await request.get<ApiResponse<SeasonListResponse>>('/season/collected/list', {
        params
      });
      return res.data.data.list;
    } catch (error) {
      console.error('获取订阅合集列表失败:', error);
      throw error;
    }
  }
  
  /**
   * @desc 获取当前订阅 - 内容明细列表
   * @param season_id 订阅合集ID
   * @returns 返回合集中的所有媒体项
   */
  export async function getSeasonDetail(season_id: number): Promise<MediaItem[]> {
    try {
      // 注意：虽然我们传递了pn和ps参数，但B站API会返回所有内容
      // 前端将负责处理分页逻辑
      const res = await request.get<ApiResponse<SeasonContentResponse>>('/season/season/list', {
        params: { 
          season_id
       }
    })
    return res.data.data.medias;
  } catch (error) {
    console.error('获取订阅合集内容失败:', error);
    throw error;
  }
}