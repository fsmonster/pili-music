import { defineStore, storeToRefs } from 'pinia';
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

  const { isMultiPage } = storeToRefs(multiPageQueueStore);
  
  // 监听 currentTrack 变化，异步获取 CID，多P视频时加载分P列表
  watch(() => currentTrack.value,
    async (newTrack) => {
      if (!newTrack) {
        cid.value = null;
        isMultiPage.value = false;
        return;
      }
      if(newTrack.cid) {
        cid.value = newTrack.cid;
      } else {
        let cidRes = await getCid({ aid: newTrack.id });
        if (cidRes.length > 1) {
          cid.value = cidRes[0].cid;
          multiPageQueueStore.loadMultiPageList(newTrack.id);
        }
        else {
          cid.value = cidRes[0].cid;
          multiPageQueueStore.reset();
        }
      }
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

  return {
    currentTrack,
    cid,
    audioUrl,
  };
});
