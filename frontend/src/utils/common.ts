import type { Archive } from "../types";
import type { MediaItem } from "../types/common";

// 格式化时间
export const formatTime = (seconds: number) => {
  if (!seconds) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// 格式化时长
export const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// 格式化数字
export const formatCount = (count: number) => {
  if (count >= 10000) {
      return (count / 10000).toFixed(1) + '万';
  }
  return count.toString();
};

// 格式化日期
export const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};

/**
 * 根据 URL 提取 ID 和类型
 * 收藏夹、合集靠ftype区分，或者直接匹配合集
 * @param url 收藏夹/合集/系列 URL
 * @returns `{ id: number, type: 'favorite' | 'season' | 'series' }` 或 `null`（解析失败）
 */
export const extractIdAndType = (url: string): { id: number, type: 'favorite' | 'season' | 'series' } => {
  const favMatch = url.match(/fid=(\d+)/);
  const ftypeMatch = url.match(/ftype=(\w+)/);
  const seasonMatch = url.match(/lists\/(\d+)\?type=season/);
  const seriesMatch = url.match(/lists\/(\d+)\?type=series/);

  if (favMatch && ftypeMatch) {
    const id = Number(favMatch[1]);
    const ftype = ftypeMatch[1];

    if (ftype === 'create') {
      return { id, type: 'favorite' };
    } else if (ftype === 'collect') {
      return { id, type: 'season' };
    }
  }

  if (seasonMatch) {
    return { id: Number(seasonMatch[1]), type: 'season' };
  }
  if (seriesMatch) {
    return { id: Number(seriesMatch[1]), type: 'series' };
  }
  
  throw new Error('识别不了URL 😯');
};


/**
 * @param url 空间系列URL
 * @returns { mid: string; series_id: string } | null
 */
export function extractMidAndSeriesId(url: string): { mid: string; series_id: string } | null {
    const match = url.match(/space\.bilibili\.com\/(\d+)\/lists\/(\d+)\?type=series/);
    if (match) {
      return {
        mid: match[1],         // 提取的 mid
        series_id: match[2],   // 提取的 series_id
      };
    }
    return null; // 解析失败返回 null
}

/**
 * 将 Archive 转换为 MediaItem
 */
export function convertArchiveToMediaItem(archive: Archive): MediaItem {
    return {
      bv_id: archive.bvid,
      bvid: archive.bvid,
      cover: archive.pic,
      duration: archive.duration,
      id: archive.aid, // 这里 id 直接用 aid
      pubtime: archive.pubdate,
      title: archive.title,
      enable_vt: archive.enable_vt ? 1 : 0,
      vt_display: archive.vt_display,
      stat: archive.stat,
      // 其他字段可以根据需要填充
    };
}
  