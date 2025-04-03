<template>
  <div class="header">
    <div class="header-left">
      <div class="logo">
        <i class="ri-bilibili-fill"></i>
        <span>哔哩音乐 (｡･∀･)ﾉﾞ</span>
      </div>
    </div>
    <div class="header-right">
      <div class="search-bar">
        <i class="ri-search-line"></i>
        <input type="text" placeholder="搜索音乐" v-model="searchKeyword" @keyup.enter="handleSearch" />
      </div>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user/user';
import { ElMessage } from 'element-plus';
import { authApi } from '../api/auth';
import { getBuvidFromCookie } from '../utils/buvid';
import defaultAvatar from '@/assets/image/default_avatar.png';

const router = useRouter();
const userStore = useUserStore();
const avatar = computed(() => userStore.avatar || 'https://i0.hdslb.com/bfs/face/member/noface.jpg');
const searchKeyword = ref('');

const handleLogin = () => {
  router.push('/login');
};

const handleLogout = async () => {
  userStore.logout();
};

const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词');
    return;
  }

  // 确保 buvid 已经存在
  const buvid = getBuvidFromCookie();
  if (!buvid || (!buvid.b_3 && !buvid.b_4)) {
    try {
      // 如果 cookie 中没有 buvid，尝试获取并设置
      await authApi.getBuvid();
    } catch (error) {
      console.error('获取 buvid 失败:', error);
      ElMessage.error('搜索初始化失败，请稍后再试');
      return;
    }
  }

  // 跳转到搜索结果页面
  router.push({
    name: 'search',
    query: {
      keyword: searchKeyword.value.trim()
    }
  });
};
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: var(--el-bg-color-overlay);
  border-bottom: 1px solid var(--el-border-color-light);

  .header-left {
    display: flex;
    align-items: center;
    gap: 20px;

    .logo {
      display: flex;
      align-items: center;
      gap: 10px;

      i {
        font-size: 32px;
        color: var(--el-color-primary);
      }

      span {
        font-size: 18px;
        font-weight: bold;
        line-height: 1.2;
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;

    .search-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      background-color: var(--el-fill-color-blank);
      border: 1px solid var(--el-border-color);
      border-radius: 8px;
      padding: 8px 16px;
      width: 300px;
      transition: all 0.3s;

      &:focus-within {
        border-color: var(--el-color-primary);
        box-shadow: 0 0 0 2px var(--el-color-primary-light-8);
      }

      i {
        color: var(--el-text-color-secondary);
        font-size: 18px;
      }

      input {
        border: none;
        outline: none;
        background: none;
        font-size: 14px;
        width: 100%;
        color: var(--el-text-color-primary);

        &::placeholder {
          color: var(--el-text-color-placeholder);
        }
      }
    }

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
  }
}
</style>
