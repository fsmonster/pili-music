/**
 * 最近播放记录状态管理
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { RecentPlay, MediaItem } from '../../types';
import * as recentApi from '../../api/recent';
import { useUserStore } from '../../stores';

export const useRecentPlayStore = defineStore('recentPlay', () => {
  const userStore = useUserStore();
  // 状态
  const recentPlays = ref<RecentPlay[]>([]);
  const loading = ref(false);
  const isLoaded = ref(false);
  const error = ref<string | null>(null);

  // 获取最近播放记录
  async function fetchRecentPlays(limit: number = 20) {
    loading.value = true;
    isLoaded.value = false;
    error.value = null;
    
    try {
      const data = await recentApi.getRecentPlays(limit);
      recentPlays.value = data;
      isLoaded.value = true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取最近播放记录失败';
      console.error('获取最近播放记录失败:', err);
    } finally {
      loading.value = false;
    }
  }

  // 获取最近播放记录
  const fetchRecentIfNeeded = async () => {
    if (userStore.isLoggedIn && !isLoaded.value) {
      await fetchRecentPlays();
    }
  };

  // 添加最近播放记录
  async function addRecentPlay(mediaItem: MediaItem) {
    loading.value = true;
    error.value = null;
    
    try {
      const data = await recentApi.addRecentPlay(mediaItem);
      
      // 更新本地缓存
      const index = recentPlays.value.findIndex(
        item => item.mediaItem.id === mediaItem.id
      );
      
      if (index !== -1) {
        // 已存在，更新到列表开头
        recentPlays.value.splice(index, 1);
        recentPlays.value.unshift(data);
      } else {
        // 不存在，添加到列表开头
        recentPlays.value.unshift(data);
      }
      
      return data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '添加最近播放记录失败';
      console.error('添加最近播放记录失败:', err);
      // 即使失败也不抛出异常，避免影响正常播放
      return null;
    } finally {
      loading.value = false;
    }
  }

  // 重置状态
  const reset = () => {
    recentPlays.value = [];
    loading.value = false;
    error.value = null;
    isLoaded.value = false;
  };

  return {
    // 状态
    recentPlays,
    loading,
    error,
    
    // 计算属性
    recentPlayCount: computed(() => recentPlays.value.length),
    
    // 方法
    // fetchRecentPlays,
    fetchRecentIfNeeded,
    addRecentPlay,
    reset
  };
});
