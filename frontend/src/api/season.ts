/**
 * 订阅合集相关API
 */
import request from '../utils/request';
import type { ApiResponse } from '../types/types';

/**
 * 获取订阅合集列表
 */
export async function getSeasonList(params?: {
    pn?: number;  // 页码
    ps?: number;  // 每页项数
    up_mid?: number;  // 用户UID
  }) {
    return request.get<ApiResponse>('/season/collected/list', {
      params
    }).then(res => res.data);
  }
  
  /**
   * @desc 获取当前订阅内容明细列表
   * @param media_id 订阅合集ID
   * @param pn 页码
   * @param ps 获得项数
   */
  export async function getSeasonDetail(season_id: string | number, pn?: number, ps?: number) {
    return request.get<ApiResponse>('/season/season/list', {
      params: { 
        season_id,
        pn,
        ps,
       }
    }).then(res => res.data);
  }
  