import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as seasonApi from '../../api/season';
import type { Season, MediaItem } from '../../types';
import { useUserStore } from '../user/user';
import { createBaseListStore } from './baseList';

/**
 * 订阅合集状态管理
 */
export const useSeasonStore = defineStore('season', () => {
    // 基础列表功能
    const baseList = createBaseListStore();
    
    // 合集特有状态
    const allSeasons = ref<Season[]>([]);
    const displaySeasonIds = ref<number[]>([]);
    const currentSeason = ref<Season | null>(null);
    const currentSeasonId = ref<number | null>(null);
    
    // 存储完整的合集内容数据（用于前端分页）
    const allMediaItems = ref<MediaItem[]>([]);

    const userStore = useUserStore();
    const uid = computed(() => userStore.uid);

    // 计算属性：当前显示的订阅合集
    const seasons = computed(() =>
        allSeasons.value.filter(s => displaySeasonIds.value.includes(s.id))
    );

    // 更新订阅合集显示设置
    const updateSeasonSettings = (ids: number[]) => {
        displaySeasonIds.value = ids;
    };

    // 获取订阅合集列表
    const fetchSeasons = async () => {
        if (!uid.value) {
            throw new Error('用户未登录');
        }
        baseList.loading.value = true;
        baseList.error.value = '';

        try {
            allSeasons.value = await seasonApi.getSeasonList({
                up_mid: uid.value,
                pn: 1,
                ps: 40
            });
        } catch (error) {
            baseList.error.value = '获取订阅合集列表失败';
            console.error(error);
        } finally {
            baseList.loading.value = false;
        }
    };

    // 获取订阅合集内容 - 一次性获取所有数据但只显示部分
    const fetchSeasonContent = async (season_id: number) => {
        baseList.loading.value = true;
        baseList.error.value = '';
        currentSeasonId.value = season_id;

        try {
            // 获取所有数据
            const items = await seasonApi.getSeasonDetail(season_id);
            
            // 存储完整数据
            allMediaItems.value = items;
            
            // 只显示第一批数据
            const firstBatch = items.slice(0, baseList.pageSize.value);
            baseList.setItems(firstBatch);
            
            // 设置是否有更多数据
            baseList.hasMore.value = items.length > baseList.pageSize.value;
            
            // 设置当前合集
            currentSeason.value = allSeasons.value.find(s => s.id === season_id) || null;
        } catch (error) {
            baseList.error.value = '获取合集内容失败';
            console.error(error);
        } finally {
            baseList.loading.value = false;
        }
    };

    // 加载更多内容 - 从缓存中加载，不需要请求 API
    const loadMoreSeasonContent = () => {
        if (!baseList.hasMore.value || baseList.loading.value || !currentSeasonId.value) return;
        
        baseList.loading.value = true;
        
        // 模拟异步加载，提供更好的用户体验
        setTimeout(() => {
            const nextBatch = allMediaItems.value.slice(
                baseList.currentOffset.value, 
                baseList.currentOffset.value + baseList.pageSize.value
            );
            
            // 追加数据
            baseList.appendItems(nextBatch);
            
            // 检查是否还有更多数据
            baseList.hasMore.value = baseList.currentOffset.value < allMediaItems.value.length;
            baseList.loading.value = false;
        }, 100);
    };

    // 重置状态
    const reset = () => {
        baseList.reset();
        allSeasons.value = [];
        displaySeasonIds.value = [];
        currentSeason.value = null;
        currentSeasonId.value = null;
        allMediaItems.value = [];
    };

    return {
        ...baseList, // 导出基础列表功能
        // 合集特有状态和方法
        seasons,
        allSeasons,
        displaySeasonIds,
        currentSeason,
        currentSeasonId,
        updateSeasonSettings,
        fetchSeasons,
        fetchSeasonContent,
        loadMoreSeasonContent, // 新增：加载更多合集内容
        reset
    };
}, {
    persist: true
});