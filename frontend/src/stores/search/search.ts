import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { SearchResult } from '@/types';
import { VideoSearchOrder, UserSearchOrder, SearchType } from '@/types';
import { search } from '@/api/search';
import { ElMessage } from 'element-plus';

export const useSearchStore = defineStore('search', () => {
    // 搜索关键词
    const keyword = ref('');
    // 当前页码
    const currentPage = ref(1);
    // 每页显示数量
    const pageSize = ref(20);
    // 总结果数
    const totalResults = ref(0);
    // 总页数
    const totalPages = ref(0);
    // 搜索结果
    const results = ref<SearchResult[]>([]);
    // 搜索排序方式
    const searchOrder = ref<VideoSearchOrder | UserSearchOrder>(VideoSearchOrder.TotalRank);
    // 搜索类型
    const searchType = ref<SearchType>(SearchType.Video);
    // 加载状态
    const loading = ref(false);
    // 搜索锁
    const searchLock = ref(true);

    // 搜索历史
    const searchHistory = ref<string[]>([]);

    // 获取搜索结果
    const getSearchResults = async () => {
        if (!keyword.value) return;

        loading.value = true;
        try {
            const result = await search({
                keyword: keyword.value,
                search_type: searchType.value,
                page: currentPage.value,
                page_size: pageSize.value,
                order: searchOrder.value as VideoSearchOrder | UserSearchOrder
            });

            addSearchHistory(keyword.value);

            results.value = result.result;
            totalResults.value = result.numResults;
            totalPages.value = result.numPages;

            // 如果没有结果，显示提示
            if (results.value.length === 0) {
                ElMessage({
                    message: '没有找到相关结果',
                    type: 'warning'
                });
            }
        } catch (error) {
            console.error('搜索失败:', error);
        } finally {
            loading.value = false;
        }
    };

    // 添加搜索历史
    const addSearchHistory = (keyword: string) => {
        if (!keyword) return;
        // 去重
        searchHistory.value = Array.from(new Set([keyword, ...searchHistory.value]));
    };

    // 获取搜索历史
    const getSearchHistory = () => {
        return searchHistory.value;
    };

    // 删除搜索历史
    const removeSearchHistory = (keyword: string) => {
        searchHistory.value = searchHistory.value.filter(item => item !== keyword);
    };

    // 清空搜索历史
    const clearSearchHistory = () => {
        searchHistory.value = [];
    };

    return {
        keyword,
        currentPage,
        pageSize,
        totalResults,
        totalPages,
        results,
        loading,
        searchOrder,
        searchType,
        searchLock,
        getSearchResults,
        addSearchHistory,
        getSearchHistory,
        removeSearchHistory,
        clearSearchHistory
    };
}, {
    persist: true
})