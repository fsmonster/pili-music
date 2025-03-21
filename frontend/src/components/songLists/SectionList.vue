<template>
  <!-- 循环渲染自定义分区 -->
  <div v-if="filteredSections.length > 0">
    <SectionContents 
      v-for="section in filteredSections" 
      :key="section._id" 
      :sectionId="section._id" 
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useSectionStore } from '@/stores/list/section';
import { storeToRefs } from 'pinia';
import SectionContents from './SectionContents.vue';

import { computed } from 'vue';

const isAllSelected = computed(() => props.categories.length === 0);
const filteredSections = computed(() => sections.value.filter(section => props.categories.includes(section._id) || isAllSelected.value));

// 接收父组件传来的 categories
const props = defineProps<{
  categories: string[];
}>();

// 获取自定义分区数据
const sectionStore = useSectionStore();
const { sections } = storeToRefs(sectionStore);

// 组件挂载时加载分区数据
onMounted(async () => {
  await sectionStore.fetchSectionsIfNeeded();
});
</script>

<style lang="scss" scoped>

</style>
