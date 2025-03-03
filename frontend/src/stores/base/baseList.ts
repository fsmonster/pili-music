import { ref, computed } from 'vue';
import type { MediaItem } from '../../types';

/**
 * 基础列表Store
 * 提供通用的列表管理功能
 */
export function createBaseListStore() {
  // 基础状态
  const items = ref<MediaItem[]>([]);
  const loading = ref(false);
  const error = ref('');
  
  // 分页状态
  const currentPage = ref(1);
  const pageSize = ref(20);
  const total = ref(0);
  
  // 搜索和排序
  const searchKeyword = ref('');
  const sortOrder = ref<'asc' | 'desc'>('desc');
  
  // 计算属性：过滤后的列表
  const filteredItems = computed(() => {
    let result = [...items.value];
    
    // 搜索过滤
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(keyword)
      );
    }
    
    return result;
  });
  
  // 计算属性：分页后的列表
  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return filteredItems.value.slice(start, end);
  });
  
  // 设置列表数据
  function setItems(newItems: MediaItem[]) {
    items.value = newItems;
    total.value = newItems.length;
    // 重置分页
    if (currentPage.value > Math.ceil(total.value / pageSize.value)) {
      currentPage.value = 1;
    }
  }
  
  // 搜索
  function search(keyword: string) {
    searchKeyword.value = keyword;
    currentPage.value = 1; // 重置到第一页
  }
  
  // 排序
  function sort(order: 'asc' | 'desc') {
    sortOrder.value = order;
  }
  
  // 分页
  function setPage(page: number) {
    currentPage.value = page;
  }
  
  function setPageSize(size: number) {
    pageSize.value = size;
    // 调整当前页码
    const maxPage = Math.ceil(total.value / size);
    if (currentPage.value > maxPage) {
      currentPage.value = maxPage;
    }
  }
  
  // 重置状态
  function reset() {
    items.value = [];
    loading.value = false;
    error.value = '';
    currentPage.value = 1;
    searchKeyword.value = '';
    sortOrder.value = 'desc';
  }
  
  return {
    // 状态
    items,
    loading,
    error,
    currentPage,
    pageSize,
    total,
    searchKeyword,
    sortOrder,
    
    // 计算属性
    filteredItems,
    paginatedItems,
    
    // 方法
    setItems,
    search,
    sort,
    setPage,
    setPageSize,
    reset
  };
}
