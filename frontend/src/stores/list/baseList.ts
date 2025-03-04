import { ref, computed } from 'vue';
import type { MediaItem } from '../../types';

/**
 * @desc 媒体(歌单)列表状态管理
 */
export function createBaseListStore() {
  // 基础状态
  const items = ref<MediaItem[]>([]);
  const loading = ref(false);
  const error = ref('');
  
  // 懒加载状态
  const pageSize = ref(20); // 每次加载的数量
  const hasMore = ref(true); // 是否还有更多数据
  const currentOffset = ref(0); // 当前加载的偏移量
  
  // 计算属性：列表
  const paginatedItems = computed(() => {
    return items.value;
  });
  
  /**
   * @desc 设置列表数据（初始加载或重置时使用）
   * @param newItems 
   */
  function setItems(newItems: MediaItem[]) {
    items.value = newItems;
    currentOffset.value = newItems.length;
    hasMore.value = true; // 重置懒加载状态
  }
  
  /**
   * @desc 添加更多列表数据（懒加载时使用）
   * @param moreItems 
   */
  function appendItems(moreItems: MediaItem[]) {
    items.value = [...items.value, ...moreItems];
    currentOffset.value += moreItems.length;
    
    // 如果返回的数据少于请求的数量，说明没有更多数据了
    if (moreItems.length < pageSize.value) {
      hasMore.value = false;
    }
  }
  
  // 重置状态
  function reset() {
    items.value = [];
    loading.value = false;
    error.value = '';
    currentOffset.value = 0;
    hasMore.value = true;
  }
  
  return {
    // 状态
    items,
    loading,
    error,
    pageSize,
    hasMore,
    currentOffset,
    paginatedItems,
    
    // 方法
    setItems,
    appendItems,
    reset
  };
}
