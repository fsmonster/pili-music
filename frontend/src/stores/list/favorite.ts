import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { FavoriteList, FavoriteInfo } from '../../types';
import * as favoriteApi from '../../api/favorite';
import { useUserStore } from '../user/user';

/**
 * @desc 收藏夹状态管理
 */
export const useFavoriteStore = defineStore('favorite', () => {
  // 用户状态
  const userStore = useUserStore();
  const mid = computed(() => userStore.mid);
  const isLoggedIn = computed(() => userStore.isLoggedIn);

  // 基础状态
  const allFavorites = ref<FavoriteList[]>([]); 
  const displayFavoriteIds = ref<number[]>([]);
  const isLoaded = ref(false);
  const loading = ref(false);
  const error = ref('');

  // 计算属性：当前显示的收藏夹(歌单)列表
  const favorites = computed<FavoriteList[]>(() =>
    allFavorites.value.filter(f => displayFavoriteIds.value.includes(f.id))
  );

  // 获取收藏夹显示设置
  const fetchDisplayFavorites = async () => {
    displayFavoriteIds.value = await favoriteApi.getDisplayFavorites();
  };

  // 更新收藏夹显示设置 并获取收藏夹基础信息(title、count、cover)
  const updateDisplaySettings = async (ids: number[]) => {
    displayFavoriteIds.value = ids;

    // 更新显示设置
    await favoriteApi.updateDisplayFavorites(ids);
    
    // 获取新选中收藏夹的基础信息
    const newIds = ids.filter(id => 
      !allFavorites.value.find(f => f.id === id && f.cover)
    );
    
    if (newIds.length > 0) {
        loading.value = true;
        
        // 获取收藏夹 - 信息(主要是 cover)
        const updatedFavorites = await Promise.all(
          newIds.map(async (id) => {

            const favorite = allFavorites.value.find(f => f.id === id);
            if (!favorite) return null;
            
            const folderInfo: FavoriteInfo | null = await favoriteApi.getFavoriteInfo({
              media_id: id
            });
            return {
              ...favorite,
              ...folderInfo
            };
          })
        );
        
        // 更新收藏夹信息
        allFavorites.value = allFavorites.value.map(favorite => {
          const updated = updatedFavorites.find(f => f?.id === favorite.id);
          return updated || favorite;
        });      
        
        loading.value = false;
    }
  };

  /**
   * @desc 获取收藏夹列表
   */
  const fetchFavorites = async () => {
    loading.value = true;
    error.value = '';
    isLoaded.value = false;

    try {
      // 获取收藏夹列表基本信息（不包含封面）
      const favoriteList = await favoriteApi.getFavoriteList({
        up_mid: mid.value!
      });

      // 合并原有收藏夹的 cover 信息（如果 allFavorites.value 不为空）
      if (allFavorites.value.length > 0) {
        allFavorites.value = favoriteList.map(newFav => {
          const oldFav = allFavorites.value.find(f => f.id === newFav.id);
          return oldFav && oldFav.cover ? { ...newFav, cover: oldFav.cover } : newFav;
        });
      } else {
        // 首次加载，直接使用 API 返回的数据
        allFavorites.value = favoriteList;
      }

      // 只请求 cover 为空的收藏夹信息
      const needUpdateIds = allFavorites.value
        .filter(f => displayFavoriteIds.value.includes(f.id) && !f.cover)
        .map(f => f.id);

      if (needUpdateIds.length > 0) {
        // 获取收藏夹 - 信息(主要是 cover)
        const updatedFavorites = await Promise.all(
          needUpdateIds.map(async (id) => {
            const favorite = allFavorites.value.find(f => f.id === id);
            if (!favorite) return null;
            
            const folderInfo: FavoriteInfo | null = await favoriteApi.getFavoriteInfo({
              media_id: id
            });
            return {
              ...favorite,
              ...folderInfo
            };
          })
        );
        
        // 更新收藏夹信息
        allFavorites.value = allFavorites.value.map(favorite => {
          const updated = updatedFavorites.find(f => f?.id === favorite.id);
          return updated || favorite;
        });
      }

      loading.value = false;
      isLoaded.value = true;
    } catch (err) {
      loading.value = false;
      error.value = '获取收藏夹列表失败';
    }
  };

  /**
   * @desc 刷新收藏夹列表
   */
  const refreshFavorites = async () => {
    isLoaded.value = false;
    await fetchDisplayFavorites();
    await fetchFavorites();
  };

  /**
   * @desc 获取收藏夹列表（如果未加载）
   */
  const fetchFavoritesIfNeeded = async () => {
    if (isLoggedIn.value && !isLoaded.value && mid.value) {
      await fetchDisplayFavorites();
      await fetchFavorites();
    }
  };

  // 重置状态
  const reset = () => {
    loading.value = false;
    error.value = '';
    isLoaded.value = false;
    displayFavoriteIds.value = [];
    allFavorites.value = [];
  };

  return {
    // 状态
    loading,
    error,
    allFavorites,
    displayFavoriteIds,
    isLoaded,
    
    // 计算属性
    favorites,

    // 方法
    fetchDisplayFavorites,
    updateDisplaySettings,
    fetchFavorites,
    fetchFavoritesIfNeeded,
    refreshFavorites,
    reset
  };
}, {
  persist: true
});
