import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { MediaItem } from '../../types';
import { getCid, getAudioUrl } from '../../api';
import { processResourceUrl } from '../../utils';
import { useQueueStore } from './queue';

export const usePlayerStore = defineStore('player', () => {
  // 获取播放列表存储
  const queueStore = useQueueStore();
  
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

  // 播放指定项
  async function play(item?: MediaItem) {
    // 如果提供了新的播放项，则更新当前播放项
    if (item) {
      queueStore.setCurrentTrack(item);
      audioLoaded.value = false; // 新的播放项需要重新加载
    }

    const currentItem = queueStore.currentItem;
    
    // 如果有当前播放项
    if (currentItem) {
      // 如果音频尚未加载，需要获取播放地址
      if (!audioLoaded.value) {
        loading.value = true;
        queueStore.setLoading(true);
        
        try {
          // 获取播放地址
          const cid = await getCid(currentItem.id);   
          const url = await getAudioUrl({
            avid: currentItem.id,
            cid,
          });      
                    
          if (url) {
            // 使用 processResourceUrl 处理 URL，通过后端代理
            const processedUrl = processResourceUrl(url);
            audio.src = processedUrl;
            queueStore.setAudioUrl(processedUrl);
            await audio.play();
          } else {
            throw new Error('无法获取音频URL');
          }
        } catch (err) {
          console.error('加载音频失败', err);
          queueStore.setError(err instanceof Error ? err.message : '加载失败');
          loading.value = false;
          queueStore.setLoading(false);
        }
      } else {
        // 音频已加载，直接播放
        await audio.play();
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
    const nextIdx = queueStore.nextIndex();
    if (nextIdx === -1) return;
    
    queueStore.setCurrentIndex(nextIdx);
    audioLoaded.value = false; // 重置加载状态
    play();
  }

  // 上一曲
  function prev() {
    const prevIdx = queueStore.prevIndex();
    if (prevIdx === -1) return;
    
    queueStore.setCurrentIndex(prevIdx);
    audioLoaded.value = false; // 重置加载状态
    play();
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
      } catch (err) {
        console.error('跳转失败:', err);
        // 如果跳转失败，可能是因为音频流还未加载到该位置
        // 可以考虑重新加载音频
        if (queueStore.currentItem) {
          audioLoaded.value = false; // 重置加载状态
          await play(); // 重新加载并播放
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
    
    // 播放列表状态 (从playlistStore获取)
    currentItem: computed(() => queueStore.currentItem),
    queue: computed(() => queueStore.queue),
    currentIndex: computed(() => queueStore.currentIndex),
    
    // 方法
    play,
    pause,
    toggle,
    next,
    prev,
    seek,
    setVolume,
    
    // 播放列表方法
    setQueue: queueStore.setQueue,
  };
}, { 
  persist: true
});
