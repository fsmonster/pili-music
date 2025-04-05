import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { recentlyCollections } from '@/types';

export const useRecentlyStore = defineStore('recentCollections', () => {
  const recent = ref<recentlyCollections[]>([]);
  
  // 添加最近播放
  const addRecentCollection = (collection: recentlyCollections) => {
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
    addRecentCollection,
    clearRecentCollections
  };
}, {
  persist: true
});
