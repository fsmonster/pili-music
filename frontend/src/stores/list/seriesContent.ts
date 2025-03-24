import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as seriesApi from '../../api/series';
import type { Archive } from '../../types';

/**
 * 订阅系列内容状态管理
 */
export const useSeriesContentStore = defineStore('seriesContent', () => {
    // 状态
    const seriesArchives = ref<Archive[]>([]);
    const loading = ref(false);

    /**
     * 获取系列所有媒体列表
     */
    const fetchSeriesArchives = async (mid: number, seriesId: number) => {     
        if (!mid) return;
        loading.value = true;
        try {
            // 获取系列的媒体列表
            seriesArchives.value = await seriesApi.getSeriesArchives({
                mid,
                series_id: seriesId,
                pn: 1,
                ps: 1000
            });
        } catch (err) {
            console.error("获取系列内容失败:", err);
        } finally {
            loading.value = false;
        }
    };

    return {
        // 状态
        loading,
        seriesArchives,
        // 方法
        fetchSeriesArchives
    };
});