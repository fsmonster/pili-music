import { defineStore } from "pinia";
import { ref, computed } from "vue";
import * as seasonApi from "../../api/season";
import type { SeasonList, SeasonListResponse } from "../../types";
import { useUserStore } from "../user/user";

/**
 * 订阅合集状态管理
 */
export const useSeasonStore = defineStore(
  "season",
  () => {
    // 用户状态
    const userStore = useUserStore();
    const mid = computed(() => userStore.mid);
    const isLoggedIn = computed(() => userStore.isLoggedIn);

    // 基础状态
    const allSeasons = ref<SeasonList[]>([]);
    const displaySeasonIds = ref<number[]>([]);
    const isLoaded = ref(false);
    const loading = ref(false);

    // 懒加载状态
    const page = ref(1); // 当前页码
    const pageSize = 40; // 每次加载的数量
    const totalCount = ref(0); // 总数
    const totalPages = ref(0); // 总页数
    const hasMore = ref(false);

    // 计算属性：当前显示的订阅合集
    const seasons = computed(() =>
      allSeasons.value.filter((s) => displaySeasonIds.value.includes(s.id))
    );

    // 获取订阅合集显示设置
    const fetchDisplaySeasons = async () => {
      displaySeasonIds.value = await seasonApi.getDisplaySeasons();
    };

    // 更新订阅合集显示设置
    const updateSeasonSettings = async (ids: number[]) => {
      displaySeasonIds.value = ids;
      await seasonApi.updateDisplaySeasons(ids);
    };

    // 增量加载订阅合集内容
    const appendSeasons = async (moreContent: SeasonList[]) => {
      if (allSeasons.value) {
        allSeasons.value = [...allSeasons.value, ...moreContent];
      } else {
        allSeasons.value = moreContent;
      }
      page.value += 1;
    };

    // 获取订阅合集列表
    const fetchSeasons = async () => {
      if (!mid.value) return;
      try {
        loading.value = true;
        isLoaded.value = false;

        if (page.value === 1) {
          const firstPage = await seasonApi.getSeasonList({
            up_mid: mid.value,
            pn: 1,
            ps: pageSize,
            platform: "web",
          });
          totalCount.value = firstPage.count;
          appendSeasons(firstPage.list);
          if (!firstPage.has_more) {
            hasMore.value = false;
            return;
          }
        }

        totalPages.value = Math.ceil(totalCount.value / pageSize);

        // 创建并行请求
        const requests: Promise<SeasonListResponse>[] = [];
        for (let p = 2; p <= totalPages.value; p++) {
          requests.push(seasonApi.getSeasonList({
            up_mid: mid.value,
            pn: p,
            ps: pageSize,
            platform: "web",
          }));
        }

        // 并行请求
        const results = await Promise.all(requests);

        // 追加数据
        results.forEach((result) => appendSeasons(result.list));
        
        // 更新状态
        page.value = totalPages.value;
        hasMore.value = results[results.length - 1]?.has_more ?? false;
      } catch (error) {
        console.error("获取订阅合集列表失败:", error);
        throw error;
      } finally {
        loading.value = false;
        isLoaded.value = true;
      }
    };

    // 刷新订阅合集
    const refreshSeasons = async () => {
      reset();
      await fetchDisplaySeasons();
      await fetchSeasons();
    };

    // 获取订阅合集相关内容（如果未加载）
    const fetchSeasonsIfNeeded = async () => {
      if (isLoggedIn.value && !isLoaded.value) {
        await fetchDisplaySeasons();
        await fetchSeasons();
      }
    };

    // 重置状态
    const reset = () => {
      loading.value = false;
      isLoaded.value = false;
      allSeasons.value = [];
      displaySeasonIds.value = [];
      page.value = 1;
      totalCount.value = 0;
      totalPages.value = 0;
      hasMore.value = false;
    };

    return {
      // 状态
      loading,
      seasons,
      allSeasons,
      displaySeasonIds,
      isLoaded,

      // 方法
      fetchDisplaySeasons,
      updateSeasonSettings,
      fetchSeasons,
      fetchSeasonsIfNeeded,
      refreshSeasons,
      reset,
    };
  },
  {
    persist: true,
  }
);
