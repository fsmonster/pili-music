import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { FavoriteSortType } from "../../types";
import type { FavoriteContentResponse, MediaItem } from "../../types";
import * as favoriteApi from "../../api/favorite";

/**
 * @desc 收藏夹内容状态管理
 * 拆分自收藏夹状态，专门处理收藏夹内容相关功能
 * 可被分区和收藏夹列表共同使用
 */
export const useFavoriteContentStore = defineStore(
  "favoriteContent",
  () => {
    // 基础状态
    const favoriteContent = ref<FavoriteContentResponse | null>(null);
    const loading = ref(false);

    // 懒加载状态
    const firstLoad = ref(true); // 记录是否为第一次加载
    const page = ref(1); // 当前页码
    const pageSize = 40; // 每次加载的数量
    const totalCount = ref(0); // 总数
    const totalPages = ref(0); // 总页数
    const hasMore = ref(true);

    // 当前收藏夹ID
    const currentFavoriteId = ref<number | null>(null);

    // 计算属性：当前收藏夹媒体列表
    const medias = computed<MediaItem[]>(
      () => favoriteContent.value?.medias || []
    );

    /**
     * @desc 设置首次加载的收藏夹内容
     * @param newContent
     */
    function setFirstLoadContent(newContent: FavoriteContentResponse) {
      favoriteContent.value = newContent;
      page.value = 1;
      totalCount.value = newContent.info.media_count;
      totalPages.value = Math.ceil(newContent.info.media_count / pageSize);
    }

    /**
     * @desc 添加更多收藏夹内容（懒加载时使用）
     * @param moreContent
     */
    function appendFavoriteContent(moreContent: FavoriteContentResponse) {
      if (favoriteContent.value) {
        favoriteContent.value = {
          ...moreContent,
          medias: [...favoriteContent.value.medias, ...moreContent.medias],
        };
      } else {
        favoriteContent.value = moreContent;
      }
      page.value += 1;
    }

    /**
     * @desc 增量加载收藏夹内容（每次最多 5 页，支持多次调用）
     * @param mediaId 收藏夹ID
     * @param order 排序类型
     * @returns Promise<MediaItem[]>
     */
    const fetchFavoriteContent = async (mediaId: number, order?: FavoriteSortType) => {
      if (currentFavoriteId.value !== mediaId) {
        reset();
      }
      currentFavoriteId.value = mediaId;

      try {
        loading.value = true;

        // 获取第一页（仅在首次加载时）
        if (firstLoad.value) {
          const firstPage = await favoriteApi.getFavoriteContent({
            media_id: mediaId,
            order,
            pn: 1,
            ps: pageSize,
          });
          firstLoad.value = false;

          setFirstLoadContent(firstPage);

          if (!firstPage.has_more) {
            hasMore.value = false;
            return firstPage.medias;
          }
          return firstPage.medias;
        }

        // 获取后续页
        const response = await favoriteApi.getFavoriteContent({
          media_id: mediaId,
          order,
          pn: page.value + 1,
          ps: pageSize,
        });

        appendFavoriteContent(response);

        page.value++;
        hasMore.value = response.has_more;
        return response.medias;
      } catch (err) {
        console.error("加载收藏夹内容失败:", err);
        throw err;
      } finally {
        loading.value = false;
      }
    };

    // 重置状态

    const reset = () => {
      loading.value = false;
      page.value = 1;
      firstLoad.value = true;
      totalCount.value = 0;
      totalPages.value = 0;
      hasMore.value = true;
      favoriteContent.value = null;
      currentFavoriteId.value = null;
    };

    return {
      // 状态
      favoriteContent,
      totalCount,
      loading,
      page,
      currentFavoriteId,
      hasMore,

      // 计算属性
      medias,

      // 方法
      fetchFavoriteContent,
      reset,
    };
  },
  {
    persist: true,
  }
);
