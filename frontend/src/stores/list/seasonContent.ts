import { defineStore } from "pinia";
import { ref, computed } from "vue";
import * as seasonApi from "../../api/season";
import type { MediaItem, SeasonContent, Info } from "../../types";

/**
 * 订阅合集内容状态管理
 */
export const useSeasonContentStore = defineStore("seasonContent", () => {
  // 基础状态
  const loading = ref(false);

  // 存储完整的合集内容数据
  const seasonContents = ref<SeasonContent | null>(null);

  // 计算属性：当前显示的订阅合集内容
  const medias = computed(
    (): MediaItem[] => seasonContents.value?.medias || []
  );

  // 计算属性：当前显示的订阅合集信息
  const info = computed((): Info | null => seasonContents.value?.info || null);

  // 获取订阅合集内容 - 一次性获取所有数据并全部显示
  const fetchAllSeasonContent = async (season_id: number) => {
    loading.value = true;

    try {
      // 获取所有数据
      const seasonContent: SeasonContent = await seasonApi.getSeasonDetail({
        season_id,
      });

      // 存储完整数据并直接全部显示
      seasonContents.value = seasonContent;
    } catch (error) {
      console.error("获取合集内容失败:", error);
    } finally {
      loading.value = false;
    }
  };

  // 重置状态
  const reset = () => {
    loading.value = false;
    seasonContents.value = null;
  };

  return {
    // 状态
    loading,
    seasonContents,
    medias,
    info,
    // 方法
    fetchAllSeasonContent,
    reset,
  };
});
