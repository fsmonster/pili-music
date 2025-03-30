import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useQueueStore } from './queue';
import {
  getFavoriteContent,
  searchVideoByKeywords,
} from '@/api';
import { convertArchiveToMediaItem } from '@/utils/common';

/**
 * @desc 懒加载状态管理
 */
export const useLazyLoadStore = defineStore('lazyLoad', () => {
  const queueStore = useQueueStore();

  // 状态
  const type = ref<'favorite' | 'home' | null>(null);
  const id = ref(0);
  const pn = ref(1);
  const ps = 40;
  // 收藏为media_count，主页视频为total
  const total = ref(0);
  const hasMore = computed(() => queueStore.queue.length < total.value);

  // 获取数据
  const getData = async () => {
    if (type.value === 'favorite') {
      const res = await getFavoriteContent({
        media_id: id.value,
        pn: pn.value,
        ps: ps
      });
      total.value = res.info.media_count;
      return res.medias;
    } else {
      const res = await searchVideoByKeywords({
        mid: id.value,
        pn: pn.value,
        ps: ps
      });
      total.value = res.data.page.total;
      return res.data.archives.map(convertArchiveToMediaItem);
    }
  };

  // 重置
  function reset() {
    type.value = null;
    id.value = 0;
    pn.value = 1;
    total.value = 0;
  }

  return {
    // 状态
    type,
    id,
    pn,
    ps,
    total,
    hasMore,
    getData,
    reset
  };
});