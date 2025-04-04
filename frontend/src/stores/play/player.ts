import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useQueueStore, useMultiPageQueueStore, useCurrentTrackStore } from './index';
import type { MediaItem } from '../../types';

export const usePlayerStore = defineStore('player', () => {
  // 获取播放列表存储
  const queueStore = useQueueStore();
  const multiPageQueueStore = useMultiPageQueueStore();
  const currentTrackStore = useCurrentTrackStore();
  
  const activeAudioUrl = computed(() => {
    return multiPageQueueStore.isSetMultiPageList ? multiPageQueueStore.audioUrl : currentTrackStore.audioUrl;
  });

  // 音频实例
  const audio = new Audio();
  
  // 播放状态
  const playing = ref(false);
  const currentTime = ref(0);
  const duration = ref(0);
  const loading = ref(false);
  const volume = ref(1);
  const audioLoaded = ref(false); // 标记音频是否已加载

  // 初始化事件监听
  function initAudioEvents() {
    // 播放状态变化
    audio.addEventListener('play', () => playing.value = true);
    audio.addEventListener('pause', () => playing.value = false);
    
    // 时间更新
    audio.addEventListener('timeupdate', () => {
      currentTime.value = audio.currentTime;
    });
    
    // 加载元数据
    audio.addEventListener('loadedmetadata', () => {
      duration.value = audio.duration;
      loading.value = false;
      audioLoaded.value = true;
    });

    // 播放结束
    audio.addEventListener('ended', () => {
      next();
    });

    // 错误处理
    audio.addEventListener('error', () => {
      loading.value = false;
      audioLoaded.value = false;
      console.error('播放出错');
    });
  }

  // 播放
  function replay() {
    if (!activeAudioUrl.value) return;
    audio.pause();
    audio.currentTime = 0;
    audio.play();
    setVolume();
  }
  
  function play() {
    audio.play();
  }
  
  function pause() {
    audio.pause();
  }

  // 切换播放状态
  function toggle() {
    if (playing.value) {
      pause();
    } else {
      play();
    }
  }

  // 下一曲
  function next() {
    if(!multiPageQueueStore.isSetMultiPageList){
      queueStore.next();
      return;
    }
    else{
      multiPageQueueStore.nextPage();
    }
  }

  // 上一曲
  function prev() {
    if(!multiPageQueueStore.isSetMultiPageList){
      queueStore.prev();
      return;
    }
    else{
      multiPageQueueStore.prevPage();
    }
  }

  // 跳转到指定时间
  async function seek(time: number) {
    if (time >= 0 && time <= duration.value) {
      try {
        // 如果音频已加载，直接设置时间
        loading.value = true; // 设置加载状态
        
        // 设置当前时间
        audio.currentTime = time;
        
        // 如果当前是暂停状态，不需要额外处理
        if (!playing.value) {
          loading.value = false;
          return;
        }
    
        // 如果是播放状态，确保继续播放
        try {
          await audio.play();
        } catch (err) {
          console.error('跳转后播放失败:', err);
          // 如果播放失败，可能是浏览器策略限制，尝试再次播放
          setTimeout(async () => {
            try {
              await audio.play();
            } catch (innerErr) {
              console.error('重试播放失败:', innerErr);
            }
          }, 300);
        }
      } finally {
        loading.value = false;
      }
    }
  }

  // 设置音量
  function setVolume() {
    audio.volume = volume.value;
  }
  
  // 切换到指定分P
  async function switchToPage(pageNumber: number) {
    if (!multiPageQueueStore.isMultiPage) return;
    
    multiPageQueueStore.setCurrentPage(pageNumber);
    audioLoaded.value = false; // 重置加载状态
  }

  /**
   * 播放单个媒体项
   * @param item 要播放的媒体项
   */
  function playMedia(item: MediaItem) {
    // 重置队列
    queueStore.setQueue([item]);
    queueStore.total = 1;
    queueStore.currentIndex = 0;
    // 设置当前播放项
    currentTrackStore.currentTrack = item;
    // 播放
    replay();
  }

  /**
   * 播放媒体列表
   * @param items 要播放的媒体列表
   * @param startIndex 开始播放的索引，默认为0
   */
  function playMediaList(items: MediaItem[], startIndex: number = 0) {
    if (!items || items.length === 0) return;
    
    // 设置播放队列
    queueStore.setQueue(items);
    queueStore.total = items.length;
    // 设置当前索引
    queueStore.setCurrentIndex(startIndex);
    // 设置当前播放项
    currentTrackStore.currentTrack = items[startIndex];
    // 播放
    replay();
  }

  // 监听 activeAudioUrl 变化，当它有值时播放
  watch(() => activeAudioUrl.value, (newUrl) => {
    if (newUrl) {
      audio.src = newUrl;
      audio.play();
      setVolume();
    }
  });

  // 初始化事件监听
  initAudioEvents();

  return {
    // 状态
    playing,
    currentTime,
    duration,
    loading,
    volume,
    audioLoaded,    
    // 方法
    replay,
    play,
    pause,
    toggle,
    next,
    prev,
    seek,
    setVolume,
    switchToPage,
    playMedia,
    playMediaList,
  };
}, { 
  persist: true
});
