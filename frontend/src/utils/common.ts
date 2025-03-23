import type { Archive } from "../types/series";
import type { MediaItem } from "../types/common";

/**
 * @param url 收藏夹URL
 * @returns 收藏夹ID
 */
export const extractFavoriteIdFromUrl = (url: string) => {
    const match = url.match(/fid=(\d+)/);
    return match ? Number(match[1]) : null;
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
      // 其他字段可以根据需要填充
    };
}
  