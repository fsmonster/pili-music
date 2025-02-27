/**
 * 播放列表相关API
 */
import request from '../utils/request';
import type { ApiResponse } from '../types/types';

/**
 * 获取视频信息
 */
export async function getVideoInfo(aid: string) {
  return request.get<ApiResponse>('/api/favorite/video/info', {
    params: { aid }
  });
}

/**
 * 获取音频URL
 */
export async function getAudioUrl(params: {
  aid: string;
  cid: string;
}) {
  return request.get<ApiResponse>('/api/favorite/audio/url', {
    params
  });
}
