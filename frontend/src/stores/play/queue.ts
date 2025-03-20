import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { MediaItem } from '../../types';

/**
 * @desc 当前播放列表状态管理
 */
export const useQueueStore = defineStore('queue', () => {
  // 状态
  const currentTrack = ref<MediaItem | null>(null);
  const queue = ref<MediaItem[]>([]);
  const loading = ref(false);
  const error = ref<string>('');
  const audioUrl = ref<string>('');
  const currentIndex = ref(-1); // 当前播放索引
  const isPopup = ref(false); // 队列弹出状态

  // 计算属性
  const isPlaying = computed(() => !!currentTrack.value && !!audioUrl.value);
  const currentIndexComputed = computed(() => {
    if (!currentTrack.value) return -1;
    return queue.value.findIndex(item => item.id === currentTrack.value?.id);
  });

  // 当前播放项
  const currentItem = computed(() => {
    if (currentIndex.value >= 0 && currentIndex.value < queue.value.length) {
      return queue.value[currentIndex.value];
    }
    return null;
  });

  // 设置播放列表
  function setQueue(items: MediaItem[]) {
    queue.value = items;
  }

  // 设置当前播放项
  function setCurrentTrack(item: MediaItem | null) {
    currentTrack.value = item;
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

  // 设置音频URL
  function setAudioUrl(url: string) {  
    audioUrl.value = url;
  }

  // 设置加载状态
  function setLoading(state: boolean) {
    loading.value = state;
  }

  // 设置错误信息
  function setError(msg: string) {
    error.value = msg;
  }

  // 下一曲索引
  function nextIndex() {
    if (queue.value.length === 0) return -1;    
    return (currentIndex.value + 1) % queue.value.length;
  }

  // 上一曲索引
  function prevIndex() {
    if (queue.value.length === 0) return -1;
    
    let index = currentIndex.value - 1;
    if (index < 0) {
      index = queue.value.length - 1;
    }
    return index;
  }

  // 设置当前索引
  function setCurrentIndex(index: number) {
    if (index >= -1 && index < queue.value.length) {
      currentIndex.value = index;
      currentTrack.value = currentItem.value;
    }
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
    currentTrack.value = null;
    queue.value = [];
    loading.value = false;
    error.value = '';
    audioUrl.value = '';
    currentIndex.value = -1;
    isPopup.value = false;
  }

  return {
    // 状态
    currentTrack,
    queue,
    loading,
    error,
    audioUrl,
    currentIndex,
    isPopup,
    // 计算属性
    isPlaying,
    currentIndexComputed,
    currentItem,
    // 方法
    setQueue,
    setCurrentTrack,
    setAudioUrl,
    setLoading,
    setError,
    setCurrentIndex,
    nextIndex,
    prevIndex,
    togglePopup,
    setPopupState,
    reset
  };
});
