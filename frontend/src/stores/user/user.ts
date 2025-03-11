import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { processResourceUrl } from '../../utils/processResoureUrl'
import type { BiliUserInfo, UserInfo } from '../../types/user'

/**
 * 用户状态管理
 * 使用 pinia-plugin-persistedstate 插件实现状态持久化
 */
export const useUserStore = defineStore('user', () => {
  // 用户状态
  const isLoggedIn = ref(false)
  const userInfo = ref<UserInfo['userInfo']>(null)

  /**
   * 设置用户信息
   * 只保存必要的用户数据，并处理头像 URL
   */
  function setUserInfo(info: BiliUserInfo) {
    isLoggedIn.value = info.isLogin
    userInfo.value = info.isLogin
      ? {
          avatar: processResourceUrl(info.face),
          username: info.uname,
          mid: info.mid
        }
      : null
  }

  /**
   * 退出登录
   * 清除所有用户信息
   */
  function logout() {
    isLoggedIn.value = false
    userInfo.value = null
  }

  // 计算属性
  const avatar = computed(() => userInfo.value?.avatar || '')
  const username = computed(() => userInfo.value?.username || '')
  const mid = computed(() => userInfo.value?.mid || null)

  return { isLoggedIn, userInfo, setUserInfo, logout, avatar, username, mid }
}, {
  persist: true // 开启状态持久化
})
