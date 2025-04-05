import type { Archive } from "../types";
import type { MediaItem } from "../types";

// 格式化时间 - 00:00
export const formatTime = (seconds: number) => {
  if (!seconds) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// 格式化时长 - 00:00
export const formatDuration = (duration: number | string): string => {
  if(typeof duration === 'number'){
    const minutes = Math.floor(duration / 60);
    const remainingSeconds = duration % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  else if(typeof duration === 'string'){
    const [minutes, seconds] = duration.split(':').map(Number);
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
  return '00:00';
};

// 格式化数字 - 10000+ 万
export const formatCount = (count: number): string => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万';
  }
  return count.toString();
};

/**
 * 格式化日期
 * 2025-04-03
 */
export const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};

/**
 * 格式化日期
 * 2025/04/03
 */
export const formatDate2 = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// 格式化发布日期 - 1分钟前、1小时前、1天前、2025-04-03
export const formatDate3 = (timestamp: number): string => {
  if (!timestamp) return '未知时间';
  
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // 小于1分钟
  if (diff < 60) {
    return '刚刚';
  }
  // 小于1小时
  else if (diff < 3600) {
    return Math.floor(diff / 60) + '分钟前';
  }
  // 小于1天
  else if (diff < 86400) {
    return Math.floor(diff / 3600) + '小时前';
  }
  // 小于30天
  else if (diff < 2592000) {
    return Math.floor(diff / 86400) + '天前';
  }
  // 大于30天，显示具体日期
  else {
    return formatDate(timestamp);
  }
}

// 去除 HTML 标签
export const removeHtmlTags = (str: string): string => {
  return str.replace(/<[^>]+>/g, '');
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

/**
 * 将 FavoriteMediaItem 转换为 MediaItem
 */
// export function convertFavoriteToMedia(item: FavoriteMediaItem): MediaItem {
//   return {
//     aid: item.id,
//     bvid: item.bvid || item.bv_id,
//     cid: item.ugc?.first_cid,
//     title: item.title,
//     cover: item.cover,
//     duration: item.duration,
//     pubtime: item.pubtime,
//     isMultiplePage: item.page > 1,
//     page: item.page,
//     upper: {
//       mid: item.upper?.mid ?? 0,
//       name: item.upper?.name ?? '',
//       face: item.upper?.face ?? '',
//     },
//   };
// }
