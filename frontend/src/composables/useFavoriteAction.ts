import { getFavoriteList, updateFavoriteContent } from "../api/favorite";
import type { FavoriteActionParams } from "../types";
import { useUserStore } from "@/stores";

/**
 * @desc 收藏夹操作
 */
export const useFavoriteAction = () => {
  const userStore = useUserStore();

  /**
   * 获取视频收藏情况
   * @param rid 视频稿件avid
   * @returns 收藏夹列表
   */
  const checkFavorites = async (rid: number) => {
    if (!userStore?.mid) return;
    return getFavoriteList({
      up_mid: userStore.mid,
      rid,
    });
  };

  /**
   * 更新收藏夹内容
   * @param params 收藏夹更新参数
   * @returns 更新后的收藏夹内容
   */
  const updateFavorites = async (params: FavoriteActionParams) => {
    if (!userStore?.mid) return;
    updateFavoriteContent(params);
  };

  return {
    checkFavorites,
    updateFavorites,
  };
};
