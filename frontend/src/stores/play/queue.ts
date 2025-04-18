import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { MediaItem } from '../../types';
import { useCurrentTrackStore } from './currentTrack';

/**
 * @desc 当前播放列表状态管理
 */
export const useQueueStore = defineStore('queue', () => {
  // 获取当前播放项存储
  const currentTrackStore = useCurrentTrackStore();

  // 状态
  const queue = ref<MediaItem[]>([]);
  const loading = ref(false);
  const error = ref<string>('');
  const total = ref(0);
  const currentIndex = ref(-1); // 当前播放索引
  const isPopup = ref(false); // 队列弹出状态

  // 计算属性
  const currentIndexComputed = computed(() => {
    if (!currentTrackStore.currentTrack) return -1;
    return queue.value.findIndex(item => item.id === currentTrackStore.currentTrack?.id);
  });

  // 设置播放列表
  function setQueue(items: MediaItem[]) {
    queue.value = items;
  }

  // 设置当前播放项
  function setCurrentTrack(item: MediaItem | null) {
    currentTrackStore.currentTrack = item;
    if (item) {
      // 查找项目索引
      const index = queue.value.findIndex(i => i.bvid === item.bvid);
      if (index !== -1) {
        currentIndex.value = index;
      } else {
        // 如果不在列表中，添加到列表并更新索引
        queue.value.push(item);
        currentIndex.value = queue.value.length - 1;
      }
    }
  }

  // 设置当前索引
  function setCurrentIndex(index: number) {
    currentIndex.value = index;
    setCurrentTrack(queue.value[index]);
  }

  // 下一曲
  function next() {
    const nextIndex = (currentIndex.value + 1) % queue.value.length;
    setCurrentItem(nextIndex);
  }

  // 上一曲
  function prev() {
    const prevIndex = (currentIndex.value - 1 + queue.value.length) % queue.value.length;
    setCurrentItem(prevIndex);
  }
  
  // 设置当前索引和当前播放项
  function setCurrentItem(index: number) {
    if (index >= -1 && index < queue.value.length) {
      currentIndex.value = index;
      currentTrackStore.currentTrack = queue.value[index];
    }
  }

  // 设置加载状态
  function setLoading(state: boolean) {
    loading.value = state;
  }

  // 设置错误信息
  function setError(msg: string) {
    error.value = msg;
  }

  // 切换队列弹出状态
  function togglePopup() {
    isPopup.value = !isPopup.value;
  }

  // 设置队列弹出状态
  function setPopupState(state: boolean) {
    isPopup.value = state;
  }

  // 重置状态
  function reset() {
    queue.value = [];
    loading.value = false;
    error.value = '';
    currentIndex.value = -1;
    isPopup.value = false;
  }

  /**
   * 添加媒体项到队列
   * @param medias 要添加的媒体项
   */
  function addToQueue(medias: MediaItem[]) {
    queue.value.push(...medias);
  }

  return {
    // 状态
    // currentTrack,
    queue,
    loading,
    error,
    total,
    currentIndex,
    isPopup,   
    // 计算属性
    currentIndexComputed,
    // currentItem,
    // 方法
    setQueue,
    setCurrentTrack,
    setCurrentIndex,
    setLoading,
    setError,
    setCurrentItem,
    next,
    prev,
    togglePopup,
    setPopupState,
    reset,
    addToQueue
  };
});
