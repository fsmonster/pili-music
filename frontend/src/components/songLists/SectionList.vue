<template>
  <!-- 循环渲染自定义分区 -->
  <div v-if="sections.length > 0">
    <SectionContents 
      v-for="section in sections" 
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
