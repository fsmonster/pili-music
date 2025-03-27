<template>
  <!-- 循环渲染自定义分区 -->
  <div v-if="sectionsLoaded">
    <SectionContents 
      v-for="section in filteredSections" 
      :key="section._id"
      :sectionId="section._id" 
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch, ref } from 'vue';
import { useUserStore, useSectionStore } from '@/stores';
import SectionContents from './SectionContents.vue';
import { storeToRefs } from 'pinia';

const userStore = useUserStore();

// 接收父组件传来的 categories
const props = defineProps<{
  categories: string[];
}>();

// 获取自定义分区数据
const sectionStore = useSectionStore();
const { sections } = storeToRefs(sectionStore);

const sectionsLoaded = ref(false);

const isAllSelected = computed(() => props.categories.length === 0);
const filteredSections = computed(() => sections.value.filter(section => props.categories.includes(section._id) || isAllSelected.value));

// 监听登录状态变化
watch(() => userStore.isLoggedIn, sectionStore.fetchSectionsIfNeeded);

// 组件挂载时加载分区数据
onMounted(async () => {
  await sectionStore.fetchSectionsIfNeeded();
  sectionsLoaded.value = true; // 数据加载完成
});
</script>

<style lang="scss" scoped>

</style>
