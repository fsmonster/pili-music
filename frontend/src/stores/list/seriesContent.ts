import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import * as seriesApi from '../../api/series';
import { SeriesSortType } from '../../types';
import type { Archive } from '../../types';
import { convertArchiveToMediaItem } from '../../utils';

/**
 * 订阅系列内容状态管理
 */
export const useSeriesContentStore = defineStore('seriesContent', () => {
    // 状态
    const seriesArchives = ref<Archive[]>([]);
    const loading = ref(false);

    // 计算属性
    const medias = computed(() => {
        return seriesArchives.value.map(archive => convertArchiveToMediaItem(archive));
    });

    /**
     * 获取系列所有媒体列表
     */
    const fetchSeriesArchives = async (seriesId: number, mid?: number, sort?: SeriesSortType) => {     
        if (!mid){
            mid = (await seriesApi.getSeriesMeta(seriesId)).mid;
        }
        loading.value = true;
        try {
            // 获取系列的媒体列表
            seriesArchives.value = await seriesApi.getSeriesArchives({
                mid,
                series_id: seriesId,
                pn: 1,
                ps: 1000,
                sort
            });
        } catch (err) {
            console.error("获取系列内容失败:", err);
        } finally {
            loading.value = false;
        }
    };

    /**
     * @desc 重置状态
     */
    const reset = () => {
        loading.value = false;
        seriesArchives.value = [];
    };

    return {
        // 状态
        loading,
        seriesArchives,
        // 计算属性
        medias,
        // 方法
        fetchSeriesArchives,
        reset
    };
});