import type { FavoriteInfo } from './favorite';
import type { SeasonMeta } from './season';
import type { SeriesMeta } from './series';
import type { CollectionType, MediaUpper } from './common';

/**
 * 资源类型
 */
// export type CollocationType = 'favorite' | 'season' | 'series';

/**
 * 资源id
 */
export interface CollocationId {
  type: CollectionType;
  id: number;
}

/**
 * 资源项
 * up - 暂时不加
 */
export type CollocationItem = 
  | { type: CollectionType.Favorite; favoriteInfo: FavoriteInfo }  
  | { type: CollectionType.Season; seasonInfo: SeasonMeta }  
  | { type: CollectionType.Series; seriesInfo: SeriesMeta }  
  | { type: CollectionType.UP; upperInfo: MediaUpper };

/**
 * 自定义分区基本信息
 */
export interface Section {
  _id: string;
  mid: number;
  name: string;
  description: string;
  collocationIds: CollocationId[];
  collocationList: CollocationItem[];
  collocation_count?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 自定义分区接口参数
 */
export interface SectionParams {
  name?: string;
  description?: string;
}

/**
 * 添加/移除资源到分区的参数
 */
export interface CollocationParams {
  sectionId: string;
  resources: CollocationId[];
}