<template>
  <div class="google-auth">
    <div v-if="isLoading" class="loading">
      <p>載入中...</p>
    </div>

    <div v-else-if="isLoggedIn" class="user-info">
      <div class="user-profile">
        <img :src="currentUser?.picture" :alt="currentUser?.name" class="avatar" />
        <div class="user-details">
          <h3>{{ currentUser?.name }}</h3>
          <p>{{ currentUser?.email }}</p>
        </div>
      </div>
      <button @click="handleSignOut" class="sign-out-btn" :disabled="isLoading">登出</button>
    </div>

    <div v-else class="sign-in">
      <button @click="handleSignIn" class="sign-in-btn" :disabled="isLoading">
        使用 Google 登入
      </button>
    </div>

    <div v-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="handleRetry" class="retry-btn" :disabled="isLoading">重試</button>
      <details style="margin-top: 10px">
        <summary>調試資訊</summary>
        <div class="debug-info">
          <p><strong>Client ID:</strong> {{ debugInfo.clientId }}</p>
          <p><strong>當前網域:</strong> {{ debugInfo.currentDomain }}</p>
          <p>
            <strong>GAPI 狀態:</strong>
            {{ debugInfo.gapiStatus() }}
          </p>
        </div>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useGoogle } from '@/composables/useGoogle'

// 定義 emits
const emit = defineEmits<{
  statusChange: [
    status: {
      isLoggedIn: boolean
      currentUser: {
        id: string
        name: string
        email: string
        picture?: string
      } | null
      isLoading: boolean
      error: string | null
    },
  ]
}>()

// Google OAuth 配置
const googleConfig = {
  clientId:
    import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com',
  redirectUri: window.location.origin,
  scope: ['profile', 'email'],
  usePopup: true, // 使用彈窗模式
}

// 初始化 Google OAuth
const { isLoggedIn, currentUser, isLoading, error, signIn, signOut, checkAuthStatus } =
  useGoogle(googleConfig)

// 暴露狀態給父組件
defineExpose({
  isLoggedIn,
  currentUser,
  isLoading,
  error,
  signIn,
  signOut,
  checkAuthStatus,
})

// 監聽狀態變化並向父組件發送
watch(
  [isLoggedIn, currentUser, isLoading, error],
  () => {
    emit('statusChange', {
      isLoggedIn: isLoggedIn.value,
      currentUser: currentUser.value,
      isLoading: isLoading.value,
      error: error.value,
    })
  },
  { immediate: true },
)

// 調試資訊
const debugInfo = {
  clientId: googleConfig.clientId.substring(0, 20) + '...',
  currentDomain: window.location.origin,
  gapiStatus: () =>
    typeof window.google !== 'undefined' && window.google.accounts ? '已載入 (新版)' : '未載入',
}

// 處理登入
const handleSignIn = async () => {
  try {
    await signIn()
    console.log('登入成功:', currentUser.value)
  } catch (err) {
    console.error('登入失敗:', err)
  }
}

// 處理登出
const handleSignOut = async () => {
  try {
    await signOut()
    console.log('登出成功')
  } catch (err) {
    console.error('登出失敗:', err)
  }
}

// 處理重試
const handleRetry = async () => {
  try {
    console.log('重試初始化...')
    await checkAuthStatus()
  } catch (err) {
    console.error('重試失敗:', err)
  }
}

// 組件掛載時檢查認證狀態
onMounted(async () => {
  try {
    console.log('🚀 開始初始化 Google Identity Services...')
    console.log('Client ID:', googleConfig.clientId)
    await checkAuthStatus()
    console.log('✅ Google Identity Services 初始化完成')
  } catch (err) {
    console.error('❌ 組件初始化失敗:', err)
  }
})
</script>

<style scoped>
.google-auth {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

.loading {
  padding: 20px;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.user-details h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
  color: #333;
}

.user-details p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.sign-in-btn,
.sign-out-btn,
.retry-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 5px;
}

.sign-in-btn {
  background-color: #4285f4;
  color: white;
}

.sign-in-btn:hover:not(:disabled) {
  background-color: #357ae8;
}

.sign-out-btn {
  background-color: #dc3545;
  color: white;
}

.sign-out-btn:hover:not(:disabled) {
  background-color: #c82333;
}

.retry-btn {
  background-color: #28a745;
  color: white;
}

.retry-btn:hover:not(:disabled) {
  background-color: #218838;
}

.sign-in-btn:disabled,
.sign-out-btn:disabled,
.retry-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  margin-top: 15px;
  padding: 10px;
  background-color: #ffebee;
  border: 1px solid #f44336;
  border-radius: 4px;
  color: #d32f2f;
}

.debug-info {
  margin-top: 10px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
  text-align: left;
  color: #666;
}

.debug-info p {
  margin: 5px 0;
}
</style>
