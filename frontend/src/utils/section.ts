import type { CollocationItem } from "@/types/section";

// 获得对应ID
export const getCollocationId = (collocation: CollocationItem) => {
  if (collocation.type === "favorite") return collocation.favoriteInfo.id;
  if (collocation.type === "season") return collocation.seasonInfo.season_id;
  if (collocation.type === "series") return collocation.seriesInfo.series_id;
  return -1; // 兜底，理论上不会触发
};

// 获得对应封面
export const getCollocationCover = (collocation: CollocationItem) => {
  if (collocation.type === "favorite") return collocation.favoriteInfo.cover;
  if (collocation.type === "season") return collocation.seasonInfo.cover;
  if (collocation.type === "series") return collocation.seriesInfo.cover;
  return ""; // 兜底，理论上不会触发
};

// 获得对应名称
export const getCollocationName = (collocation: CollocationItem) => {
  if (collocation.type === "favorite") return collocation.favoriteInfo.title;
  if (collocation.type === "season") return collocation.seasonInfo.name;
  if (collocation.type === "series") return collocation.seriesInfo.name;
  return ""; // 兜底，理论上不会触发
};

// 获得对应数量
export const getCollocationCount = (collocation: CollocationItem) => {
  if (collocation.type === "favorite")
    return collocation.favoriteInfo.media_count;
  if (collocation.type === "season") return collocation.seasonInfo.total;
  if (collocation.type === "series") return collocation.seriesInfo.total;
  return 0; // 兜底，理论上不会触发
};
