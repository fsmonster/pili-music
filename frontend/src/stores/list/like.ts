/**
 * 点赞状态管理
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Like } from '../../types';
import * as likeApi from '../../api';
import { getCid } from '../../api';
import { useUserStore, useQueueStore } from '../../stores';

export const useLikeStore = defineStore('like', () => {
  const userStore = useUserStore();
  const queueStore = useQueueStore();
  
  /**
   * @desc 状态
   */
  const likes = ref<Like[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const isLoaded = ref(false);

  /**
   * @desc 获取点赞列表
   * @returns {Promise<Like[]>} 点赞列表
   */
  async function fetchLikedMedia() {
    loading.value = true;
    error.value = null;
    isLoaded.value = false;
    
    try {
      const data = await likeApi.getLikedMedia();
      likes.value = data;
      isLoaded.value = true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取点赞列表失败';
      console.error('获取点赞列表失败:', err);
    } finally {
      loading.value = false;
    }
  }

  /**
   * @desc 获取点赞列表
   * @returns {Promise<Like[]>} 点赞列表
   */
  const fetchLikedIfNeeded = async () => {
    if (userStore.isLoggedIn && !isLoaded.value) {
      await fetchLikedMedia();
    }
  };

  /**
   * @desc 检查是否已点赞
   * @param {number} avid - 媒体ID
   * @param {number} cid - 媒体CID
   * @returns {Promise<boolean>} 是否已点赞
   */
  async function checkIsLiked(avid: number, cid: number): Promise<boolean> {
    try {
      if (!avid) {
        return false;
      }
      if(!cid){
        cid = await getCid(avid);
      }
      const res = await likeApi.checkIsLiked(avid, cid);
      const mediaItem = queueStore.currentTrack;
      likes.value.push({
        mediaItem
      });
      return res;
    } catch (error) {
      console.error('检查喜欢状态失败:', error);
      throw error;
    }
  }

  /**
   * @desc 点赞
   * @param {number} avid - 媒体ID
   * @param {string} bvid - 媒体BV号
   * @param {number} cid - 媒体CID
   * @returns {Promise<Like>} 点赞后的数据
   */
  async function addLike(avid: number, bvid: string, cid: number) {
    loading.value = true;
    error.value = null;
    
    try {
      if(!cid){
        cid = await getCid(avid);
      }
      const data = await likeApi.addLike(avid, bvid, cid);
      
      // 更新本地缓存
      likes.value.push(data);
      return data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '点赞失败';
      console.error('点赞失败:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * @desc 取消点赞
   * @param {number} avid - 媒体ID
   * @param {number} cid - 媒体CID
   * @returns {Promise<Like>} 取消点赞后的数据
   */
  async function removeLike(avid: number, cid: number) {
    loading.value = true;
    error.value = null;
    
    try {
      const data = await likeApi.removeLike(avid, cid);
      
      // 更新本地缓存
      const index = likes.value.findIndex(item => item.mediaItem.id === avid);
      if (index !== -1) {
        likes.value.splice(index, 1);
      }
      return data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '取消点赞失败';
      console.error('取消点赞失败:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * @desc 重置状态
   */
  const reset = () => {
    likes.value = [];
    loading.value = false;
    error.value = null;
    isLoaded.value = false;
  };

  return {
    // 状态
    likes,
    loading,
    error,  
    // 计算属性
    likedCount: computed(() => likes.value.length),
    
    // 方法
    fetchLikedIfNeeded,
    checkIsLiked,
    addLike,
    removeLike,
    reset
  };
});
