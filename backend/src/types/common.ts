
/**
 * @desc UP主信息
 */
export interface Upper {
  mid: number;
  name: string;
  cover: string;
}

/**
 * @desc 媒体项
 */
export interface MediaItem {
  avid: number;
  bvid: string;
  cid: number;
  title: string;
  cover: string;
  duration: number;
  upper: Upper;
  page: number;
  intro?: string;
}