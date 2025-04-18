<template>
    <div class="user-medias">
        <div class="content-header">
            <h3>投稿视频</h3>
            <div class="content-header-actions">
                <div class="sort-container">
                    <div v-for="tag in tags" 
                        :key="tag.value" 
                        class="sort-item" 
                        :class="{ active: order === tag.value }" 
                        @click="sortVideos(tag.value)"
                    >
                        <i :class="tag.icon"></i>
                        {{ tag.label }}
                    </div>
                </div>
                <div class="play-all" @click="playAllVideos">
                    <i class="ri-play-fill"></i>
                    播放全部
                </div>
            </div>
        </div>
        <div class="medias-list">
            <!-- 视频列表 -->
            <div v-if="loading && pn === 1" class="loading-container">
                <el-skeleton :rows="5" animated />
            </div>
            <div v-else-if="medias.length === 0" class="empty-container">
                <el-empty description="暂无视频" />
            </div>
            <div v-else class="video-grid">
                <div v-for="media in medias" 
                :key="media.bvid" 
                class="video-card" 
                @click="playVideo(media)">
                    <div class="video-cover">
                        <img :src="processResourceUrl(media.cover) + '@200h'" alt="视频封面" loading="lazy" />
                        <div class="video-duration">{{ formatDuration(media.duration) }}</div>
                    </div>
                    <div class="video-info">
                        <div class="video-title" :title="media.title">{{ media.title }}</div>
                        <div class="video-meta">
                            <span class="video-views"><i class="ri-eye-line"></i> {{ formatCount(media.stat?.view || 0)
                                }}</span>
                            <span class="video-date">{{ formatDate(media.pubtime) }}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 底部加载更多 -->
            <div v-if="hasMore" class="load-more">
                <div v-if="loadingMore" class="loading-more">
                    <el-skeleton :rows="1" animated />
                </div>
            </div>
            <div v-else-if="medias.length > 0" class="no-more">
                没有更多内容了
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { ElSkeleton, ElEmpty, ElMessage } from 'element-plus';
import { searchVideoByKeywords } from '@/api/user';
import { CollectionType } from '@/types';
import type { Archive, MediaItem, UPInfo } from '@/types';
import { usePlayerStore, useLazyLoadStore } from '@/stores';
import { processResourceUrl, 
    formatDuration, 
    formatCount, 
    formatDate,
    convertArchiveToMediaItem,
 } from '@/utils';

// 定义组件属性
const props = defineProps<{
    userInfo: UPInfo;
    loadMore: boolean;
}>();

const upInfo = computed(() => {
    return {
        mid: Number(props.userInfo.mid),
        name: props.userInfo.name,
        face: props.userInfo.face
    };
});

const emit = defineEmits<{
    (e: 'update:loadMore', value: boolean): void;
}>();

// 排序方式
const enum Order {
    Pubdate = 'pubdate',
    View = 'views'
}

const tags = [
    { label: '最新发布', value: Order.Pubdate, icon: 'ri-calendar-line' },
    { label: '最多播放', value: Order.View, icon: 'ri-eye-line' }
]

const playerStore = usePlayerStore();
const lazyLoadStore = useLazyLoadStore();

// 视频列表数据
const archives = ref<Archive[]>([]);
const loading = ref(true);
const loadingMore = ref(false);
const order = ref<Order>(Order.Pubdate);
const pn = ref(1);
const ps = ref(40);
const total = ref(0);

// 转换后的视频列表
const medias = computed(() => archives.value.map(convertArchiveToMediaItem));

// 是否有更多内容
const hasMore = computed(() => {
    return medias.value.length < total.value ? true : false;
});

// 获取用户投稿视频
const fetchUserVideos = async (isLoadMore = false) => {
    try {
        if (isLoadMore) {
            loadingMore.value = true;
        } else {
            loading.value = true;
            // 重置数据
            if (pn.value === 1) {
                archives.value = [];
            }
        }
        
        // 调用 API 获取数据
        const response = await searchVideoByKeywords({
            mid: upInfo.value.mid,
            keywords: '',
            orderby: order.value,
            pn: pn.value,
            ps: ps.value
        });

        if (response.data?.archives) {
            if (isLoadMore) {
                // 追加数据
                archives.value = [...archives.value, ...response.data.archives];
            } else {
                archives.value = response.data.archives;
            }
            total.value = response.data.page.total;
        }
    } catch (error) {
        console.error('获取用户视频失败:', error);
        ElMessage.error('获取视频列表失败，请稍后重试');
        if (!isLoadMore) {
            archives.value = [];
        }
    } finally {
        loading.value = false;
        loadingMore.value = false;
    }
};

// 加载更多
const loadMore = async () => {
    if (loadingMore.value || !hasMore.value) return;
    
    pn.value += 1;
    await fetchUserVideos(true);
};

/**
 * @desc 构建播放选项
 */
function buildPlayOptionsPartial() {
  const id = upInfo.value.mid;
  const title = upInfo.value.name;
  const cover = upInfo.value.face;

  return {
    collection: {
      type: CollectionType.UP,
      id,
      name: title,
      cover
    },
    lazyParams: {
      type: CollectionType.UP,
      id,
      pn: 1
    }
  };
}

// 播放全部
const playAllVideos = () => {
    playerStore.playMedia({
      queue: medias.value,
      total: total.value,
      ...buildPlayOptionsPartial()
    });
};

// 播放单曲
const playVideo = (item: MediaItem) => {
    playerStore.playMedia({
      queue: medias.value,
      total: total.value,
      currentTrack: item,
      ...buildPlayOptionsPartial()
    });
};

const sortVideos = (newOrder: Order) => {
    if (order.value === newOrder) return;
    
    order.value = newOrder;
    pn.value = 1; // 重置页码
    fetchUserVideos();
};

// 触发加载更多
watch(() => props.loadMore, () => {
    if (props.loadMore) {
        loadMore();
        emit('update:loadMore', false);
    }
});

// 监听UP主ID变化
watch(() => upInfo.value, () => {
    if (upInfo.value) {
        fetchUserVideos();
    }
});

// 组件挂载时获取视频
onMounted(() => {
    if (upInfo.value.mid) {
        fetchUserVideos();
    }
});

onUnmounted(() => {
   lazyLoadStore.set({ type: CollectionType.UP, id: upInfo.value.mid});
});
</script>

<style lang="scss" scoped>
.user-medias {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.content-header {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .content-header-actions {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: $font-size-sm;

        .sort-container {
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            .sort-item {
                display: flex;
                align-items: center;
                gap: 4px;
                cursor: pointer;
                padding: 4px 8px;
                border-radius: 4px;
                background-color: $background-color;
            }
            .active {
                color: $dark-text-color;
                background-color: $primary-color;
            }
        }

        .play-all {
            cursor: pointer;
            color: $text-color;
            padding: 4px 8px;
            border-radius: 4px;
            border: 1px solid $border-color;
            &:hover {
                background-color: $background-color;
            }
        }
    }

    h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
    }
}

.medias-list {
    flex: 1;
    overflow-y: auto;
    padding-right: 10px;
}

.loading-container,
.empty-container {
    padding: 20px;
}

.video-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
    padding: 10px;
}

.video-card {
    cursor: pointer;
    transition: transform 0.2s;

    &:hover {
        transform: translateY(-5px);
    }
}

.video-cover {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    aspect-ratio: 16 / 9;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .video-duration {
        position: absolute;
        bottom: 8px;
        right: 8px;
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 12px;
    }
}

.video-info {
    padding: 8px 0;
}

.video-title {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 6px;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
}

.video-meta {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--el-text-color-secondary);

    .video-views {
        display: flex;
        align-items: center;

        i {
            margin-right: 4px;
        }
    }
}

.load-more {
    margin: 20px 0;
    text-align: center;
    
    .loading-more {
        padding: 0 20%;
    }
}

.no-more {
    margin: 20px 0;
    text-align: center;
    color: var(--el-text-color-secondary);
    font-size: 14px;
}
</style>