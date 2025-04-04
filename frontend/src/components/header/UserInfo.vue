<template>
  <div class="user-info">
    <el-dropdown v-if="userStore.isLoggedIn">
      <div class="user-avatar">
        <img :src="avatar + '@70w'" :alt="userStore.username" />
        <span class="username">{{ userStore.username }}</span>
      </div>

      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="handleLogout">
            <i class="ri-logout-box-line"></i>
            退出登录
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <div v-else class="user-avatar">
      <img :src="defaultAvatar" alt="默认头像" />
    </div>
    <el-button class="login-btn" type="primary" v-if="!userStore.isLoggedIn" @click="handleLogin">
      登录
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user/user';
import defaultAvatar from '@/assets/image/default_avatar.png';

// 路由
const router = useRouter();

// 用户状态
const userStore = useUserStore();

// 计算用户头像
const avatar = computed(() => userStore.avatar || 'https://i0.hdslb.com/bfs/face/member/noface.jpg');

// 处理登录
const handleLogin = () => {
  router.push('/login');
};

// 处理登出
const handleLogout = async () => {
  userStore.logout();
};
</script>

<style lang="scss" scoped>
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;

  .user-avatar {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 2px;
    border-radius: 20px;
    transition: background-color 0.3s;

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    img {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }

    .username {
      font-size: 14px;
      color: var(--el-text-color-primary);
    }
  }

  .login-btn {
    font-size: 14px;
  }
}
</style>
