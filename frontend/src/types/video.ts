export type AudioParams =
  | { aid: number; bvid?: never }
  | { bvid: string; aid?: never }
  | { aid: number; bvid: string }; // 也允许同时传 aid 和 bvid

/**
 * @desc 视频信息 - cid信息
 */
export interface PageInfo {
  cid: number;
  /**
   * 当前分P分辨率
   */
  dimension?: Dimension;
  /**
   * 当前分P持续时间
   */
  duration: number;
  first_frame?: string;
  /**
   * 视频来源，vupload：普通上传（B站）
   * hunan：芒果TV
   * qq：腾讯
   */
  from?: string;
  page: number;
  /**
   * 当前分P标题
   */
  part: string;
  /**
   * 站外视频vid
   */
  vid?: string;
  /**
   * 站外视频跳转url
   */
  weblink?: string;
  [property: string]: any;
}

/**
 * 当前分P分辨率
 */
export interface Dimension {
  height: number;
  rotate: number;
  width: number;
  [property: string]: any;
}
