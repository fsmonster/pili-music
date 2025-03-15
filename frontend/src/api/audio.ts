/**
 * 播放列表相关API
 */
import request from '../utils/request';
import type { ApiResponse, CidInfo, DashAudioResponse } from '../types';
import { AudioQuality } from '../types';

/**
 * @desc 获取视频cid
 * @param aid 视频avid
 * @returns 视频cid
 */
export async function getCid(aid: number): Promise<number> {
  try {
    const res = await request.get<ApiResponse<CidInfo[]>>('/audioInfo/player/pagelist', {
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
 * 默认返回192K音质 (30280)的备用URL
 * 
 * TODO: 实现用户自定义音质选择功能
 * - 添加音质选择UI组件
 * - 保存用户音质偏好设置
 * - 根据用户偏好自动选择音质
 */
export async function getAudioUrl(params: {
  avid: number;
  cid: number;
}): Promise<string> {
  try {
    const res = await request.get<DashAudioResponse>('/audioInfo/audio/url', {
      params
    });
    
    if (res.data.code !== 0) {
      throw new Error(res.data.message || '获取音频URL失败');
    }

    // 获取所有音频流
    const audioStreams = res.data.data;
    
    // 默认选择192K音质 (30280)
    const defaultQuality = AudioQuality.HIGH; 
    
    // 查找默认音质的音频流
    let targetStream = audioStreams.find(stream => stream.id === defaultQuality);
    
    // 如果没有找到默认音质，则使用第一个可用的音频流
    if (!targetStream && audioStreams.length > 0) {
      targetStream = audioStreams[0];
    }
    
    // 如果找不到任何音频流，抛出错误
    if (!targetStream) {
      throw new Error('没有可用的音频流');
    }
    
    // 优先使用备用URL，如果没有则使用主URL
    const backupUrls = targetStream.backupUrl || targetStream.backup_url;
    if (backupUrls && backupUrls.length > 0) {
      return backupUrls[0];
    }
    
    return targetStream.baseUrl || targetStream.base_url;
  } catch (error) {
    console.error('获取音频URL失败:', error);
    throw error;
  }
}
