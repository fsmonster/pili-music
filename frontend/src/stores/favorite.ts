import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as favoriteApi from '../api/favorite';
import type { Favorite } from '../types/types';
import { useUserStore } from './user';
import { createBaseListStore } from './base/baseList';

/**
 * 收藏夹状态管理
 */
export const useFavoriteStore = defineStore('favorite', () => {
  // 基础列表功能
  const baseList = createBaseListStore();
  
  // 收藏夹特有状态
  const allFavorites = ref<Favorite[]>([]); 
  const displayFavoriteIds = ref<number[]>([]);
  const currentFavorite = ref<Favorite | null>(null);

  const userStore = useUserStore();
  const uid = computed(() => userStore.uid);

  // 计算属性：当前显示的收藏夹
  const favorites = computed(() => 
    allFavorites.value.filter(f => displayFavoriteIds.value.includes(f.id))
  );

  // 更新收藏夹显示设置并获取详细信息
  const updateDisplaySettings = async (ids: number[]) => {
    displayFavoriteIds.value = ids;
    
    // 获取新选中收藏夹的详细信息
    const newIds = ids.filter(id => 
      !allFavorites.value.find(f => f.id === id && f.cover)
    );
    
    if (newIds.length > 0) {
      try {
        baseList.loading.value = true;
        
        // 获取收藏夹详细信息
        const updatedFavorites = await Promise.all(
          newIds.map(async (id) => {
            try {
              const favorite = allFavorites.value.find(f => f.id === id);
              if (!favorite) return null;
              
              const infoRes = await favoriteApi.getFavoriteInfo(id);
              const folderInfo = infoRes.data.data;
              
              return {
                ...favorite,
                ...folderInfo,
                cover: folderInfo.cover || ''
              };
            } catch (err) {
              console.error('获取收藏夹信息失败:', err);
              return null;
            }
          })
        );
        
        // 更新收藏夹信息
        allFavorites.value = allFavorites.value.map(favorite => {
          const updated = updatedFavorites.find(f => f?.id === favorite.id);
          return updated || favorite;
        });
        
      } catch (err) {
        console.error('更新收藏夹信息失败:', err);
      } finally {
        baseList.loading.value = false;
      }
    }
  };

  // 获取收藏夹列表
  const fetchFavorites = async () => {
    if (!uid.value) {
      baseList.error.value = '请先登录';
      return;
    }

    try {
      baseList.loading.value = true;
      baseList.error.value = '';
      
      // 获取收藏夹列表基本信息
      const res = await favoriteApi.getFavoriteList(uid.value);
      allFavorites.value = res.data.data.list || [];
      
      // 如果有已选择的收藏夹，获取它们的详细信息
      if (displayFavoriteIds.value.length > 0) {
        await updateDisplaySettings(displayFavoriteIds.value);
      }
      
    } catch (err: any) {
      baseList.error.value = err.message || '获取收藏夹列表失败';
      console.error('获取收藏夹列表失败:', err);
    } finally {
      baseList.loading.value = false;
    }
  };

  // 获取收藏夹内容
  const fetchFavoriteContent = async (mediaId: string) => {
    try {
      baseList.loading.value = true;
      baseList.error.value = '';
      
      const res = await favoriteApi.getFavoriteContent(mediaId);
      const items = res.data.medias || [];
      
      // 设置当前收藏夹
      currentFavorite.value = allFavorites.value.find(f => f.id.toString() === mediaId) || null;
      
      // 更新列表数据
      baseList.setItems(items);
      
    } catch (err: any) {
      baseList.error.value = err.message || '获取收藏夹内容失败';
      console.error('获取收藏夹内容失败:', err);
    } finally {
      baseList.loading.value = false;
    }
  };

  // 重置状态
  const reset = () => {
    baseList.reset();
    allFavorites.value = [];
    displayFavoriteIds.value = [];
    currentFavorite.value = null;
  };

  return {
    ...baseList, // 导出基础列表功能
    
    // 收藏夹特有状态和方法
    favorites,
    allFavorites,
    displayFavoriteIds,
    currentFavorite,
    updateDisplaySettings,
    fetchFavorites,
    fetchFavoriteContent,
    reset
  };
}, {
  persist: true
});
