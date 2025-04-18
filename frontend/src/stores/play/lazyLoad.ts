import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  getFavoriteContent,
  searchVideoByKeywords,
} from '@/api';
import { convertArchiveToMediaItem } from '@/utils/common';
import type { CollectionType, LazyParams } from '@/types';

/**
 * @desc 懒加载状态管理
 */
export const useLazyLoadStore = defineStore('lazyLoad', () => {
  // 状态
  const type = ref<CollectionType | null>(null);
  const id = ref(0);
  const pn = ref(1);
  const ps = 40;

  // 设置状态
  const set = (lazyParams: LazyParams) => {
    type.value = lazyParams.type;
    id.value = lazyParams.id;
    pn.value = lazyParams.pn ?? 1;
  };

  // 获取数据
  const getData = async () => {
    if (type.value === 'favorite') {
      const res = await getFavoriteContent({
        media_id: id.value,
        pn: pn.value,
        ps: ps
      });
      return res.medias;
    } else {
      const res = await searchVideoByKeywords({
        mid: id.value,
        pn: pn.value,
        ps: ps
      });
      return res.data.archives.map(convertArchiveToMediaItem);
    }
  };

  // 重置
  function reset() {
    type.value = null;
    id.value = 0;
    pn.value = 1;
  }

  return {
    // 状态
    type,
    id,
    pn,
    ps,
    set,
    getData,
    reset
  };
});