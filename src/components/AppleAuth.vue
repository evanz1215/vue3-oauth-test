<template>
  <div class="apple-auth">
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>連接 Apple ID...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>❌ {{ error }}</p>
      <button @click="clearError" class="retry-btn">重試</button>
    </div>

    <div v-else-if="!isLoggedIn" class="sign-in">
      <button @click="handleSignIn" class="apple-sign-in-btn">
        <svg class="apple-icon" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
          />
        </svg>
        使用 Apple ID 登入
      </button>
    </div>

    <div v-else class="user-info">
      <div class="user-avatar">
        <svg class="apple-icon" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
          />
        </svg>
      </div>
      <div class="user-details">
        <h3>歡迎回來！</h3>
        <p v-if="currentUser?.name">
          {{ currentUser.name.firstName }} {{ currentUser.name.lastName }}
        </p>
        <p v-if="currentUser?.email" class="email">{{ currentUser.email }}</p>
        <p class="user-id">Apple ID: {{ currentUser?.id?.slice(0, 8) }}...</p>
      </div>
      <button @click="handleSignOut" class="sign-out-btn">登出</button>
    </div>

    <div class="debug-info" v-if="showDebug">
      <h4>除錯資訊：</h4>
      <pre>{{ JSON.stringify({ isLoggedIn, currentUser, error }, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useApple } from '@/composables/useApple'

// 定義 emits
const emit = defineEmits<{
  statusChange: [
    status: {
      isLoggedIn: boolean
      currentUser: {
        id: string
        name?: {
          firstName: string
          lastName: string
        }
        email?: string
      } | null
      isLoading: boolean
      error: string | null
    },
  ]
}>()

const showDebug = ref(false)

// Apple 配置
const appleConfig = {
  clientId: import.meta.env.VITE_APPLE_CLIENT_ID || 'your-apple-client-id',
  redirectUri: window.location.origin,
  scope: ['name', 'email'],
  usePopup: true,
}

const { isLoggedIn, currentUser, isLoading, error, signIn, signOut, checkAuthStatus } =
  useApple(appleConfig)

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

const handleSignIn = async () => {
  try {
    await signIn()
  } catch (err) {
    console.error('Apple 登入失敗:', err)
  }
}

const handleSignOut = async () => {
  try {
    await signOut()
  } catch (err) {
    console.error('Apple 登出失敗:', err)
  }
}

const clearError = () => {
  // 這裡可以重置錯誤狀態或重新初始化
  checkAuthStatus()
}

onMounted(() => {
  checkAuthStatus()
})
</script>

<style scoped>
.apple-auth {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error {
  padding: 1rem;
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.error p {
  color: #c33;
  margin: 0 0 1rem 0;
}

.retry-btn {
  background-color: #007aff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}

.retry-btn:hover {
  background-color: #0056b3;
}

.apple-sign-in-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: #000;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
}

.apple-sign-in-btn:hover {
  background-color: #333;
}

.apple-icon {
  width: 20px;
  height: 20px;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 12px;
}

.user-avatar {
  width: 60px;
  height: 60px;
  background-color: #000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar .apple-icon {
  width: 30px;
  height: 30px;
  color: white;
}

.user-details {
  text-align: center;
}

.user-details h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.user-details p {
  margin: 0.25rem 0;
  color: #666;
}

.email {
  font-weight: 500;
}

.user-id {
  font-size: 0.875rem;
  color: #999;
}

.sign-out-btn {
  background-color: #ff3b30;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.sign-out-btn:hover {
  background-color: #d70015;
}

.debug-info {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 8px;
  text-align: left;
}

.debug-info h4 {
  margin: 0 0 0.5rem 0;
}

.debug-info pre {
  font-size: 0.875rem;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
