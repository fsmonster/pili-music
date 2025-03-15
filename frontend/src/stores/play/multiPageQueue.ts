import { defineStore } from 'pinia';
import { ref } from 'vue';

/**
 * 多P播放列表状态管理
 */
export const useMultiPageQueueStore = defineStore('multiPageQueue', () => {
  // 状态
  const isMultiPage = ref(false);
  const selectedPage = ref(1);
  
  // 设置选中页
  function setSelectedPage(page: number) {
    selectedPage.value = page;
  }

  return {
    isMultiPage,
    selectedPage,
    setSelectedPage
  };
});
