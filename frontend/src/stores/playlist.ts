import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as playlistApi from '../api/playlist';
import type { FavoriteItem } from '../types/types';

export const usePlaylistStore = defineStore('playlist', () => {
  // 状态
  const currentTrack = ref<FavoriteItem | null>(null);
  const playlist = ref<FavoriteItem[]>([]);
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
  function setPlaylist(items: FavoriteItem[]) {
    playlist.value = items;
  }

  // 播放指定曲目
  async function play(track: FavoriteItem) {
    try {
      loading.value = true;
      error.value = '';
      
      // 如果没有cid，先获取视频信息
      if (!track.cid) {
        const res = await playlistApi.getVideoInfo(track.id.toString());
        track.cid = res.data.data.pages[0]?.cid;
      }

      // 获取音频URL
      if (track.cid) {
        const res = await playlistApi.getAudioUrl({
          aid: track.id.toString(),
          cid: track.cid.toString()
        });
        audioUrl.value = res.data.data.dash?.audio?.[0]?.baseUrl || '';
        currentTrack.value = track;
      }
    } catch (err: any) {
      error.value = err.message || '获取音频失败';
      console.error('获取音频失败:', err);
    } finally {
      loading.value = false;
    }
  }

  // 播放下一曲
  async function playNext() {
    if (currentIndex.value < playlist.value.length - 1) {
      await play(playlist.value[currentIndex.value + 1]);
    }
  }

  // 播放上一曲
  async function playPrevious() {
    if (currentIndex.value > 0) {
      await play(playlist.value[currentIndex.value - 1]);
    }
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
    currentTrack,
    playlist,
    loading,
    error,
    audioUrl,
    // 计算属性
    isPlaying,
    currentIndex,
    // 方法
    setPlaylist,
    play,
    playNext,
    playPrevious,
    reset
  };
});
