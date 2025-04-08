<template>
  <teleport to="body">
    <div 
      v-if="visible && (showTags || suggestions.length > 0)" 
      class="search-suggestions"
      :style="positionStyle"
    >
      <!-- 未输入内容时显示搜索标签 -->
      <div v-if="showTags" class="search-tags">
        <div class="search-tags-header">
          <h4>搜索记录</h4>
          <el-link 
            type="text" 
            size="small" 
            @click="clearAllSearchHistory"
            class="clear-history-btn"
          >
            清空记录
          </el-link>
        </div>
        <div class="tags-container">
          <el-tag
            v-for="(tag, index) in searchHistory"
            :key="index"
            @click="selectTag(tag)"
            closable
            @close.stop="removeSearchHistory(tag)"
            size="small"
            class="search-tag"
            :effect="index < 5 ? 'dark' : 'plain'"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>

      <!-- 输入内容时显示搜索建议 -->
      <div v-else-if="suggestions.length > 0" class="suggestion-list">
        <ul>
          <li 
            v-for="(item, index) in suggestions" 
            :key="index"
            :class="{ active: currentIndex === index }"
            @mouseenter="currentIndex = index"
            @mousedown.prevent="updateSelectedSuggestion(item.value)"
            @click.prevent="confirmSelection()"
          >
            <span v-html="highlightText(item.value)"></span>
          </li>
        </ul>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import { throttle } from 'lodash';
import { ElTag } from 'element-plus';
import { searchSuggestion } from '@/api/search';
import { useSearchStore } from '@/stores';
import type { Tag } from '@/types';

// 组件属性
const props = withDefaults(defineProps<{
  keyword?: string;
  isFocused: boolean;
  targetElement: HTMLElement | null;
  manualInput?: boolean; // 标记是否为用户手动输入
}>(), {
  keyword: '',
  manualInput: false
});

// 高亮关键词，用于在建议中高亮匹配的部分
const highlightKeyword = ref('');

// 组件事件
const emit = defineEmits<{
  select: [value: string];
  update: [value: string];
  keyNavigate: [direction: number];
}>();

// 搜索 store
const searchStore = useSearchStore();

// 搜索建议相关状态
const suggestions = ref<Tag[]>([]);
const isLoading = ref(false);
const currentIndex = ref(-1);
const visible = computed(() => props.isFocused);
const suggestionFetched = ref(false); // 标记是否已经获取过搜索建议
const selectedValue = ref(''); // 当前选中的值

// 是否显示标签（未输入内容时）
const showTags = computed(() => {
  return (!props.keyword || props.keyword.trim().length === 0) && searchHistory.value.length > 0;
});

// 搜索历史
const searchHistory = computed(() => {
  return searchStore.getSearchHistory();
});

// 计算搜索提示框的位置样式
const positionStyle = computed(() => {
  if (!props.targetElement) return {};
  
  const rect = props.targetElement.getBoundingClientRect();
  return {
    position: 'fixed' as const,
    top: `${rect.bottom + window.scrollY + 4}px`,
    left: `${rect.left + window.scrollX}px`,
    width: `${rect.width}px`,
    maxHeight: '300px',
    zIndex: 2000
  };
});

// 获取搜索建议
const fetchSuggestions = async () => {
  if (!props.keyword) {
    suggestions.value = [];
    return;
  }
  
  const term = props.keyword.trim();
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
      suggestionFetched.value = true; // 标记已获取过搜索建议
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

// 高亮关键词匹配的部分
const highlightText = (text: string) => {
  if (!highlightKeyword.value) return text;
  
  const keyword = highlightKeyword.value.trim();
  if (!keyword) return text;
  
  // 忽略大小写进行替换
  const regex = new RegExp(keyword, 'gi');
  return text.replace(regex, match => `<span class="highlight">${match}</span>`);
};

// 更新选中的搜索建议（不触发搜索）
const updateSelectedSuggestion = (text: string) => {
  selectedValue.value = text;
  emit('update', text);
};

// 确认选择并触发搜索
const confirmSelection = throttle(() => {
  if (selectedValue.value) {
    emit('select', selectedValue.value);
  }
}, 300);

// 选择标签
const selectTag = (tag: string) => {
  selectedValue.value = tag;
  emit('update', tag);
  // 标签点击直接触发搜索
  emit('select', tag);
};

// 删除搜索历史
const removeSearchHistory = (keyword: string) => {
  searchStore.removeSearchHistory(keyword);
};

// 清空所有搜索历史
const clearAllSearchHistory = () => {
  searchStore.clearSearchHistory();
};

// 监听搜索关键词和选择建议标记的变化
watch(
  [() => props.keyword, () => props.manualInput],
  ([newValue, isFromSelection], [oldValue]) => {
    // 处理 undefined 或 null 值
    const newKeyword = newValue || '';
    const oldKeyword = oldValue || '';
    
    if (!newKeyword.trim()) {
      // 清空输入时清除建议和重置状态
      suggestions.value = [];
      suggestionFetched.value = false;
      highlightKeyword.value = '';
    } else if (newKeyword !== oldKeyword) {
      // 如果不是通过选择建议项导致的关键词变化，则获取新的搜索建议
      if (!isFromSelection) {
        console.log('关键词变化触发搜索建议:', newKeyword);
        // 更新高亮关键词
        highlightKeyword.value = newKeyword;
        fetchSuggestions();
      } else {
        console.log('选择建议项导致关键词变化，不触发新的搜索建议');
        // 选择建议项时不更新高亮关键词
      }
    }
  },
  { immediate: true }
);

// 监听焦点变化
watch(() => props.isFocused, (newValue) => {
  if (!newValue) {
    currentIndex.value = -1;
  }
});

// 监听键盘导航事件
const keyNavigate = (direction: number) => {
  if (!suggestions.value.length && !showTags.value) return;
  
  if (showTags.value) {
    // 如果显示的是标签，则在搜索历史中导航
    const historyLength = searchHistory.value.length;
    if (historyLength === 0) return;
    
    const newIndex = currentIndex.value + direction;
    if (newIndex >= -1 && newIndex < historyLength) {
      currentIndex.value = newIndex;
      
      // 如果选中了某个标签，只更新搜索框的值，不触发搜索
      if (currentIndex.value > -1) {
        selectedValue.value = searchHistory.value[currentIndex.value];
        emit('update', selectedValue.value);
      }
    }
  } else {
    // 如果显示的是搜索建议，则在建议中导航
    const newIndex = currentIndex.value + direction;
    if (newIndex >= -1 && newIndex < suggestions.value.length) {
      currentIndex.value = newIndex;
      
      // 如果选中了某个建议，只更新搜索框的值，不触发搜索
      if (currentIndex.value > -1) {
        selectedValue.value = suggestions.value[currentIndex.value].value;
        emit('update', selectedValue.value);
      }
    }
  }
};

// 确认当前选择（用于回车键）
// 返回值表示是否有选中的建议项
const confirmCurrentSelection = (): boolean => {
  console.log('当前选中索引:', currentIndex.value);  
  if (currentIndex.value > -1) {
    if (showTags.value && searchHistory.value.length > 0) {
      emit('select', searchHistory.value[currentIndex.value]);
      return true;
    } else if (suggestions.value.length > 0) {
      emit('select', suggestions.value[currentIndex.value].value);
      return true;
    }
  }
  // 没有选中任何建议项
  return false;
};

// 将键盘导航和确认选择事件暴露给父组件
defineExpose({ keyNavigate, confirmCurrentSelection });

// 组件卸载时清理
onUnmounted(() => {
  suggestions.value = [];
});


</script>

<style lang="scss" scoped>
.search-suggest.suggestion-list li:hover {
  background-color: #f5f5f5;
}

.highlight {
  color: #409eff;
  font-weight: bold;
}

.search-suggestions {
  background-color: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  padding: 8px 0;
  
  .search-tags {
    padding: 0 12px;
    
    .search-tags-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      
      h4 {
        margin: 0;
        font-size: 14px;
        color: var(--el-text-color-secondary);
        font-weight: normal;
      }
      
      .clear-history-btn {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        padding: 0;
        
        &:hover {
          color: $primary-color;
        }
      }
    }
    
    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      
      .search-tag {
        cursor: pointer;
        margin: 0;
        transition: all 0.2s;
        
        &:hover {
          transform: scale(1.05);
        }
      }
    }
  }
  
  .suggestion-list {
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
}
</style>
