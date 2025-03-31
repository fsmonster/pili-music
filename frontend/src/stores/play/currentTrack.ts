import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import type { MediaItem } from '../../types';
import { useMultiPageQueueStore } from './index';
import { getCid, getAudioUrl } from '../../api';
import { processResourceUrl } from '../../utils';

/**
 * @desc 当前播放项状态管理
 */
export const useCurrentTrackStore = defineStore('currentTrack', () => {
  const multiPageQueueStore = useMultiPageQueueStore();
  // 状态
  const currentTrack = ref<MediaItem | null>(null);

  /**
   * 当前视频的 cid 
   * ugc.first_cid 目前为收藏夹特有
   */
  const cid = ref<number | null>(null);
  const audioUrl = ref('');

  // 监听 currentTrack 变化，异步获取 CID
  watch(() => currentTrack.value,
    async (newTrack) => {
      if (!newTrack) {
        cid.value = null;
        return;
      }
      cid.value = newTrack.ugc?.first_cid || (await getCid({ aid: newTrack.id })) as number;
    }
  );
  
  // 监听 cid 变化，获取音频 URL
  watch(() => cid.value,
    async (newCid) => {
      if (!newCid || !currentTrack.value) {
        audioUrl.value = '';
        return;
      }
  
      try {
        const url = await getAudioUrl({ avid: currentTrack.value.id, cid: newCid });
        audioUrl.value = url ? processResourceUrl(url) : '';
      } catch (error) {
        console.error('获取音频 URL 失败:', error);
        audioUrl.value = '';
      }
    }
  );

  // 监听当前播放项变化, 如果是多P视频, 则获取完整的分P列表
  watch(() => currentTrack.value, async () => {
    if(currentTrack.value) {
      // 判断是否为多P视频
      if(multiPageQueueStore.isMultiPageVideo(currentTrack.value)) {
        multiPageQueueStore.loadMultiPageList(currentTrack.value.id);
        multiPageQueueStore.isMultiPage = true;
      }
      else {
        multiPageQueueStore.reset();
      }
    }
  })

  return {
    currentTrack,
    cid,
    audioUrl,
  };
});
