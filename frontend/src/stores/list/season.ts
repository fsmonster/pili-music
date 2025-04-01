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

    // 存储合集封面的映射关系
    const seasonCovers = ref<Record<number, string>>({});

    // 计算属性：当前显示的订阅合集
    const seasons = computed(() => {
      // 过滤出要显示的合集
      const displaySeasons = allSeasons.value.filter((s) => displaySeasonIds.value.includes(s.id));
      
      // 处理默认封面
      return displaySeasons.map(season => {
        // 如果已经获取过封面，使用缓存的封面
        if (seasonCovers.value[season.id]) {
          return { ...season, cover: seasonCovers.value[season.id] };
        }
        
        // 如果是默认封面，尝试获取第一个视频的封面
        if (season.cover && season.cover.includes("viedeo_material_default.png")) {
          // 异步获取封面
          seasonApi.getSeasonCover(season.id)
            .then(newCover => {
              // 确保获取到的封面有效（不为空且不是默认封面）
              if (newCover && !newCover.includes("viedeo_material_default.png")) {
                // 更新封面缓存，这会触发响应式更新
                seasonCovers.value[season.id] = newCover;
              }
            })
            .catch(error => {
              console.error(`获取合集封面失败: ${season.id}`, error);
            });
        }
        
        return season;
      });
    });

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
      displaySeasonIds.value = [];
      allSeasons.value = [];
      page.value = 1;
      totalCount.value = 0;
      totalPages.value = 0;
      hasMore.value = false;
      seasonCovers.value = {};
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
