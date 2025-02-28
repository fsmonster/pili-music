/**
 * 播放列表相关API
 */
import request from '../utils/request';
import type { ApiResponse } from '../types/types';

/**
 * 获取视频信息
 */
export async function getVideoInfo(aid: string) {
  return request.get<ApiResponse>('/info/video/info', {
    params: { aid }
  });
}

/**
 * 获取音频URL
 */
export async function getAudioUrl(params: {
  avid: string;
  cid: string;
}) {
  return request.get('/info/audio/url', {
    params
  }).then(res => res.data);
}
