/**
 * 播放列表相关API
 */
import request from '../utils/request';
import type { ApiResponse, AudioParams, CidInfo, DashAudioResponse } from '../types';
import { AudioQuality } from '../types';

/**
 * @desc 获取视频cid
 * @param params 视频参数，包含aid或bvid
 * @param fullList 是否返回完整分P列表，默认false只返回第一P的cid
 * @returns 如果fullList为true，返回完整的分P列表；否则返回第一P的cid
 */
export async function getCid(params: AudioParams, fullList: boolean = false): Promise<number | CidInfo[]> {
  try {
    const res = await request.get<ApiResponse<CidInfo[]>>('/audioInfo/player/pagelist', {
      params
    });
    if(res.data.code !== 0) {
      throw new Error(res.data.message || '获取视频信息失败');
    }
    
    // 如果请求完整列表，返回所有分P信息
    if (fullList) {
      return res.data.data;
    }
    
    // 否则只返回第一P的cid
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
}): Promise<string | null> {
  try {
    const res = await request.get<DashAudioResponse | null>('/audioInfo/audio/url', {
      params
    });

    // 判断是否为充电视频
    if (res.data?.code === 403) {
      return null;
    }

    if (res.data?.code !== 0) {
      throw new Error(res.data?.message || '获取音频URL失败');
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
    
    /**
     * 优先使用备用URL
     * 主URL相关逻辑之后在实现
     * 相关参考：
     *   - [解决B站PCDN卡顿问题 - 哔哩哔哩](https://www.bilibili.com/opus/973262060589678611)
     *   - [B站卡顿优化-PC端禁用PCDN – 栋dong的个人站点](https://itdong.me/bilibili_pcdn/)
     */
    const backupUrls = targetStream.backupUrl || targetStream.backup_url;
    if (backupUrls && backupUrls.length > 0) {
      // 先匹配 UPOS CDN
      const uposUrl = backupUrls.find(url => url.includes("upos-"));    
      return uposUrl || backupUrls[0]; // 找不到就用第一个 URL
    }
    
    return targetStream.baseUrl || targetStream.base_url;
  } catch (error) {
    console.error('获取音频URL失败:', error);
    throw error;
  }
}
