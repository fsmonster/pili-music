import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import type { PageInfo, MediaItem } from '../../types';
import { getCid, getAudioUrl } from '../../api';
import { processResourceUrl } from "../../utils";

/**
 * 多P播放列表状态管理
 */
export const useMultiPageQueueStore = defineStore('multiPageQueue', () => {
  // 状态信息
  const isMultiPage = ref(false);  // 是否多P
  const enableMultiPagePlay = ref(true);  // 是否启用多P播放, 默认启用
  const isExpanded = ref(false);  // 是否弹出多P列表
  const isSetMultiPageList = computed(() => isMultiPage.value && 
    (enableMultiPagePlay.value || isExpanded.value));
  const isDisplay = ref(false);

  // 视频信息
  const pageList = ref<PageInfo[]>([]);  // 页面列表
  const currentAid = ref<number | null>(null);  // 当前aid
  const total = computed(() => pageList.value.length);  // 总页数

  // 分p信息
  const currentPage = ref(1); // 选中页
  
  // 当前选中分p
  const currentPageInfo = computed((): PageInfo | null => {
    if (!isMultiPage.value || !pageList.value.length || pageList.value.length === 0) return null;
    // 页码从1开始，数组索引从0开始
    const index = currentPage.value - 1;
    return index >= 0 && index < pageList.value.length
      ? pageList.value[index]
      : null;
  });

  // 当前选中分p的cid
  const currentCid = computed(() => currentPageInfo.value?.cid || null);

  // 音频 URL
  const audioUrl = ref("");

  /**
   * 判断是否为多P视频
   * @param track 当前播放项
   */
  function isMultiPageVideo(track: MediaItem): boolean {
    return typeof track.page === "number" && track.page > 1;
  }
  
  /**
   * 加载多P列表
   * @param id 当前播放项的aid
   * 什么时候会设置多p列表呢？
   * 1. 勾选多p自动播放 && 播放到多p视频
   * 2. 主动展开多p列表并播放track 
   */
  async function loadMultiPageList(id: number) {
    if (!id) return;
    try {
      const pageListResponse = await getCid({ aid: id }, true);
      if (Array.isArray(pageListResponse)) {
        setPageList(id, pageListResponse);
      }
    } catch (error) {
      console.error("加载多P列表失败", error);
    }
  }
  
  // 设置视频分p列表
  function setPageList(aid: number, pages: PageInfo[]) {
    currentAid.value = aid;
    pageList.value = pages;
    isMultiPage.value = pages.length > 1;
    // 默认选择第一页
    setCurrentPage(1);
  }
  
  // 下一页
  function nextPage() {
    const nextIndex = (currentPage.value + 1) % pageList.value.length;
    setCurrentPage(nextIndex);
  }
  
  // 上一页
  function prevPage() {
    const prevIndex = (currentPage.value - 1 + pageList.value.length) % pageList.value.length;
    setCurrentPage(prevIndex);
  }

  // 设置选中分p
  function setCurrentPage(page: number) {
    if (page >= 1 && page <= pageList.value.length) {
      currentPage.value = page;
    }
  }

  // 切换多P列表弹出状态
  function toggleDisplay() {
    isDisplay.value = !isDisplay.value;
    console.log('isDisplay', isDisplay.value);
  }

  // 重置状态
  function reset() {
    isMultiPage.value = false;
    currentPage.value = 1;
    pageList.value = [];
    currentAid.value = null;
  }

  // 监听 cid 变化，获取音频 URL
  watch(() => currentCid.value,
    async (newCid) => {
      if (!newCid || !currentAid.value) return;
      const url = await getAudioUrl({ avid: currentAid.value, cid: newCid });
      audioUrl.value = url ? processResourceUrl(url) : "";
    }
  )

  return {
    // 状态信息
    enableMultiPagePlay,
    isMultiPage,
    isExpanded,
    isSetMultiPageList,
    isDisplay,
    // 视频信息
    pageList,
    total,
    currentAid,
    // 分p信息
    currentPage,
    audioUrl,
    // 操作
    isMultiPageVideo,
    loadMultiPageList,
    setCurrentPage,
    setPageList,
    reset,
    nextPage,
    prevPage,
    toggleDisplay
  };
});
