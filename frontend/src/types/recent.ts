export enum CollectionType {
  Favorite = 'favorite',
  Season = 'season',
  Series = 'series',
  UP = 'up'
}

export interface recentlyCollections {
  type: CollectionType;
  id: number;
  name: string;
  cover: string;
}