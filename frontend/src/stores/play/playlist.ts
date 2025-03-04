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

  // 计算属性
  const isPlaying = computed(() => !!currentTrack.value && !!audioUrl.value);
  const currentIndex = computed(() => {
    if (!currentTrack.value) return -1;
    return playlist.value.findIndex(item => item.id === currentTrack.value?.id);
  });

  // 设置播放列表
  function setPlaylist(items: MediaItem[]) {
    playlist.value = items;
  }

  // 重置状态
  function reset() {
    currentTrack.value = null;
    playlist.value = [];
    loading.value = false;
    error.value = '';
    audioUrl.value = '';
  }

  return {
    // 状态
    playlist,
    error,
    audioUrl,
    // 计算属性
    isPlaying,
    currentIndex,
    // 方法
    setPlaylist,
    reset
  };
});
