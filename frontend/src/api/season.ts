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
   * @param media_id 订阅合集ID
   * @param pn 页码
   * @param ps 获得项数
   */
  export async function getSeasonDetail(season_id: string | number, pn?: number, ps?: number): Promise<MediaItem[]> {
    try {
      const res = await request.get<ApiResponse<SeasonContentResponse>>('/season/season/list', {
        params: { 
          season_id,
          pn,
          ps,
       }
    })
    return res.data.data.medias;
  } catch (error) {
    console.error('获取订阅合集内容失败:', error);
    throw error;
  }
}
  