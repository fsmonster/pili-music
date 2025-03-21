import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as seasonApi from '../../api/season';
import type { SeasonList, MediaItem, SeasonContent, Info } from '../../types';
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
    const allSeasons = ref<SeasonList[]>([]);
    const displaySeasonIds = ref<number[]>([]);
    const isLoaded = ref(false);
    const loading = ref(false);
    const error = ref('');
    
    // 存储完整的合集内容数据
    const seasonContents = ref<SeasonContent | null>(null);

    // 计算属性：当前显示的订阅合集
    const seasons = computed(() =>
        allSeasons.value.filter(s => displaySeasonIds.value.includes(s.id))
    );

    // 计算属性：当前显示的订阅合集内容
    const medias = computed((): MediaItem[] =>
        seasonContents.value?.medias || []
    );

    // 计算属性：当前显示的订阅合集信息
    const info = computed((): Info | null =>
        seasonContents.value?.info || null
    );

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
        isLoaded.value = false;
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

    // 获取订阅合集内容 - 一次性获取所有数据并全部显示
    const fetchAllSeasonContent = async (season_id: number) => {
        loading.value = true;
        error.value = '';

        try {
            // 获取所有数据
            const seasonContent: SeasonContent = await seasonApi.getSeasonDetail({
                season_id,
            });
            
            // 存储完整数据并直接全部显示
            seasonContents.value = seasonContent;
        } catch (error) {
            console.error('获取合集内容失败:', error);
        } finally {
            loading.value = false;
        }
    };

    // 重置状态
    const reset = () => {
        loading.value = false;
        error.value = '';
        seasonContents.value = null;
    };

    return {
        // 状态
        loading,
        error,
        seasons,
        allSeasons,
        displaySeasonIds,
        isLoaded,
        seasonContents,

        // 计算属性
        medias,
        info,
        
        // 方法
        fetchDisplaySeasons,
        updateSeasonSettings,
        fetchSeasons,
        fetchSeasonsIfNeeded,
        refreshSeasons,
        fetchAllSeasonContent,
        reset
    };
}, {
    persist: true
});