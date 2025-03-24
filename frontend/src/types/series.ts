import type { UserSeasonList, Archive } from './index'

/**
 * 请求参数
 */
export interface SeasonAndSeriesParams {
    /**
     * 目标用户mid
     */
    mid: number;
    /**
     * 页码
     */
    page_num: number;
    /**
     * 每页数量
     */
    page_size: number;
    [property: string]: any;
}

/**
 * 响应数据
 */
export interface SeasonAndSeriesResponse {
    items_lists: ItemsLists;
    [property: string]: any;
}

export interface ItemsLists {
    page: Page;
    /**
     * 归类为“合集”的视频列表
     */
    seasons_list: UserSeasonList[];
    /**
     * 归类为“系列”的视频列表
     */
    series_list: UserSeriesList[];
    [property: string]: any;
}

export interface Page {
    /**
     * 当前页码
     */
    page_num: number;
    /**
     * 每页包含的合集或系列数量
     */
    page_size: number;
    /**
     * 合集或系列的总数
     */
    total: number;
    [property: string]: any;
}

export interface UserSeriesList {
    /**
     * 该系列下的视频列表
     */
    archives: Archive[];
    /**
     * 该系列的元数据
     */
    meta: SeriesMeta;
    /**
     * 该系列中最近更新的视频 AV 号
     */
    recent_aids: number[];
    [property: string]: any;
}

/**
 * 该系列的元数据
 */
export interface SeriesMeta {
    /**
     * 该系列所属分类
     */
    category: number;
    /**
     * 该系列的封面 URL
     */
    cover?: string;
    /**
     * 该系列的创建者（用户名）
     */
    creator: string;
    /**
     * 该系列的创建时间（时间戳）
     */
    ctime: number;
    /**
     * 该系列的描述
     */
    description: string;
    /**
     * 该系列的关键词
     */
    keywords: string[];
    /**
     * 该系列最后更新时间（时间戳）
     */
    last_update_ts: number;
    /**
     * 该系列创建者的用户 ID
     */
    mid: number;
    /**
     * 该系列的修改时间（时间戳）
     */
    mtime: number;
    /**
     * 该系列的名称
     */
    name: string;
    /**
     * 原始关键词字符串
     */
    raw_keywords: string;
    /**
     * 该系列的 ID
     */
    series_id: number;
    /**
     * 该系列的状态
     */
    state: number;
    /**
     * 该系列包含的视频总数
     */
    total: number;
    [property: string]: any;
}

// export interface SeriesMetaParams {
//     /**
//      * 系列ID
//      */
//     series_id: number;
//     [property: string]: any;
// }

export interface SeriesMetaResponse {
    /**
     * 系列的元数据
     */
    meta: SeriesMeta;
    /**
     * 该系列中最近更新的视频 AV 号列表
     */
    recent_aids: number[];
    [property: string]: any;
}

/**
 * 该系列的视频列表请求参数
 */
export interface SeriesArchivesParams {
    /**
     * 用于 playback_position 播放进度
     */
    current_mid?: number;
    /**
     * :目标用户mid
     */
    mid: number;
    /**
     * 默认为 true
     */
    only_normal?: boolean;
    /**
     * 页码
     */
    pn?: number;
    /**
     * 每页数量
     */
    ps?: number;
    /**
     * 合集ID
     */
    series_id: number;
    /**
     * desc: 默认排序
     * asc: 升序排序
     */
    sort?: string;
    [property: string]: any;
}

/**
 * 响应数据
 */
export interface SeriesArchivesResponse {
    aids: number[];
    archives: Archive[];
    page: Page;
    [property: string]: any;
}

