import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { SearchResult } from '@/types';
import { VideoSearchOrder, UserSearchOrder, SearchType } from '@/types';
import { search } from '@/api/search';
import { ElMessage } from 'element-plus';

export const useSearchStore = defineStore('search', () => {
    const keyword = ref('');
    const currentPage = ref(1);
    const pageSize = ref(20);
    const totalResults = ref(0);
    const totalPages = ref(0);
    const results = ref<SearchResult[]>([]);
    const searchOrder = ref<VideoSearchOrder | UserSearchOrder>(VideoSearchOrder.TotalRank);
    const searchType = ref<SearchType>(SearchType.Video);
    const loading = ref(false);
    const searchLock = ref(true);

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
        getSearchResults
    };
})