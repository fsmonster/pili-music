import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import * as seriesApi from '../../api/series';
import { SeriesSortType } from '../../types';
import type { Archive, SeriesMeta } from '../../types';
import { convertArchiveToMediaItem } from '../../utils';

/**
 * 订阅系列内容状态管理
 */
export const useSeriesContentStore = defineStore('seriesContent', () => {
    // 状态
    const seriesId = ref<number | null>(null);
    const seriesMeta = ref<SeriesMeta | null>(null);
    const seriesSort = ref<SeriesSortType>(SeriesSortType.DESC);
    const seriesArchives = ref<Archive[]>([]);
    const loading = ref(false);

    // 计算属性
    const seriesMedias = computed(() => {
        return seriesArchives.value.map(archive => convertArchiveToMediaItem(archive));
    });

    /**
     * 获取系列元数据
     */
    const fetchSeriesMeta = async (seriesId: number) => {
        try {
            if (!seriesId) throw new Error("系列ID不能为空");
            seriesMeta.value = await seriesApi.getSeriesMeta(seriesId);
        } catch (err) {
            console.error("获取系列元数据失败:", err);
        }
    };

    /**
     * 获取系列所有媒体列表
     */
    const fetchSeriesArchives = async () => {     
        try {
            if (!seriesId.value) throw new Error("系列ID不能为空");
            if (!seriesMeta.value?.mid) throw new Error("系列元数据为空");
            loading.value = true;
            // 获取系列的媒体列表
            seriesArchives.value = await seriesApi.getSeriesArchives({
                mid: seriesMeta.value?.mid,
                series_id: seriesId.value,
                pn: 1,
                ps: 1000,
                sort: seriesSort.value
            });
        } catch (err) {
            console.error("获取系列内容失败:", err);
        } finally {
            loading.value = false;
        }
    };

    /**
     * @desc 排序
     * @param order 排序类型
     */
    const handleSort = (order: SeriesSortType) => {
        seriesArchives.value = [];
        seriesSort.value = order;
        fetchSeriesArchives();
    };

    /**
     * @desc 重置状态
     */
    const reset = () => {
        loading.value = false;
        seriesId.value = null;
        seriesSort.value = SeriesSortType.DESC;
        seriesMeta.value = null;
        seriesArchives.value = [];
    };

    /**
     * @desc 监听当前系列ID
     */
    // watch([seriesId, seriesSort], ([id, _sort]) => {
    //     if (id) {
    //         fetchSeriesMeta(id);
    //         fetchSeriesArchives();
    //     }
    // });

    return {
        // 状态
        loading,
        seriesId,
        seriesSort,
        seriesMeta,
        seriesArchives,
        // 计算属性
        seriesMedias,
        // 方法
        fetchSeriesMeta,
        fetchSeriesArchives,
        handleSort,
        reset
    };
});