import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import type { PageInfo, MediaItem } from '../../types';
import { getCid } from '../../api';
import { getAudioUrl } from "../../api";
import { processResourceUrl } from "../../utils";

/**
 * 多P播放列表状态管理
 */
export const useMultiPageQueueStore = defineStore('multiPageQueue', () => {
  // 状态信息
  const isMultiPage = ref(false);  // 是否多P
  const enableMultiPagePlay = ref(false);  // 是否启用多P播放, 默认只播放第一p
  const isExpanded = ref(false);  // 是否弹出多P列表
  const isSetMultiPageList = computed(() => isMultiPage.value && 
    (enableMultiPagePlay.value || isExpanded.value));

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

  // 播放状态 - 暂时不用
  // const isPlaying = computed(() => !!currentPage.value && !!audioUrl.value);

  // 音频 URL
  const audioUrl = ref("");
  
  /**
   * 加载多P列表
   * @param track 当前播放项
   * 什么时候会设置多p列表呢？
   * 1. 勾选多p自动播放 && 播放到多p视频
   * 2. 主动展开多p列表并播放track 
   */
  async function loadMultiPageList(track: MediaItem) {
    if (!track) return;
  
    isMultiPage.value = typeof track.page === "number" && track.page > 1;
    if (!isMultiPage.value) return;
  
    try {
      const pageListResponse = await getCid({ aid: track.id }, true);
      if (Array.isArray(pageListResponse)) {
        setPageList(track.id, pageListResponse);
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
    const nextIndex = ( + 1) % pageList.value.length;
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
    // isPlaying,
    // 视频信息
    pageList,
    total,
    currentAid,
    // 分p信息
    currentPage,
    audioUrl,
    // 操作
    loadMultiPageList,
    setCurrentPage,
    setPageList,
    reset,
    nextPage,
    prevPage
  };
});
