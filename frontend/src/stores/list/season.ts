import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as seasonApi from '../../api/season';
import type { SeasonList, MediaItem } from '../../types';
import { useUserStore } from '../user/user';

/**
 * 订阅合集状态管理
 */
export const useSeasonStore = defineStore('season', () => {
    // 用户状态
    const userStore = useUserStore();
    const mid = computed(() => userStore.mid);
    const isLoggedIn = computed(() => userStore.isLoggedIn);
    
    // 基础状态
    const items = ref<MediaItem[]>([]);
    const loading = ref(false);
    const error = ref('');
    
    // 懒加载状态
    const pageSize = ref(20); // 每次加载的数量
    const hasMore = ref(true); // 是否还有更多数据
    const currentOffset = ref(0); // 当前加载的偏移量，合集特有
    
    // 合集特有状态
    const allSeasons = ref<SeasonList[]>([]);
    const displaySeasonIds = ref<number[]>([]);
    const currentSeason = ref<SeasonList | null>(null);
    const currentSeasonId = ref<number | null>(null);
    const isLoaded = ref(false);
    
    // 存储完整的合集内容数据（用于前端分页）
    const allMediaItems = ref<MediaItem[]>([]);

    // 计算属性：当前显示的订阅合集
    const seasons = computed(() =>
        allSeasons.value.filter(s => displaySeasonIds.value.includes(s.id))
    );
    
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

    // 获取订阅合集显示设置
    const fetchDisplaySeasons = async () => {
        displaySeasonIds.value = await seasonApi.getDisplaySeasons();
    };

    // 更新订阅合集显示设置
    const updateSeasonSettings = async (ids: number[]) => {
        displaySeasonIds.value = ids;
        await seasonApi.updateDisplaySeasons(ids);
    };

    // 获取订阅合集列表
    const fetchSeasons = async () => {
        loading.value = true;
        error.value = '';
        isLoaded.value = false;

        try {
            allSeasons.value = await seasonApi.getSeasonList({
                up_mid: mid.value!,
                pn: 1,
                ps: 40,
                platform: 'web',
            });
        } catch (error) {
            console.error(error);
        } finally {
            loading.value = false;
            isLoaded.value = true;
        }
    };

    // 刷新订阅合集
    const refreshSeasons = async () => {
        await fetchDisplaySeasons();
        await fetchSeasons();
    };


    // 获取订阅合集相关内容（如果未加载）
    const fetchSeasonsIfNeeded = async () => {
        if (isLoggedIn.value && !isLoaded.value && mid.value) {
            await fetchDisplaySeasons();
            await fetchSeasons();
        }
    };

    // 获取订阅合集内容 - 一次性获取所有数据但只显示部分
    const fetchSeasonContent = async (season_id: number) => {
        loading.value = true;
        error.value = '';
        currentSeasonId.value = season_id;

        try {
            // 获取所有数据
            const items: MediaItem[] = await seasonApi.getSeasonDetail({
                season_id,
            });
            
            // 存储完整数据
            allMediaItems.value = items;
            
            // 只显示第一批数据
            const firstBatch = items.slice(0, pageSize.value);
            setItems(firstBatch);
            
            // 设置是否有更多数据
            hasMore.value = items.length > pageSize.value;
            
            // 设置当前合集
            currentSeason.value = allSeasons.value.find(s => s.id === season_id) || null;
        } catch (error) {
            console.error('获取合集内容失败:', error);
        } finally {
            loading.value = false;
        }
    };

    // 加载更多内容 - 从缓存中加载，不需要请求 API
    const loadMoreSeasonContent = async () => {
        if (!hasMore.value || loading.value) return;
        
        loading.value = true;
        
        try {
            // 从缓存中加载下一批数据
            const nextBatch = allMediaItems.value.slice(
                currentOffset.value,
                currentOffset.value + pageSize.value
            );
            
            // 添加到显示列表
            appendItems(nextBatch);
        } catch (error) {
            console.error('加载更多内容失败:', error);
        } finally {
            loading.value = false;
        }
    };

    // 重置状态
    const reset = () => {
        items.value = [];
        loading.value = false;
        error.value = '';
        currentOffset.value = 0;
        hasMore.value = true;
        allMediaItems.value = [];
        currentSeason.value = null;
        currentSeasonId.value = null;
    };

    return {
        // 状态
        items,
        loading,
        error,
        pageSize,
        hasMore,
        currentOffset,
        
        // 合集特有状态
        seasons,
        allSeasons,
        displaySeasonIds,
        currentSeason,
        currentSeasonId,
        isLoaded,
        allMediaItems,
        
        // 方法
        setItems,
        appendItems,
        fetchDisplaySeasons,
        updateSeasonSettings,
        fetchSeasons,
        fetchSeasonsIfNeeded,
        refreshSeasons,
        fetchSeasonContent,
        loadMoreSeasonContent,
        reset
    };
}, {
    persist: true
});