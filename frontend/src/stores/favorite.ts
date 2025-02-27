import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as favoriteApi from '../api/favorite';
import type { Favorite, FavoriteItem, Season } from '../types/types';
import { useUserStore } from './user';
import { processBiliImageUrl } from '../utils/processBiliImageUrl';

export const useFavoriteStore = defineStore('favorite', () => {
  // 状态
  const allFavorites = ref<Favorite[]>([]); // 所有收藏夹
  const displayFavoriteIds = ref<number[]>([]); // 要显示的收藏夹ID
  const allSeasons = ref<Season[]>([]); // 所有订阅合集
  const displaySeasonIds = ref<number[]>([]); // 要显示的订阅合集ID
  const currentItems = ref<FavoriteItem[]>([]);
  const currentFavorite = ref<Favorite | null>(null);
  const loading = ref(false);
  const error = ref('');

  const userStore = useUserStore();
  const uid = computed(() => userStore.uid);

  // 计算属性：当前显示的收藏夹
  const favorites = computed(() => 
    allFavorites.value.filter(f => displayFavoriteIds.value.includes(f.id))
  );

  // 计算属性：当前显示的订阅合集
  const seasons = computed(() => 
    allSeasons.value.filter(s => displaySeasonIds.value.includes(s.id))
  );

  // 更新收藏夹显示设置
  const updateDisplaySettings = (ids: number[]) => {
    displayFavoriteIds.value = ids;
  };

  // 更新订阅合集显示设置
  const updateSeasonSettings = (ids: number[]) => {
    displaySeasonIds.value = ids;
  };

  // 获取收藏夹列表
  const fetchFavorites = async () => {
    if (!uid.value) {
      error.value = '请先登录';
      return;
    }

    try {
      loading.value = true;
      error.value = '';
      
      // 1. 获取收藏夹列表
      const res = await favoriteApi.getFavoriteList(uid.value);
      allFavorites.value = res.data.data.list || [];
      
      // 2. 只获取显示的收藏夹的封面
      const favoritesToFetch = allFavorites.value.filter(f => 
        displayFavoriteIds.value.includes(f.id)
      );
      
      // 3. 获取每个显示的收藏夹的第一个视频作为封面
      const updatedFavorites = await Promise.all(
        favoritesToFetch.map(async (favorite) => {
          try {
            const contentRes = await favoriteApi.getFavoriteContent(favorite.id, {
              ps: 1,
              pn: 1
            });
            const firstVideo = contentRes.data.data.medias?.[0];
            return {
              ...favorite,
              cover: processBiliImageUrl(firstVideo?.cover || '')
            };
          } catch (err) {
            console.error('获取收藏夹封面失败:', err);
            return favorite;
          }
        })
      );
      
      // 4. 更新显示的收藏夹的封面
      allFavorites.value = allFavorites.value.map(favorite => {
        const updated = updatedFavorites.find(f => f.id === favorite.id);
        return updated || favorite;
      });
      
    } catch (err: any) {
      error.value = err.message || '获取收藏夹列表失败';
      console.error('获取收藏夹列表失败:', err);
    } finally {
      loading.value = false;
    }
  };

  // 获取订阅合集列表
  const fetchSeasons = async () => {
    try {
      loading.value = true;
      error.value = '';
      const res = await favoriteApi.getSeasonList({
        up_mid: uid.value ?? undefined,
        pn: 1,
        ps: 40
      });
      console.log(res.data.data?.list);
      
      allSeasons.value = res.data.data.list || [];
      // 不再默认显示所有合集，保持 displaySeasonIds 为空
    } catch (err: any) {
      error.value = err.message || '获取订阅合集列表失败';
      console.error('获取订阅合集列表失败:', err);
    } finally {
      loading.value = false;
    }
  };

  // 获取收藏夹内容
  const fetchFavoriteContent = async (mediaId: string) => {
    try {
      loading.value = true;
      error.value = '';
      const res = await favoriteApi.getFavoriteContent(mediaId);
      currentItems.value = res.data.data.medias || [];
      currentFavorite.value = allFavorites.value.find(f => f.id.toString() === mediaId) || null;
    } catch (err: any) {
      error.value = err.message || '获取收藏夹内容失败';
      console.error('获取收藏夹内容失败:', err);
      currentItems.value = [];
    } finally {
      loading.value = false;
    }
  };

  // 重置状态
  const reset = () => {
    allFavorites.value = [];
    displayFavoriteIds.value = [];
    allSeasons.value = [];
    displaySeasonIds.value = [];
    currentItems.value = [];
    currentFavorite.value = null;
    loading.value = false;
    error.value = '';
  };

  return {
    favorites,
    allFavorites,
    displayFavoriteIds,
    seasons,
    allSeasons,
    displaySeasonIds,
    currentItems,
    currentFavorite,
    loading,
    error,
    fetchFavorites,
    fetchSeasons,
    fetchFavoriteContent,
    updateDisplaySettings,
    updateSeasonSettings,
    reset
  };
}, {
  persist: true
});
