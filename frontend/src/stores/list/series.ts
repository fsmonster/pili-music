import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as seriesApi from '../../api/series';
import type { SeriesMeta } from '../../types';
import { useUserStore } from '../user/user';

/**
 * 订阅系列状态管理
 */
export const useSeriesStore = defineStore('series', () => {
    // 用户状态
    const userStore = useUserStore();
    const isLoggedIn = computed(() => userStore.isLoggedIn);

    // 系列状态
    // const seriesList = ref<SeriesList[]>([]);
    const series = ref<SeriesMeta[]>([]);
    // const seriesMeta = ref<SeriesMeta | null>(null);
    const displaySeries = ref<number[]>([]);
    // 系列媒体列表
    const isLoaded = ref(false);
    const loading = ref(false);

    /**
     * 获得系列列表
     */
    const fetchSeries = async () => {
        if(!isLoggedIn.value) return;
        try {
            loading.value = true;
            const currentIds = series.value.map(s => s.series_id);
            const queryIds = displaySeries.value.filter(id => !currentIds.includes(id));
            if (queryIds.length === 0) return;

            const newSeries: SeriesMeta[] = [];

            // 获取系列列表
            for (let seriesId of queryIds) {
                    // 获取系列元数据
                    const meta = await seriesApi.getSeriesMeta(seriesId);
                    
                    // 获取系列第一个视频的封面
                    const cover = await seriesApi.getSeriesCover(seriesId, meta.mid);
                    meta.cover = cover;
                    newSeries.push(meta);
            }
            series.value = [ ...newSeries,...series.value];
        } catch (err) {
            console.error("获取系列列表失败:", err);
        } finally {
            isLoaded.value = true;
            loading.value = false;
        }
    }

    /**
     * 获得系列Meta
     */
    const fetchSeriesMeta = async (seriesId: number) => {
        try {
            // 获取系列列表
            return await seriesApi.getSeriesMeta(seriesId);
        } catch (err) {
            console.error("获取系列元数据失败:", err);
        }
    };

    /**
     * 获得显示的系列ID列表
     */
    const fetchDisplaySeries = async () => {
        if (!isLoggedIn.value) return;
        try {
            // 获取显示的系列ID列表
            displaySeries.value = await seriesApi.getDisplaySeries();
        } catch (err) {
            console.error("获取显示系列ID列表失败:", err);
        }
    };

    /**
     * 更新显示的系列ID列表
     */
    const updateDisplaySeries = async (newDisplaySeries: number[]) => {
        if (!isLoggedIn.value) return;
        try {
            displaySeries.value = await seriesApi.updateDisplaySeries(newDisplaySeries);

            // 立即同步 `series.value`，移除不在 `displaySeries` 中的系列
        series.value = series.value.filter(s => newDisplaySeries.includes(s.series_id));

            await fetchSeries(); // 这里确保数据同步更新
        } catch (err) {
            console.error("更新显示系列ID列表失败:", err);
        }
    };

    /**
     * 添加系列
     */
    const addSeries = async (seriesId: number) => {
        if (!isLoggedIn.value) return;
        if (displaySeries.value.includes(seriesId)) return; // 已存在则不添加
        const newDisplaySeries = [seriesId, ...displaySeries.value]; // 追加
        await updateDisplaySeries(newDisplaySeries);
    };

    /**
     * 删除系列
     */
    const removeSeries = async (seriesId: number) => {
        if (!isLoggedIn.value) return;
        if (!displaySeries.value.includes(seriesId)) return; // 不存在则不删除
        const newDisplaySeries = displaySeries.value.filter(id => id !== seriesId); // 过滤掉要删除的
        await updateDisplaySeries(newDisplaySeries);
    };

    /**
     * 刷新系列列表
     */
    const refreshSeries = async () => {
        isLoaded.value = false;
        await fetchDisplaySeries();
        await fetchSeries();
    };

    /**
     * 获取系列显示设置
     */
    const fetchSeriesIfNeeded = async () => {
        if (isLoggedIn.value && !isLoaded.value) {
            await fetchDisplaySeries();
            await fetchSeries();
        }
    };

    /**
     * 重置状态
     */
    const reset = () => {
        loading.value = false;
        isLoaded.value = false;
        displaySeries.value = [];
        series.value = [];
    };

    return {
        // 状态
        loading,
        series,
        displaySeries,
        isLoaded,
        // 方法
        fetchSeriesMeta,
        fetchDisplaySeries,
        addSeries,
        removeSeries,
        refreshSeries,
        fetchSeriesIfNeeded,
        reset
    };
},{
    persist: true
});