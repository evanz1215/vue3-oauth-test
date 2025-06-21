<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useLine } from '@/composables/useLine'

// 定義 emits
const emit = defineEmits<{
  statusChange: [
    status: {
      isLoggedIn: boolean
      currentUser: {
        userId: string
        displayName: string
        pictureUrl?: string
        statusMessage?: string
      } | null
      isLoading: boolean
      error: string | null
    },
  ]
}>()

// LINE OAuth 配置
const lineConfig = {
  clientId: import.meta.env.VITE_LINE_CLIENT_ID || 'your-line-client-id',
  redirectUri: `${window.location.origin}/auth/line/callback`,
  scope: 'profile openid',
}

// 使用 LINE OAuth
const { isLoading, isLoggedIn, currentUser, error, signIn, signOut, checkAuthStatus } =
  useLine(lineConfig)

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

// 組件掛載時檢查認證狀態
onMounted(() => {
  checkAuthStatus()
})
</script>

<template>
  <div class="line-auth-container">
    <!-- 載入狀態 -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在處理 LINE 登入...</p>
    </div>

    <!-- 錯誤狀態 -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <p class="error-message">{{ error }}</p>
      <button @click="signIn" class="retry-button">重試</button>
    </div>

    <!-- 已登入狀態 -->
    <div v-else-if="isLoggedIn && currentUser" class="logged-in-state">
      <div class="user-info">
        <div class="user-avatar">
          <img
            v-if="currentUser.pictureUrl"
            :src="currentUser.pictureUrl"
            :alt="currentUser.displayName"
            class="avatar-image"
          />
          <div v-else class="avatar-placeholder">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 6.5V9C15 10.1 15.9 11 17 11S19 10.1 19 9V8.5L21 9ZM3 13C3 12.2 3.2 11.5 3.5 10.9L9.5 12.4V15C9.5 16.9 11.1 18.5 13 18.5S16.5 16.9 16.5 15V12.4L22.5 10.9C22.8 11.5 23 12.2 23 13V22H3V13Z"
              />
            </svg>
          </div>
        </div>
        <div class="user-details">
          <h3 class="user-name">{{ currentUser.displayName }}</h3>
          <p v-if="currentUser.statusMessage" class="user-status">
            {{ currentUser.statusMessage }}
          </p>
          <p class="user-id">ID: {{ currentUser.userId.slice(0, 8) }}...</p>
        </div>
      </div>

      <button @click="signOut" class="sign-out-button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
        </svg>
        登出 LINE
      </button>
    </div>

    <!-- 未登入狀態 -->
    <div v-else class="signed-out-state">
      <div class="line-info">
        <div class="line-logo">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"
            />
          </svg>
        </div>
        <h3>LINE 登入</h3>
        <p>使用您的 LINE 帳號快速登入</p>
      </div>

      <button @click="signIn" class="sign-in-button">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"
          />
        </svg>
        使用 LINE 登入
      </button>
    </div>
  </div>
</template>

<style scoped>
.line-auth-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}

/* 載入狀態 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #00b900;
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

/* 錯誤狀態 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
}

.error-icon {
  font-size: 2rem;
}

.error-message {
  color: #e53e3e;
  margin: 0;
  font-weight: 500;
}

.retry-button {
  padding: 0.5rem 1rem;
  background: #00b900;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.retry-button:hover {
  background: #009900;
  transform: translateY(-1px);
}

/* 已登入狀態 */
.logged-in-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #00b900, #00d400);
  border-radius: 16px;
  color: white;
  width: 100%;
  max-width: 300px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.user-avatar {
  flex-shrink: 0;
}

.avatar-image {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.avatar-placeholder {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.avatar-placeholder svg {
  width: 24px;
  height: 24px;
  color: rgba(255, 255, 255, 0.8);
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-status {
  margin: 0 0 0.25rem 0;
  font-size: 0.85rem;
  opacity: 0.9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-id {
  margin: 0;
  font-size: 0.75rem;
  opacity: 0.7;
  font-family: monospace;
}

.sign-out-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.sign-out-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.sign-out-button svg {
  width: 16px;
  height: 16px;
}

/* 未登入狀態 */
.signed-out-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  text-align: center;
  width: 100%;
  max-width: 300px;
}

.line-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.line-logo {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #00b900, #00d400);
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 25px rgba(0, 185, 0, 0.3);
}

.line-logo svg {
  width: 30px;
  height: 30px;
  color: white;
}

.line-info h3 {
  margin: 0;
  color: #1a202c;
  font-size: 1.25rem;
  font-weight: 600;
}

.line-info p {
  margin: 0;
  color: #4a5568;
  font-size: 0.9rem;
}

.sign-in-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #00b900, #00d400);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 185, 0, 0.3);
  width: 100%;
}

.sign-in-button:hover {
  background: linear-gradient(135deg, #009900, #00c200);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 185, 0, 0.4);
}

.sign-in-button:active {
  transform: translateY(0);
}

.sign-in-button svg {
  width: 20px;
  height: 20px;
}

/* 響應式設計 */
@media (max-width: 480px) {
  .line-auth-container {
    padding: 0.5rem;
  }

  .signed-out-state,
  .logged-in-state {
    padding: 1.5rem;
  }

  .sign-in-button {
    padding: 0.875rem 1.5rem;
    font-size: 0.95rem;
  }
}
</style>
