// import { defineStore, storeToRefs } from "pinia";
// import { ref, computed, watchEffect, watch } from "vue";
// import { useMultiPageQueueStore } from "./index";
// import { getAudioUrl } from "../../api";
// import { processResourceUrl } from "../../utils";
// import type { PageInfo } from "../../types";

// /**
//  * @desc 当前播放项状态管理
//  */
// export const useCurrentPageStore = defineStore("currentPage", () => {
//   const multiPageQueueStore = useMultiPageQueueStore();
//   const { isMultiPage, pageList, currentAid } = storeToRefs(multiPageQueueStore);

//   // 分p信息
//   const currentPage = ref(1); // 选中页

//   // 当前选中分p
//   const currentPageInfo = computed((): PageInfo | null => {
//     if (!isMultiPage?.value || !pageList?.value.length || pageList.value.length === 0) return null;
//     // 页码从1开始，数组索引从0开始
//     const index = currentPage.value - 1;
//     return index >= 0 && index < pageList.value.length
//       ? pageList.value[index]
//       : null;
//   });

//   // 当前选中分p的cid
//   const currentCid = computed(() => currentPageInfo.value?.cid || null);

//   // 播放状态 - 暂时不用
//   const isPlaying = computed(() => !!currentPage.value && !!audioUrl.value);

//   // 音频 URL
//   const audioUrl = ref("");


//   // 监听 cid 变化，获取音频 URL
//   watch(() => currentCid.value,
//     async (newCid) => {
//       if (!newCid || !currentAid.value) return;
//       const url = await getAudioUrl({ avid: currentAid.value, cid: newCid });
//       audioUrl.value = url ? processResourceUrl(url) : "";
//     }
//   )

//   return {
//     currentPage,
//     currentPageInfo,
//     currentCid,
//     isPlaying,
//     audioUrl,
//     setCurrentPage,
//     getCurrentPage
//   };
// });
