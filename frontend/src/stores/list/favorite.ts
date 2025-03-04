import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as favoriteApi from '../../api/favorite';
import type { Favorite, FavoriteInfo } from '../../types';
import { useUserStore } from '../user/user';
import { createBaseListStore } from './baseList';

/**
 * @desc 收藏夹状态管理
 */
export const useFavoriteStore = defineStore('favorite', () => {
  // 基础媒体列表功能
  const baseList = createBaseListStore();
  
  // 收藏夹特有状态
  const allFavorites = ref<Favorite[]>([]); 
  const displayFavoriteIds = ref<number[]>([]);
  const currentFavorite = ref<Favorite | null>(null);
  const currentFavoriteId = ref<number | null>(null); // 当前正在查看的收藏夹ID

  const userStore = useUserStore();
  const uid = computed(() => userStore.uid);

  // 计算属性：当前显示的收藏夹(歌单)列表
  const favorites = computed<Favorite[]>(() =>
    allFavorites.value.filter(f => displayFavoriteIds.value.includes(f.id))
  );

  // 更新收藏夹显示设置 并获取收藏夹基础信息(title、count、cover)
  const updateDisplaySettings = async (ids: number[]) => {
    displayFavoriteIds.value = ids;
    
    // 获取新选中收藏夹的基础信息
    const newIds = ids.filter(id => 
      !allFavorites.value.find(f => f.id === id && f.cover)
    );
    
    if (newIds.length > 0) {
        baseList.loading.value = true;
        
        // 获取收藏夹 - 信息(主要是 cover)
        const updatedFavorites = await Promise.all(
          newIds.map(async (id) => {

            const favorite = allFavorites.value.find(f => f.id === id);
            if (!favorite) return null;
            
            const folderInfo: FavoriteInfo | null = await favoriteApi.getFavoriteInfo(id);
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
        
        baseList.loading.value = false;
    }
  };

  /**
   * @desc 获取收藏夹列表
   */
  const fetchFavorites = async () => {
    if (!uid.value) {
      baseList.error.value = '请先登录';
      return;
    }

    baseList.loading.value = true;
    baseList.error.value = '';

    // 获取收藏夹列表基本信息（不包含封面）
    const favoriteList = await favoriteApi.getFavoriteList(uid.value);

    // 合并原有收藏夹的 cover 信息
    allFavorites.value = favoriteList.map(newFav => {
      const oldFav = allFavorites.value.find(f => f.id === newFav.id);
      return oldFav && oldFav.cover ? { ...newFav, cover: oldFav.cover } : newFav;
    });

    // 只请求 cover 为空的收藏夹信息
    const needUpdateIds = allFavorites.value
      .filter(f => displayFavoriteIds.value.includes(f.id) && !f.cover)
      .map(f => f.id);

    if (needUpdateIds.length > 0) {
      await updateDisplaySettings(needUpdateIds);
    }
    
    baseList.loading.value = false;
  };

  /**
   * @desc 获取收藏夹内容(媒体列表) - 初始加载
   * @param mediaId 收藏夹ID
   */
  const fetchFavoriteContent = async (mediaId: number) => {
    baseList.loading.value = true;
    baseList.error.value = '';
    
    // 重置列表状态
    baseList.reset();
    currentFavoriteId.value = mediaId;
    
    // 获取收藏夹内容（第一页）
    const items = await favoriteApi.getFavoriteContent(mediaId, 0, baseList.pageSize.value);
    
    // 设置当前收藏夹
    currentFavorite.value = allFavorites.value.find(f => f.id === mediaId) || null;
    
    // 更新列表数据
    baseList.setItems(items);
    
    baseList.loading.value = false;
  };
  
  /**
   * @desc 加载更多收藏夹内容 - 懒加载
   */
  const loadMoreFavoriteContent = async () => {
    if (!currentFavoriteId.value || !baseList.hasMore.value || baseList.loading.value) {
      return;
    }
    
    baseList.loading.value = true;
    
    // 获取下一页数据
    const moreItems = await favoriteApi.getFavoriteContent(
      currentFavoriteId.value,
      baseList.currentOffset.value,
      baseList.pageSize.value
    );
    
    // 添加到现有列表
    baseList.appendItems(moreItems);
    
    baseList.loading.value = false;
  };

  // 重置状态
  const reset = () => {
    baseList.reset();
    allFavorites.value = [];
    displayFavoriteIds.value = [];
    currentFavorite.value = null;
    currentFavoriteId.value = null;
  };

  return {
    ...baseList, // 导出基础列表功能
    
    // 收藏夹特有状态和方法
    favorites,
    allFavorites,
    displayFavoriteIds,
    currentFavorite,
    currentFavoriteId,
    updateDisplaySettings,
    fetchFavorites,
    fetchFavoriteContent,
    loadMoreFavoriteContent,
    reset
  };
}, {
  persist: true
});
