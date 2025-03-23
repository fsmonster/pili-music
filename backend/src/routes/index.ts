/**
 * 路由索引文件
 * 集中导出所有路由，方便在主应用中引用
 */

// 导出所有路由
import authRoutes from './auth.js';
import favoriteRoutes from './favorite.js'; // 收藏夹路由
import seasonRoutes from './season.js'; // 合集路由
import seriesRoutes from './series.js'; // 系列路由
import sectionRoutes from './section.js'; // 自定义路由
import infoRoutes from './audioInfo.js'; // 音频信息路由
import playRoutes from './play.js'; // 音频代理路由
import userRoutes from './user.js'; // 用户路由

export {
  authRoutes,
  favoriteRoutes,
  seasonRoutes,
  seriesRoutes,
  sectionRoutes,
  infoRoutes,
  playRoutes,
  userRoutes,
};
