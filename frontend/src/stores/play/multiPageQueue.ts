import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { CidInfo } from '../../types';

/**
 * 多P播放列表状态管理
 */
export const useMultiPageQueueStore = defineStore('multiPageQueue', () => {
  // 状态
  const isMultiPage = ref(false);
  const selectedPage = ref(1);
  const pageList = ref<CidInfo[]>([]);
  const currentAid = ref<number | null>(null);
  
  // 计算属性
  const currentPageInfo = computed(() => {
    if (!isMultiPage.value || pageList.value.length === 0) return null;
    // 页码从1开始，数组索引从0开始
    const index = selectedPage.value - 1;
    return index >= 0 && index < pageList.value.length ? pageList.value[index] : null;
  });
  
  // 当前选中页的cid
  const currentCid = computed(() => currentPageInfo.value?.cid || null);
  
  // 设置选中页
  function setSelectedPage(page: number) {
    if (page >= 1 && page <= pageList.value.length) {
      selectedPage.value = page;
    }
  }
  
  // 设置页面列表
  function setPageList(aid: number, pages: CidInfo[]) {
    currentAid.value = aid;
    pageList.value = pages;
    isMultiPage.value = pages.length > 1;
    // 默认选择第一页
    selectedPage.value = 1;
  }
  
  // 重置状态
  function reset() {
    isMultiPage.value = false;
    selectedPage.value = 1;
    pageList.value = [];
    currentAid.value = null;
  }
  
  // 下一页
  function nextPage() {
    if (!isMultiPage.value || pageList.value.length <= 1) return false;
    
    if (selectedPage.value < pageList.value.length) {
      selectedPage.value++;
      return true;
    }
    return false;
  }
  
  // 上一页
  function prevPage() {
    if (!isMultiPage.value || pageList.value.length <= 1) return false;
    
    if (selectedPage.value > 1) {
      selectedPage.value--;
      return true;
    }
    return false;
  }

  return {
    isMultiPage,
    selectedPage,
    pageList,
    currentAid,
    currentPageInfo,
    currentCid,
    setSelectedPage,
    setPageList,
    reset,
    nextPage,
    prevPage
  };
});
