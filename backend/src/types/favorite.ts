export interface FavoriteActionParams {
    /**
     * 添加的收藏夹 ID
     * add_media_ids、del_media_ids 二选一
     */
    add_media_ids?: number;
    /**
     * 删除的收藏夹 ID
     */
    del_media_ids?: number;
    /**
     * CSRF Token（请替换）
     */
    csrf: number;
    /**
     * 平台标识
     */
    platform?: string;
    /**
     * 目标内容id，视频稿件：视频稿件avid
     */
    rid: number;
    /**
     * 目标内容属性
     * 默认为全部
     * 0：全部
     * 2：视频稿件
     */
    type: number;
    [property: string]: any;
  }