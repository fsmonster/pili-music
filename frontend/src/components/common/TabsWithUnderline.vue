<template>
  <div class="content-tabs" ref="tabsContainer">
    <div
      v-for="tab in tabs"
      :key="tab.value"
      class="tab-item"
      :class="{ active: activeTab === tab.value }"
      @click="activeTab = tab.value"
      :ref="el => setTabRef(tab.value, el as HTMLElement)"
    >
      <i :class="tab.icon"></i> {{ tab.label }}
    </div>
    <div class="tab-underline" :style="underlineStyle"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick, computed } from 'vue';

// 定义标签类型
interface Tab {
    label: string;
    value: string;
    icon?: string;
}

defineProps<{
  tabs: Tab[];
  fontSize?: string;
}>();

const activeTab = defineModel('activeTab', {
  type: String,
  required: true
});

const tabsContainer = ref<HTMLElement | null>(null);
const tabRefs = ref<Record<string, HTMLElement | null>>({});

function setTabRef(id: string, el: HTMLElement | null) {
  if (el) {
    tabRefs.value[id] = el;
  }
}

const underline = ref({
  left: 0,
  width: 0
});

const underlineStyle = computed(() => ({
  transform: `translateX(${underline.value.left}px)`,
  width: `${underline.value.width}px`
}));

function updateUnderline() {
  const el = tabRefs.value[activeTab.value];
  if (el && tabsContainer.value) {
    const containerRect = tabsContainer.value.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const left = elRect.left - containerRect.left;
    const width = elRect.width;

    const prevLeft = underline.value.left;
    const prevWidth = underline.value.width;

    // 方向判断
    if (left > prevLeft) {
      // 右移：先拉长再缩小
      underline.value = { left: prevLeft, width: left + width - prevLeft };
      setTimeout(() => {
        underline.value = { left, width };
      }, 100);
    } else {
      // 左移：先左移再缩小
      underline.value = { left, width: prevLeft + prevWidth - left };
      setTimeout(() => {
        underline.value = { left, width };
      }, 100);
    }
  }
}

watch(() => activeTab.value, () => {
  nextTick(updateUnderline);
});

onMounted(() => {
  nextTick(updateUnderline);
});
</script>

<style lang="scss" scoped>
.content-tabs {
  position: relative;
  display: flex;

  .tab-item {
    padding: 2px 6px;
    margin: 8px 18px;
    cursor: pointer;
    position: relative;
    font-size: 16px;
    font-size: v-bind(fontSize);
    transition: color 0.2s;

    &.active {
      color: $primary-color;
    }
  }

  .tab-underline {
    position: absolute;
    bottom: 0;
    height: 3px;
    border-radius: 1px;
    background-color: $primary-secondary-color;
    transition: all 0.3s ease;
  }
}
</style>
