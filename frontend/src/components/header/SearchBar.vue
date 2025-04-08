<template>
  <div class="search-bar-container" ref="searchContainerRef">
    <div class="search-bar" @click="handleFocus" 
      @keydown.down.prevent="handleKeyDown('down')" 
      @keydown.up.prevent="handleKeyDown('up')">
      <input 
        type="text" 
        placeholder="搜索音乐" 
        v-model="keyword"
        @focus="isFocused = true"
        @blur="handleBlur"
        @keyup.enter="handleEnterKey"
        @input="handleUserInput"
        ref="searchInputRef"
      />
      <i class="ri-search-line" @click="handleSearch"></i>
    </div>
    
    <!-- 使用封装的搜索建议组件 -->
    <SearchSuggestions 
      ref="suggestionsRef"
      :keyword="keyword" 
      :is-focused="isFocused" 
      :target-element="searchContainerRef" 
      :manual-input="manualInputFlag"
      @select="handleSuggestionSelect"
      @update="handleSuggestionUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import SearchSuggestions from './SearchSuggestions.vue';
import { getBuvidFromCookie } from '@/utils/buvid';
import { authApi } from '@/api/auth';
import { useSearchStore } from '@/stores';

// 搜索 store
const searchStore = useSearchStore();

// 路由
const route = useRoute();
const router = useRouter();

// 搜索关键词
const { keyword, searchLock } = storeToRefs(searchStore);
const searchInputRef = ref<HTMLInputElement | null>(null);

// 组件状态
const isFocused = ref(false);
const searchContainerRef = ref<HTMLElement | null>(null);
const suggestionsRef = ref<any>(null); // 引用搜索建议组件
const manualInputFlag = ref(false); // 标记是否为选择建议项导致的关键词变化

// 处理搜索建议更新（只更新关键词，不触发搜索）
const handleSuggestionUpdate = (text: string) => {
  // 设置标记为true，表示这次更新是通过选择建议项
  manualInputFlag.value = true;
  keyword.value = text;
};

// 处理用户手动输入
const handleUserInput = () => {
  // 设置标记为false，表示这次更新不是通过选择建议项
  manualInputFlag.value = false;
};

// 处理搜索建议选择（更新关键词并触发搜索）
const handleSuggestionSelect = (text: string) => {
  keyword.value = text;
  handleSearch();
};

// 处理键盘上下键
const handleKeyDown = (direction: 'up' | 'down') => {
  // 如果子组件存在，调用其键盘导航方法
  if (suggestionsRef.value?.keyNavigate) {
    // 将方向转换为数字
    const value = direction === 'down' ? 1 : -1;
    // 调用子组件的键盘导航方法
    suggestionsRef.value.keyNavigate(value);
  }
};

// 处理回车键
const handleEnterKey = () => {
  // 如果子组件存在并且有确认选择方法
  if (suggestionsRef.value?.confirmCurrentSelection) {
    // 调用子组件的确认选择方法，并检查返回值
    const hasSelection = suggestionsRef.value.confirmCurrentSelection();
    
    // 如果没有选中的建议项，则直接搜索
    if (!hasSelection) {
      handleSearch();
    }
  } else {
    // 如果子组件不存在，则直接搜索
    handleSearch();
  }
};

// 处理搜索框获得焦点
const handleFocus = () => {
  searchInputRef.value?.focus();
};

// 处理搜索框失去焦点
const handleBlur = () => {
  // 延迟关闭提示框，以便可以点击提示项
  setTimeout(() => {
    isFocused.value = false;
  }, 200);
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
  isFocused.value = false;
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
  keyword.value = route.params.keyword as string;
  searchLock.value = true;
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
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


</style>
