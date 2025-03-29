import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useQueueStore } from './queue';
import {
  getFavoriteContent,
  searchVideoByKeywords,
} from '@/api';

/**
 * @desc 懒加载状态管理
 */
export const useLazyLoadStore = defineStore('lazyLoad', () => {
  const queueStore = useQueueStore();

  // 状态
  const type = ref<'favorite' | 'home'>('favorite');
  const id = ref(0);
  const pn = ref(1);
  const ps = ref(20);
  // 收藏为media_count，主页视频为total
  const total = ref(0);
  const hasMore = computed(() => queueStore.queue.length < total.value);

  // 获取数据
  const getData = async () => {
    if (type.value === 'favorite') {
      const res = await getFavoriteContent({
        media_id: id.value,
        pn: pn.value,
        ps: ps.value
      });
      total.value = res.data.media_count;
      return res.data.list;
    } else {
      const res = await searchVideoByKeywords({
        mid: id.value,
        pn: pn.value,
        ps: ps.value
      });
      total.value = res.data.total;
      return res.data.list;
    }
  };

  return {
    // 状态
    type,
    id,
    pn,
    ps,
    total,
    hasMore,
    getData
  };
});