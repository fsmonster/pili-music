/**
 * 点赞状态管理
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { LikeStatus, MediaItem } from '../../types';
import * as playlistApi from '../../api';

export const useLikeStore = defineStore('like', () => {
  // 状态
  const likedMedia = ref<LikeStatus[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // 获取用户的点赞列表
  async function fetchLikedMedia() {
    loading.value = true;
    error.value = null;
    
    try {
      const data = await playlistApi.getLikedMedia();
      likedMedia.value = data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取点赞列表失败';
      console.error('获取点赞列表失败:', err);
    } finally {
      loading.value = false;
    }
  }

  // 点赞/取消点赞媒体
  async function toggleLike(mediaId: number, liked: boolean) {
    loading.value = true;
    error.value = null;
    
    try {
      const data = await playlistApi.toggleLike(mediaId, liked);
      
      // 更新本地缓存
      const index = likedMedia.value.findIndex(item => item.mediaId === mediaId);
      if (index !== -1) {
        if (liked) {
          // 更新点赞状态
          likedMedia.value[index] = data;
        } else {
          // 取消点赞，从列表中移除
          likedMedia.value.splice(index, 1);
        }
      } else if (liked) {
        // 新增点赞
        likedMedia.value.push(data);
      }
      
      return data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '点赞操作失败';
      console.error('点赞操作失败:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // 检查媒体是否已点赞
  function isLiked(mediaId: number): boolean {
    return likedMedia.value.some(item => item.mediaId === mediaId);
  }

  return {
    // 状态
    likedMedia,
    loading,
    error,
    
    // 计算属性
    likedCount: computed(() => likedMedia.value.length),
    
    // 方法
    fetchLikedMedia,
    toggleLike,
    isLiked,
  };
});
