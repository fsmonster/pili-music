import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { MediaItem } from '../types/types';
import { getVideoInfo,getAudioUrl } from '../api/audio';
import { processResourceUrl } from '../utils/processResoureUrl';

export const usePlayerStore = defineStore('player', () => {
  // 音频实例
  const audio = new Audio();
  
  // 播放状态
  const playing = ref(false);
  const currentTime = ref(0);
  const duration = ref(0);
  const loading = ref(false);

  // 播放列表
  const playlist = ref<MediaItem[]>([]);
  const currentIndex = ref(-1);

  // 当前播放项
  const currentItem = computed(() => {
    if (currentIndex.value >= 0 && currentIndex.value < playlist.value.length) {
      return playlist.value[currentIndex.value];
    }
    return null;
  });

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
    });

    // 播放结束
    audio.addEventListener('ended', () => {
      next();
    });

    // 错误处理
    audio.addEventListener('error', () => {
      loading.value = false;
      console.error('播放出错');
    });
  }

  // 设置播放列表
  function setPlaylist(items: MediaItem[]) {
    playlist.value = items;
  }

  // 播放指定项
  async function play(item?: MediaItem) {
    if (item) {
      // 查找项目索引
      const index = playlist.value.findIndex(i => i.bvid === item.bvid);
      if (index !== -1) {
        currentIndex.value = index;
      } else {
        // 如果不在列表中，添加到列表并播放
        playlist.value = [item];
        currentIndex.value = 0;
      }
    }

    if (currentItem.value) {
      loading.value = true;
      try {
        // 获取播放地址
        const cid = (await getVideoInfo(currentItem.value.id.toString())).data.data.cid;     
        const url = await getAudioUrl({
          avid: currentItem.value.id,
          cid: cid
        });
        console.log('🙄 store: 获取到音频URL', url);        
        if (url) {
          // 使用 processResourceUrl 处理 URL，通过后端代理
          const processedUrl = processResourceUrl(url);
          audio.src = processedUrl;
          // audio.src = url;
          initAudioEvents();
          await audio.play();
        }
      } catch (error) {
        console.error('获取播放地址失败', error);
        loading.value = false;
      }
    }
  }

  // 暂停
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
    if (playlist.value.length === 0) return;
    
    currentIndex.value = (currentIndex.value + 1) % playlist.value.length;
    play();
  }

  // 上一曲
  function prev() {
    if (playlist.value.length === 0) return;
    
    currentIndex.value = currentIndex.value - 1;
    if (currentIndex.value < 0) {
      currentIndex.value = playlist.value.length - 1;
    }
    play();
  }

  // 跳转到指定时间
  function seek(time: number) {
    if (time >= 0 && time <= duration.value) {
      audio.currentTime = time;
    }
  }

  // 初始化事件监听
  initAudioEvents();

  return {
    // 状态
    playing,
    currentTime,
    duration,
    loading,
    playlist,
    currentItem,
    
    // 方法
    play,
    pause,
    toggle,
    next,
    prev,
    seek,
    setPlaylist,
  };
});
