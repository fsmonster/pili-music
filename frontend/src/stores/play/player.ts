import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { MediaItem } from '../../types';
import { getCid, getAudioUrl } from '../../api';
import { processResourceUrl } from '../../utils';
import { useQueueStore, useMultiPageQueueStore } from './index';

export const usePlayerStore = defineStore('player', () => {
  // 获取播放列表存储
  const queueStore = useQueueStore();
  const multiPageQueueStore = useMultiPageQueueStore();
  
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
      // 如果是多P视频，尝试播放下一P
      if (multiPageQueueStore.isMultiPage) {
        if (multiPageQueueStore.nextPage()) {
          // 重置加载状态
          audioLoaded.value = false;
          // 播放下一P
          play();
        } else {
          // 如果已经是最后一P，则播放下一个媒体项
          next();
        }
      } else {
        // 单P视频或音频，直接播放下一个
        next();
      }
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
      // 重置多P状态
      // multiPageQueueStore.reset();
    }

    const currentItem = queueStore.currentItem;
    
    // 如果有当前播放项
    if (currentItem) {
      // 如果音频尚未加载，需要获取播放地址
      if (!audioLoaded.value) {
        loading.value = true;
        queueStore.setLoading(true);
        
        try {
          let cid: number;
          
          // 判断是否为多P视频（page > 1 表示有多个分P）
          const isMultiPage = typeof currentItem.page === "number" && currentItem.page > 1;
          
          if (isMultiPage) {
            // 如果是多P视频且还没有加载页面列表
            if (!multiPageQueueStore.isMultiPage || multiPageQueueStore.currentAid !== currentItem.id) {
              // 获取分P列表
              const pageListResponse = await getCid({
                aid: currentItem.id,
              }, true); // 传入true表示获取完整的分P列表
              
              // 确保 pageListResponse 是 CidInfo[] 类型
              if (Array.isArray(pageListResponse)) {
                // 设置多P播放队列
                multiPageQueueStore.setPageList(currentItem.id, pageListResponse);
              } else {
                throw new Error('获取分P列表失败');
              }
            }
            
            // 使用当前选中页的cid
            const currentPageCid = multiPageQueueStore.currentCid;
            if (!currentPageCid) {
              throw new Error('无法获取视频cid');
            }
            cid = currentPageCid;
          } else {
            // 单P视频或音频
            // 优先使用 ugc?.first_cid（如果存在）
            const cidResponse = await getCid({
              aid: currentItem.id,
            });
            
            // 确保 cidResponse 是 number 类型
            if (typeof cidResponse === 'number') {
              cid = currentItem.ugc?.first_cid || cidResponse;
            } else {
              // 如果返回的是数组，取第一个元素的 cid
              cid = currentItem.ugc?.first_cid || (Array.isArray(cidResponse) ? cidResponse[0].cid : 0);
            }
          }
          
          // 获取播放地址
          const url = await getAudioUrl({
            avid: currentItem.id,
            cid,
          });

          // 处理获取到的URL
          if (url) {
            // 使用 processResourceUrl 处理 URL，通过后端代理
            const processedUrl = processResourceUrl(url);
            audio.src = processedUrl;
            queueStore.setAudioUrl(processedUrl);
            await audio.play();
          } else {
            queueStore.setError('该视频为充电视频，无法播放');
            return;
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
    setVolume();
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
    // 如果是多P视频，先尝试切换到上一P
    if (multiPageQueueStore.isMultiPage && currentTime.value < 3) { // 如果播放时间小于3秒，切换到上一P
      if (multiPageQueueStore.prevPage()) {
        audioLoaded.value = false; // 重置加载状态
        play();
        return;
      }
    }
    
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
  
  // 切换到指定分P
  async function switchToPage(pageNumber: number) {
    if (!multiPageQueueStore.isMultiPage) return;
    
    multiPageQueueStore.setSelectedPage(pageNumber);
    audioLoaded.value = false; // 重置加载状态
    await play(); // 重新加载并播放
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
    
    // 多P相关
    isMultiPage: computed(() => multiPageQueueStore.isMultiPage),
    currentPage: computed(() => multiPageQueueStore.selectedPage),
    pageList: computed(() => multiPageQueueStore.pageList),
    
    // 播放列表状态 (从queueStore获取)
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
    switchToPage,
    
    // 播放列表方法
    setQueue: queueStore.setQueue,
  };
}, { 
  persist: true
});
