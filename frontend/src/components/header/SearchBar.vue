<template>
  <div class="search-bar-container">
    <div class="search-bar" @click="handleFocus" @keydown.down.prevent="navigateSuggestion(1)" @keydown.up.prevent="navigateSuggestion(-1)">
      <input 
        type="text" 
        placeholder="搜索音乐" 
        v-model="keyword"
        @focus="isFocused = true"
        @blur="handleBlur"
        @keyup.enter="handleSearch"
        ref="searchInputRef"
      />
      <i class="ri-search-line" @click="handleSearch"></i>
    </div>
    
    <!-- 搜索提示框 -->
    <teleport to="body">
      <div 
        v-if="showSuggestions && suggestions.length > 0" 
        class="search-suggestions"
        :style="suggestionStyle"
      >
        <ul>
          <li 
            v-for="(item, index) in suggestions" 
            :key="index"
            :class="{ active: currentIndex === index }"
            @mouseenter="currentIndex = index"
            @mousedown.prevent="selectSuggestion(item.value)"
          >
            <span v-html="highlightKeyword(item.value)"></span>
          </li>
        </ul>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { throttle } from 'lodash';
import { storeToRefs } from 'pinia';
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { searchSuggestion } from '@/api/search';
import { getBuvidFromCookie } from '@/utils/buvid';
import { authApi } from '@/api/auth';
import type { Tag } from '@/types';
import { useSearchStore } from '@/stores';

// 搜索 store
const searchStore = useSearchStore();

// 路由
const route = useRoute();
const router = useRouter();

// 搜索关键词
const { keyword, searchLock } = storeToRefs(searchStore);
const searchInputRef = ref<HTMLInputElement | null>(null);

// 搜索提示相关状态
const suggestions = ref<Tag[]>([]);
const isFocused = ref(false);
const isLoading = ref(false);
const currentIndex = ref(-1);
const searchBarRect = ref<DOMRect | null>(null);

// 计算搜索提示框的位置样式
const suggestionStyle = computed(() => {
  if (!searchBarRect.value) return {};
  
  const rect = searchBarRect.value;
  return {
    position: 'fixed' as const,
    top: `${rect.bottom + window.scrollY + 4}px`,
    left: `${rect.left + window.scrollX}px`,
    width: `${rect.width}px`,
    maxHeight: '300px',
    zIndex: 2000
  };
});

// 是否显示搜索提示
const showSuggestions = computed(() => {
  return isFocused.value && keyword.value.trim().length > 0 && !isLoading.value;
});

// 获取搜索建议
const fetchSuggestions = async () => {
  const term = keyword.value.trim();
  if (!term) {
    suggestions.value = [];
    return;
  }
  
  try {
    isLoading.value = true;
    const result = await searchSuggestion(term);
    if (result && result.result && result.result.tag) {
      suggestions.value = result.result.tag;
      currentIndex.value = -1; // 重置选中索引
    } else {
      suggestions.value = [];
    }
  } catch (error) {
    console.error('获取搜索建议失败:', error);
    suggestions.value = [];
  } finally {
    isLoading.value = false;
  }
};

// 高亮关键词
const highlightKeyword = (text: string) => {
  if (!keyword.value.trim()) return text;
  const regex = new RegExp(`(${keyword.value.trim()})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
};

// 选择搜索建议 - 带节流
const selectSuggestion = throttle((text: string) => {
  keyword.value = text;
  handleSearch();
}, 300);

// 键盘导航搜索建议
const navigateSuggestion = (direction: number) => {
  if (!suggestions.value.length) return;
  
  const newIndex = currentIndex.value + direction;
  if (newIndex >= -1 && newIndex < suggestions.value.length) {
    currentIndex.value = newIndex;
    
    // 如果选中了某个建议，更新搜索框的值
    if (currentIndex.value > -1) {
      keyword.value = suggestions.value[currentIndex.value].value;
    }
  }
};

// 处理搜索框获得焦点
const handleFocus = () => {
  searchInputRef.value?.focus();
  updateSearchBarRect();
};

// 处理搜索框失去焦点
const handleBlur = () => {
  // 延迟关闭提示框，以便可以点击提示项
  setTimeout(() => {
    isFocused.value = false;
  }, 200);
};

// 更新搜索框位置信息
const updateSearchBarRect = () => {
  if (searchInputRef.value) {
    const parentEl = searchInputRef.value.closest('.search-bar-container');
    if (parentEl) {
      searchBarRect.value = parentEl.getBoundingClientRect();
    }
  }
};

// 处理搜索
const handleSearch = async () => {
  if (!keyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词');
    return;
  }

  // 确保 buvid 已经存在
  const buvid = getBuvidFromCookie();
  if (!buvid || (!buvid.b_3 && !buvid.b_4)) {
    try {
      // 如果 cookie 中没有 buvid，尝试获取并设置
      await authApi.getBuvid();
    } catch (error) {
      console.error('获取 buvid 失败:', error);
      ElMessage.error('搜索初始化失败，请稍后再试');
      return;
    }
  }

  // 跳转到搜索结果页面
  router.push(`/search/${keyword.value}`);
  
  // 设置搜索锁
  searchLock.value = false;

  // 清空搜索提示
  suggestions.value = [];
  isFocused.value = false;
};

// 监听搜索关键词变化
watch(() => keyword.value, (newValue) => {
  if (!newValue.trim()) {
    suggestions.value = [];
  }
  fetchSuggestions();
});

// 监听窗口大小变化
const handleResize = () => {
  updateSearchBarRect();
};

// 点击外部关闭搜索提示
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  const searchBarContainer = document.querySelector('.search-bar-container');
  const suggestionsEl = document.querySelector('.search-suggestions');
  
  if ((searchBarContainer && !searchBarContainer.contains(target)) && 
      (suggestionsEl && !suggestionsEl.contains(target))) {
    isFocused.value = false;
  }
};

// 组件挂载和卸载时的事件监听
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('resize', handleResize);
  updateSearchBarRect();
  keyword.value = route.params.keyword as string;
  searchLock.value = true;
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('resize', handleResize);
});
</script>

<style lang="scss" scoped>
.search-bar-container {
  position: relative;
  max-width: 300px;
  
  .search-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: var(--el-fill-color-blank);
    border: 1px solid var(--el-border-color);
    border-radius: 8px;
    padding: 8px 16px;
    width: 100%;
    transition: all 0.3s;

    &:focus-within {
      border-color: var(--el-color-primary);
      box-shadow: 0 0 0 2px var(--el-color-primary-light-8);
    }

    i {
      color: var(--el-text-color-secondary);
      font-size: 18px;
      cursor: pointer;
      
      &:hover {
        color: var(--el-color-primary);
      }
    }

    input {
      border: none;
      outline: none;
      background: none;
      font-size: 14px;
      width: 100%;
      color: var(--el-text-color-primary);

      &::placeholder {
        color: var(--el-text-color-placeholder);
      }
    }
  }
}

.search-suggestions {
  background-color: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    
    li {
      padding: 8px 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      transition: background-color 0.2s;
      
      &:hover, &.active {
        background-color: var(--el-fill-color-light);
      }
      
      :deep(.highlight) {
        color: $secondary-color;
      }
    }
  }
}
</style>
