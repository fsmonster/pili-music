import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as seasonApi from '../api/season';
import type { Season } from '../types/types';
import { useUserStore } from './user';
import { createBaseListStore } from './base/baseList';

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
        try {
            baseList.loading.value = true;
            baseList.error.value = '';
            
            const res = await seasonApi.getSeasonList({
                up_mid: uid.value ?? undefined,
                pn: 1,
                ps: 40
            });

            allSeasons.value = res.data.list || [];
            
        } catch (err: any) {
            baseList.error.value = err.message || '获取订阅合集列表失败';
            console.error('获取订阅合集列表失败:', err);
        } finally {
            baseList.loading.value = false;
        }
    };

    // 获取订阅合集内容
    const fetchSeasonContent = async (season_id: string, pn?: number, ps?: number) => {
        try {
            baseList.loading.value = true;
            baseList.error.value = '';
            
            const res = await seasonApi.getSeasonDetail(season_id, pn, ps);
            console.log(`😀 res:`, res);            
            const items = res.data.medias || [];
            console.log(`😀 items:`, items);
            
            
            // 设置当前合集
            currentSeason.value = allSeasons.value.find(s => s.id.toString() === season_id) || null;
            
            // 更新列表数据
            baseList.setItems(items);
            
        } catch (err: any) {
            baseList.error.value = err.message || '获取订阅合集内容失败';
            console.error('获取订阅合集内容失败:', err);
        } finally {
            baseList.loading.value = false;
        }
    };

    // 重置状态
    const reset = () => {
        baseList.reset();
        allSeasons.value = [];
        displaySeasonIds.value = [];
        currentSeason.value = null;
    };

    return {
        ...baseList, // 导出基础列表功能
        
        // 合集特有状态和方法
        seasons,
        allSeasons,
        displaySeasonIds,
        currentSeason,
        updateSeasonSettings,
        fetchSeasons,
        fetchSeasonContent,
        reset
    };
}, {
    persist: true
});