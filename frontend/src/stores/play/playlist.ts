import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { MediaItem } from '../../types';

/**
 * @desc 播放列表状态管理
 */
export const usePlaylistStore = defineStore('playlist', () => {
  // 状态
  const currentTrack = ref<MediaItem | null>(null);
  const playlist = ref<MediaItem[]>([]);
  const loading = ref(false);
  const error = ref<string>('');
  const audioUrl = ref<string>('');
  const currentIndex = ref(-1); // 当前播放索引

  // 计算属性
  const isPlaying = computed(() => !!currentTrack.value && !!audioUrl.value);
  const currentIndexComputed = computed(() => {
    if (!currentTrack.value) return -1;
    return playlist.value.findIndex(item => item.id === currentTrack.value?.id);
  });

  // 当前播放项
  const currentItem = computed(() => {
    if (currentIndex.value >= 0 && currentIndex.value < playlist.value.length) {
      return playlist.value[currentIndex.value];
    }
    return null;
  });

  // 设置播放列表
  function setPlaylist(items: MediaItem[]) {
    playlist.value = items;
  }

  // 设置当前播放项
  function setCurrentTrack(item: MediaItem | null) {
    currentTrack.value = item;
    if (item) {
      // 查找项目索引
      const index = playlist.value.findIndex(i => i.bvid === item.bvid);
      if (index !== -1) {
        currentIndex.value = index;
      } else {
        // 如果不在列表中，添加到列表并更新索引
        playlist.value.push(item);
        currentIndex.value = playlist.value.length - 1;
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
    if (playlist.value.length === 0) return -1;    
    return (currentIndex.value + 1) % playlist.value.length;
  }

  // 上一曲索引
  function prevIndex() {
    if (playlist.value.length === 0) return -1;
    
    let index = currentIndex.value - 1;
    if (index < 0) {
      index = playlist.value.length - 1;
    }
    return index;
  }

  // 设置当前索引
  function setCurrentIndex(index: number) {
    if (index >= -1 && index < playlist.value.length) {
      currentIndex.value = index;
      currentTrack.value = currentItem.value;
    }
  }

  // 重置状态
  function reset() {
    currentTrack.value = null;
    playlist.value = [];
    loading.value = false;
    error.value = '';
    audioUrl.value = '';
    currentIndex.value = -1;
  }

  return {
    // 状态
    currentTrack,
    playlist,
    loading,
    error,
    audioUrl,
    currentIndex,
    // 计算属性
    isPlaying,
    currentIndexComputed,
    currentItem,
    // 方法
    setPlaylist,
    setCurrentTrack,
    setAudioUrl,
    setLoading,
    setError,
    setCurrentIndex,
    nextIndex,
    prevIndex,
    reset
  };
});
