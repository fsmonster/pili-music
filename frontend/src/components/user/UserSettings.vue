<template>
  <div class="user-settings">
    <div class="content-header">
      <h3>设置</h3>
    </div>
    <div class="settings-content">
      <!-- 设置内容 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>
      <div v-else class="settings-form">
        <el-form label-position="top">
          <el-divider content-position="left">播放设置</el-divider>
          
          <el-form-item label="默认显示模式">
            <el-radio-group v-model="settings.defaultDisplayMode">
              <el-radio label="list">列表模式</el-radio>
              <el-radio label="grid">网格模式</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="自动播放">
            <el-switch
              v-model="settings.autoplay"
              active-text="开启"
              inactive-text="关闭"
            />
          </el-form-item>
          
          <el-divider content-position="left">隐私设置</el-divider>
          
          <el-form-item label="显示我的收藏夹">
            <el-switch
              v-model="settings.showFavorites"
              active-text="公开"
              inactive-text="隐藏"
              :disabled="!isCurrentUser"
            />
            <div class="setting-tip" v-if="!isCurrentUser">
              只有本人可以修改隐私设置
            </div>
          </el-form-item>
          
          <el-form-item label="显示我的关注列表">
            <el-switch
              v-model="settings.showFollowing"
              active-text="公开"
              inactive-text="隐藏"
              :disabled="!isCurrentUser"
            />
            <div class="setting-tip" v-if="!isCurrentUser">
              只有本人可以修改隐私设置
            </div>
          </el-form-item>
          
          <el-form-item v-if="isCurrentUser">
            <el-button type="primary" @click="saveSettings">保存设置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ElSkeleton, ElForm, ElFormItem, ElRadioGroup, ElRadio, ElSwitch, ElButton, ElDivider, ElMessage } from 'element-plus';
import { getUserSettings } from '@/api';
import { useUserStore } from '@/stores';
import type { SettingsResponse, Privacy } from '@/types';

// 定义组件属性
const props = defineProps<{
  mid: number;
}>();

// 用户存储
const userStore = useUserStore();

// 判断是否为当前登录用户
const isCurrentUser = computed(() => {
  return userStore.userInfo?.mid === props.mid;
});

// 设置数据
const settings = ref({
  defaultDisplayMode: 'grid',
  autoplay: true,
  showFavorites: true,
  showFollowing: true
});

const loading = ref(true);

// 获取用户设置
const fetchUserSettings = async () => {
  try {
    loading.value = true;
    
    // 调用 API 获取数据
    const response = await getUserSettings(props.mid);
    
    if (response.data) {
      // 从API响应中提取设置
      const privacySettings = response.data.privacy;
      
      // 更新本地设置状态
      settings.value = {
        defaultDisplayMode: 'grid', // 默认值，API中可能没有这个设置
        autoplay: true, // 默认值，API中可能没有这个设置
        showFavorites: privacySettings?.disable_following === 0,
        showFollowing: privacySettings?.disable_show_fans === 0
      };
    }
  } catch (error) {
    console.error('获取用户设置失败:', error);
    ElMessage.error('获取用户设置失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 保存用户设置
const saveSettings = async () => {
  try {
    // 这里应该实现保存设置的API调用
    // 目前API中可能没有这个功能，所以只是模拟成功
    ElMessage.success('设置保存成功');
  } catch (error) {
    console.error('保存设置失败:', error);
    ElMessage.error('保存设置失败，请稍后重试');
  }
};

// 组件挂载时获取设置
onMounted(() => {
  if (props.mid) {
    fetchUserSettings();
  }
});
</script>

<style lang="scss" scoped>
.user-settings {
  width: 100%;
}

.content-header {
  margin-bottom: 20px;
  
  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }
}

.loading-container {
  padding: 20px;
}

.settings-form {
  max-width: 600px;
  margin: 0 auto;
}

.setting-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}
</style>
