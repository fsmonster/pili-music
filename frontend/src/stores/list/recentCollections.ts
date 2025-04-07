import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Collection } from '@/types';
import { Filter } from '@/types';

export const useRecentlyStore = defineStore('recentCollections', () => {
  // 最近播放列表
  const recent = ref<Collection[]>([]);
  // filter
  const activeFilter = ref<Filter>(Filter.All);
  
  // 添加最近播放
  const addRecentCollection = (collection: Collection) => {
    if (recent.value.length >= 23) {
      recent.value.pop();
    }
    recent.value = recent.value.filter(item => !(item.id === collection.id && item.type === collection.type));
    recent.value.unshift(collection);
  };
  
  // 清空最近播放列表
  const clearRecentCollections = () => {
    recent.value = [];
  };
  
  return {
    recent,
    activeFilter,
    addRecentCollection,
    clearRecentCollections
  };
}, {
  persist: true
});
