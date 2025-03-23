<template>
  <div class="category-tabs">
    <div class="tabs-container">
      <!-- 全部标签 -->
      <div 
        class="tab-item" 
        :class="{ active: isAllSelected }"
        @click="selectAll"
      >
        全部
      </div>
      
      <!-- 自定义分区标签 -->
      <div 
        v-for="section in sections" 
        :key="section._id"
        class="tab-item"
        :class="{ active: selectedCategories.includes(section._id) }"
        @click="toggleCategory(section._id)"
      >
        <i class="ri-folder-line"></i> {{ section.name }}
      </div>
      
      <!-- 收藏标签 -->
      <div 
        class="tab-item" 
        :class="{ active: selectedCategories.includes('favorite') }"
        @click="toggleCategory('favorite')"
      >
        <i class="ri-star-line"></i> 收藏
      </div>
      
      <!-- 合集标签 -->
      <div 
        class="tab-item" 
        :class="{ active: selectedCategories.includes('season') }"
        @click="toggleCategory('season')"
      >
        <i class="ri-stack-line"></i> 合集
      </div>

      <!-- 系列标签 -->
      <div 
        class="tab-item" 
        :class="{ active: selectedCategories.includes('series') }"
        @click="toggleCategory('series')"
      >
        <i class="ri-list-check-2"></i> 系列
      </div>
      
      <!-- 添加分区 -->
      <div class="tab-item add-tab" @click="handleAddSection">
        <i class="ri-add-line"></i> 添加
      </div>
      
      <!-- 设置按钮 -->
      <div class="action-button settings-button" @click="handleSettings">
        <i class="ri-settings-line"></i> 设置
      </div>
    </div>
    
    <!-- 分区设置对话框 -->
    <el-dialog
      v-model="showSettingsDialog"
      title="分区设置"
      width="50%"
      :close-on-click-modal="false"
    >
      <el-table :data="sections" style="width: 100%">
        <el-table-column prop="name" label="名称" width="180"></el-table-column>
        <el-table-column prop="description" label="描述"></el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button 
              type="danger" 
              size="small" 
              @click="confirmDeleteSection(scope.row)"
              :disabled="deleting"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    
    <!-- 添加分区对话框 -->
    <el-dialog
      v-model="showAddDialog"
      title="添加分区"
      width="30%"
      :close-on-click-modal="false"
    >
      <el-form :model="newSection" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="newSection.name" placeholder="请输入分区名称"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input 
            v-model="newSection.description" 
            type="textarea" 
            placeholder="请输入分区描述"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="createSection" :loading="creating">
            创建
          </el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    
    <!-- 确认删除对话框 -->
    <el-dialog
      v-model="showConfirmDialog"
      title="确认删除"
      width="30%"
      :close-on-click-modal="false"
    >
      <p>确定要删除分区 "{{ sectionToDelete?.name }}" 吗？此操作不可恢复。</p>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showConfirmDialog = false">取消</el-button>
          <el-button type="danger" @click="deleteSection" :loading="deleting">
            确认删除
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useSectionStore } from '@/stores/list/section';
import { storeToRefs } from 'pinia';
import { ElMessage } from 'element-plus';
import type { Section } from '@/types';

// 获取自定义分区数据
const sectionStore = useSectionStore();
const { sections } = storeToRefs(sectionStore);

// 已选中的分类
const selectedCategories = ref<string[]>([]);

// 是否选中了"全部"
const isAllSelected = computed(() => selectedCategories.value.length === 0);

// 对话框状态
const showAddDialog = ref(false);
const showSettingsDialog = ref(false);
const showConfirmDialog = ref(false);
const creating = ref(false);
const deleting = ref(false);

// 新分区表单
const newSection = ref({
  name: '',
  description: ''
});

// 要删除的分区
const sectionToDelete = ref<Section | null>(null);

// 选择全部（清空其他选择）
function selectAll() {
  selectedCategories.value = [];
  emitChange();
}

// 切换分类选择状态
function toggleCategory(category: string) {
  const index = selectedCategories.value.indexOf(category);
  
  if (index === -1) {
    // 添加分类
    selectedCategories.value.push(category);
  } else {
    // 移除分类
    selectedCategories.value.splice(index, 1);
  }
  
  emitChange();
}

// 处理添加分区
function handleAddSection() {
  // 重置表单
  newSection.value = {
    name: '',
    description: ''
  };
  showAddDialog.value = true;
}

// 处理设置按钮点击
function handleSettings() {
  showSettingsDialog.value = true;
}

// 创建新分区
async function createSection() {
  if (!newSection.value.name.trim()) {
    ElMessage.warning('分区名称不能为空');
    return;
  }
  
  creating.value = true;
  
  try {
    await sectionStore.createSection(
      newSection.value.name,
      newSection.value.description
    );
    
    ElMessage.success('创建分区成功');
    
    // 重置表单
    newSection.value = {
      name: '',
      description: ''
    };
    
    // 关闭对话框
    showAddDialog.value = false;
  } catch (error) {
    console.error('创建分区失败:', error);
    ElMessage.error('创建分区失败');
  } finally {
    creating.value = false;
  }
}

// 确认删除分区
function confirmDeleteSection(section: Section) {
  sectionToDelete.value = section;
  showConfirmDialog.value = true;
}

// 删除分区
async function deleteSection() {
  if (!sectionToDelete.value) return;
  
  deleting.value = true;
  
  try {
    await sectionStore.deleteSection(sectionToDelete.value._id);
    
    // 如果删除的分区在选中列表中，移除它
    const index = selectedCategories.value.indexOf(sectionToDelete.value._id);
    if (index !== -1) {
      selectedCategories.value.splice(index, 1);
      emitChange();
    }
    
    ElMessage.success('删除分区成功');
    showConfirmDialog.value = false;
  } catch (error) {
    console.error('删除分区失败:', error);
    ElMessage.error('删除分区失败');
  } finally {
    deleting.value = false;
  }
}

// 定义事件
const emit = defineEmits<{
  (e: 'change', categories: string[]): void
}>();

// 发送变更事件
function emitChange() {
  emit('change', selectedCategories.value);
}

// 监听分区变化，更新选中状态
watch(sections, () => {
  // 移除不存在的分区ID
  selectedCategories.value = selectedCategories.value.filter(id => {
    // 如果是内置分类，保留
    if (id === 'favorite' || id === 'season') return true;
    
    // 如果是自定义分区，检查是否存在
    return sections.value.some(section => section._id === id);
  });
  
  // 发送变更事件
  emitChange();
}, { deep: true });

// 初始化
onMounted(async () => {
  // 获取分区列表
  // if (sections.value.length === 0) {
  //   await sectionStore.fetchSections();
  // }
});
</script>

<style lang="scss" scoped>
.category-tabs {
  width: 100%;
  margin-bottom: 20px;
}

.tabs-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 10px 0;
}

.tab-item {
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 14px;
  cursor: pointer;
  background-color: var(--el-fill-color-light);
  color: var(--el-text-color-regular);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  
  i {
    font-size: 16px;
  }
  
  &:hover {
    background-color: var(--el-fill-color-darker);
  }

  &.active {
    background-color: var(--el-color-primary);
    color: white;
  }
}

.add-tab {
  background-color: var(--el-color-success-light-9);
  color: var(--el-color-success);
  
  &:hover {
    background-color: var(--el-color-success-light-8);
  }
}

.action-button {
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
  margin-left: auto;
  
  i {
    font-size: 16px;
  }
  
  &:hover {
    opacity: 0.8;
  }
}

.settings-button {
  background-color: var(--el-color-info);
  color: white;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>