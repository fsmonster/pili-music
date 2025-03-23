import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as seriesApi from '../../api/series';
import type { Archive, SeriesMeta } from '../../types';
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
    const seriesArchives = ref<Archive[]>([]);
    const isLoaded = ref(false);
    const loading = ref(false);

    /**
     * 获得系列列表
     */
    const fetchSeries = async () => {
        if(!isLoggedIn.value) return;
        try {
            loading.value = true;
            series.value = [];
            // 获取系列列表
            for (let seriesId of displaySeries.value) {
                    // 获取系列元数据
                    const meta = await seriesApi.getSeriesMeta({
                        series_id: seriesId
                    });
                    
                    // 获取系列第一个视频的封面
                    try {
                        const archivesRes = await seriesApi.getSeriesArchives({
                            series_id: seriesId,
                            mid: meta.mid,
                            pn: 1,
                            ps: 1
                        });
                    
                    // 如果有视频，使用第一个视频的封面
                    if (archivesRes && archivesRes.length > 0) {
                        meta.cover = archivesRes[0].pic || '';
                    }
                } catch (archiveErr) {
                    console.error(`获取系列 ${seriesId} 封面失败:`, archiveErr);
                }
                
                series.value.push(meta);
            }
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
            return await seriesApi.getSeriesMeta({
                series_id: seriesId
            });
        } catch (err) {
            console.error("获取系列元数据失败:", err);
        }
    };

    /**
     * 获取系列所有媒体列表
     */
    const fetchSeriesArchives = async (mid: number, seriesId: number) => {     
        if (!mid) return;
        const seriesMeta = series.value.find(series => series.series_id === seriesId);
        if (!seriesMeta) return;
        try {
            // 获取系列的媒体列表
            seriesArchives.value = await seriesApi.getSeriesArchives({
                mid,
                series_id: seriesId,
                pn: 1,
                ps: seriesMeta.total
            });
            isLoaded.value = true;
        } catch (err) {
            console.error("获取系列内容失败:", err);
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
     * 添加系列
     */
    const addSeries = async (seriesId: number) => {
        if (!isLoggedIn.value) return;
        const newDisplaySeries = [seriesId, ...displaySeries.value]; // 追加
        await updateDisplaySeries(newDisplaySeries);
    };

    /**
     * 删除系列
     */
    const removeSeries = async (seriesId: number) => {
        if (!isLoggedIn.value) return;
        const newDisplaySeries = displaySeries.value.filter(id => id !== seriesId); // 过滤掉要删除的
        await updateDisplaySeries(newDisplaySeries);
    };

    /**
     * 更新显示的系列ID列表
     */
    const updateDisplaySeries = async (newDisplaySeries: number[]) => {
        if (!isLoggedIn.value) return;
        try {
            displaySeries.value = await seriesApi.updateDisplaySeries(newDisplaySeries);
        } catch (err) {
            console.error("更新显示系列ID列表失败:", err);
        }
        await refreshSeries();
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

    const reset = () => {
        loading.value = false;
        isLoaded.value = false;
        displaySeries.value = [];
        series.value = [];
        seriesArchives.value = [];
    };

    return {
        loading,
        series,
        displaySeries,
        seriesArchives,
        isLoaded,
        fetchSeriesMeta,
        fetchSeriesArchives,
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