import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { MediaItem } from '../../types';
import { usePlayerStore, useCurrentTrackStore } from './index';

/**
 * @desc 当前播放列表状态管理
 */
export const useQueueStore = defineStore('queue', () => {
  // 获取当前播放项存储
  const currentTrackStore = useCurrentTrackStore();
  const playerStore = usePlayerStore();

  // 状态
  const queue = ref<MediaItem[]>([]);
  const originalQueue = ref<MediaItem[]>([]); // 原始队列，用于保存顺序播放时的队列
  const loading = ref(false);
  const error = ref<string>('');
  const total = ref(0);
  const currentIndex = ref(-1); // 当前播放索引
  const isPopup = ref(false); // 队列弹出状态
  const isRandomMode = ref(false); // 随机播放模式
  const isLoopMode = ref(false); // 单曲循环模式

  // 计算属性
  const currentIndexComputed = computed(() => {
    if (!currentTrackStore.currentTrack) return -1;
    return queue.value.findIndex(item => item.id === currentTrackStore.currentTrack?.id);
  });

  // 设置播放列表
  function setQueue(items: MediaItem[]) {
    // 保存原始队列
    originalQueue.value = [...items];
    
    // 如果处于随机模式，生成随机队列
    if (isRandomMode.value) {
      queue.value = shuffleArray([...items]);
    } else {
      queue.value = items;
    }
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
    // 如果开启了单曲循环，不改变当前索引
    if (isLoopMode.value && currentIndex.value !== -1) {
      // 重新播放当前曲目
      playerStore.replay();
      return;
    }
    
    const nextIndex = (currentIndex.value + 1) % queue.value.length;
    setCurrentIndex(nextIndex);
  }
  
  // 强制切换到下一首，即使在单曲循环模式下
  function forceNext() {
    const nextIndex = (currentIndex.value + 1) % queue.value.length;
    setCurrentIndex(nextIndex);
  }

  // 上一曲
  function prev() {
    const prevIndex = (currentIndex.value - 1 + queue.value.length) % queue.value.length;
    setCurrentIndex(prevIndex);
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
    originalQueue.value = [];
    loading.value = false;
    error.value = '';
    currentIndex.value = -1;
    isPopup.value = false;
    // 不重置随机模式和单曲循环状态，保持用户偏好
  }

  /**
   * 添加媒体项到队列
   * @param medias 要添加的媒体项
   */
  function addToQueue(medias: MediaItem[]) {
    // 添加到原始队列
    originalQueue.value.push(...medias);
    
    if (isRandomMode.value) {
      // 在随机模式下，当前播放的歌曲始终保持在第一位
      const currentItem = currentIndex.value >= 0 ? queue.value[currentIndex.value] : null;
      
      if (currentItem) {
        // 如果有当前播放项，将其保持在第一位，其余项目打乱
        const otherItems = [...queue.value.filter(item => item.id !== currentItem.id), ...medias];
        const shuffledOthers = shuffleArray(otherItems);
        queue.value = [currentItem, ...shuffledOthers];
        // 当前索引保持为0（如果已经是0则不变）
        if (currentIndex.value !== 0) {
          currentIndex.value = 0;
        }
      } else {
        // 没有当前播放项，直接打乱全部项目（包括新添加的）
        const allItems = [...queue.value, ...medias];
        queue.value = shuffleArray(allItems);
      }
    } else {
      // 顺序模式下直接添加
      queue.value.push(...medias);
    }
  }

  /**
   * 辅助函数：打乱数组（Fisher-Yates 洗牌算法）
   */
  function shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  
  /**
   * 切换随机播放模式
   */
  function toggleRandomMode() {
    isRandomMode.value = !isRandomMode.value;
    
    // 保存当前播放的媒体项
    const currentItem = currentIndex.value >= 0 ? queue.value[currentIndex.value] : null;
    
    if (isRandomMode.value) {
      if (currentItem) {
        // 如果有当前播放项，将其放在第一位，其余项目打乱
        const otherItems = originalQueue.value.filter(item => item.id !== currentItem.id);
        const shuffledOthers = shuffleArray([...otherItems]);
        queue.value = [currentItem, ...shuffledOthers];
        currentIndex.value = 0; // 当前项在第一位
      } else {
        // 没有当前播放项，直接打乱整个队列
        queue.value = shuffleArray([...originalQueue.value]);
      }
    } else {
      // 关闭随机模式，恢复原始队列
      queue.value = [...originalQueue.value];
      
      // 恢复当前播放项的索引
      if (currentItem) {
        const newIndex = queue.value.findIndex(item => item.id === currentItem.id);
        if (newIndex !== -1) {
          currentIndex.value = newIndex;
        }
      }
    }
    
    return isRandomMode.value;
  }
  
  /**
   * 切换单曲循环模式
   */
  function toggleLoopMode() {
    isLoopMode.value = !isLoopMode.value;
    return isLoopMode.value;
  }

  return {
    // 状态
    // currentTrack,
    queue,
    originalQueue,
    loading,
    error,
    total,
    currentIndex,
    isPopup,
    isRandomMode,
    isLoopMode,
    // 计算属性
    currentIndexComputed,
    // currentItem,
    // 方法
    setQueue,
    setCurrentTrack,
    setCurrentIndex,
    setLoading,
    setError,
    // setCurrentItem,
    next,
    forceNext,
    prev,
    togglePopup,
    setPopupState,
    reset,
    addToQueue,
    toggleRandomMode,
    toggleLoopMode,
    shuffleArray
  };
});
