/**
 * 播放列表相关API
 */
import request from '../utils/request';
import type { ApiResponse, VideoInfo } from '../types';

/**
 * @desc 获取视频信息
 * @param aid 视频avid
 * @returns 视频cid
 */
export async function getVideoInfo(aid: number): Promise<number> {
  try {
    const res = await request.get<ApiResponse<VideoInfo[]>>('/info/player/pagelist', {
      params: { aid }
    });
    if(res.data.code !== 0) {
      throw new Error(res.data.message || '获取视频信息失败');
    }
    return res.data.data[0].cid;
  } catch (error) {
    console.error('获取视频信息失败:', error);
    throw error;
  }
}

/**
 * 获取音频URL
 */
export async function getAudioUrl(params: {
  avid: number;
  cid: number;
}) {
  return request.get('/info/audio/url', {
    params
  }).then(res =>{   
    return res.data.data[1].backupUrl[0];
  });
}
