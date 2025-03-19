import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { FavoriteContentResponse, MediaItem } from '../../types';
import * as favoriteApi from '../../api/favorite';

/**
 * @desc 收藏夹内容状态管理
 * 拆分自收藏夹状态，专门处理收藏夹内容相关功能
 * 可被分区和收藏夹列表共同使用
 */
export const useFavoriteContentStore = defineStore('favoriteContent', () => {
  // 基础状态
  const favoriteContent = ref<FavoriteContentResponse | null>(null);
  const loading = ref(false);
  const error = ref('');
  
  // 懒加载状态
  const pageSize = ref(20); // 每次加载的数量
  const page = ref(1); // 当前页码
  
  // 当前收藏夹ID
  const currentFavoriteId = ref<number | null>(null);

  // 计算属性：当前收藏夹媒体列表
  const medias = computed<MediaItem[]>(() =>
    favoriteContent.value?.medias || []
  );

  // 计算属性：是否还有更多数据
  const hasMore = computed<boolean>(() => 
    favoriteContent.value?.has_more || false
  );

  /**
   * @desc 设置收藏夹内容
   * @param newContent 
   */
  function setFavoriteContent(newContent: FavoriteContentResponse) {
    favoriteContent.value = newContent;
    page.value = 1;
  }
  
  /**
   * @desc 添加更多收藏夹内容（懒加载时使用）
   * @param moreContent 
   */
  function appendFavoriteContent(moreContent: FavoriteContentResponse) {
    if (favoriteContent.value) {
      favoriteContent.value = {
        ...moreContent,
        medias: [...favoriteContent.value.medias, ...moreContent.medias]
      };
    } else {
      favoriteContent.value = moreContent;
    }
    page.value += 1;
  }


  /**
   * @desc 获取收藏夹内容(媒体列表) - 初始加载
   * @param mediaId 收藏夹ID
   */
  const fetchFavoriteContent = async (mediaId: number) => {
    loading.value = true;
    error.value = '';
    currentFavoriteId.value = mediaId;
    
    try {
      // 获取收藏夹内容（第一页）
      const content = await favoriteApi.getFavoriteContent({
        media_id: mediaId,
        pn: 1,
        ps: pageSize.value
      });
      
      // 设置收藏夹内容
      setFavoriteContent(content);
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取收藏夹内容失败';
      console.error('获取收藏夹内容失败:', err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * @desc 加载更多收藏夹内容 - 懒加载
   */
  const loadMoreFavoriteContent = async () => {
    if (!hasMore.value || loading.value || !currentFavoriteId.value) return;
    
    loading.value = true;
    
    try {
      // 获取下一页数据
      const moreContent = await favoriteApi.getFavoriteContent({
        media_id: currentFavoriteId.value,
        pn: page.value + 1,
        ps: pageSize.value
      });
      
      // 添加到列表
      appendFavoriteContent(moreContent);
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载更多收藏夹内容失败';
      console.error('加载更多收藏夹内容失败:', err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * @desc 获取更多收藏夹内容 - 用于分页加载
   * @param favoriteId 收藏夹ID
   */
  const fetchMoreFavoriteContent = async (favoriteId: number) => {
    if (loading.value) return;
    
    // 如果是不同的收藏夹，重新加载
    if (currentFavoriteId.value !== favoriteId) {
      return fetchFavoriteContent(favoriteId);
    }
    
    // 否则加载更多
    return loadMoreFavoriteContent();
  };

  // 重置状态
  const reset = () => {
    favoriteContent.value = null;
    loading.value = false;
    error.value = '';
    page.value = 1;
    currentFavoriteId.value = null;
  };

  return {
    // 状态
    favoriteContent,
    loading,
    error,
    pageSize,
    page,
    currentFavoriteId,
    
    // 计算属性
    medias,
    hasMore,
    
    // 方法
    setFavoriteContent,
    appendFavoriteContent,
    fetchFavoriteContent,
    loadMoreFavoriteContent,
    fetchMoreFavoriteContent,
    reset
  };
}, {
  persist: true
});
