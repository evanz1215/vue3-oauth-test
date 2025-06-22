<template>
  <div class="facebook-auth">
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>連接 Facebook...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>❌ {{ error }}</p>
      <button @click="clearError" class="retry-btn">重試</button>
    </div>

    <div v-else-if="!isLoggedIn" class="sign-in">
      <button @click="handleSignIn" class="facebook-sign-in-btn">
        <svg class="facebook-icon" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
          />
        </svg>
        使用 Facebook 登入
      </button>
    </div>

    <div v-else class="user-info">
      <div class="user-avatar">
        <img
          v-if="currentUser?.picture?.data?.url"
          :src="currentUser.picture.data.url"
          :alt="currentUser.name"
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
        <h3>歡迎回來！</h3>
        <p v-if="currentUser?.name" class="user-name">{{ currentUser.name }}</p>
        <p v-if="currentUser?.email" class="email">{{ currentUser.email }}</p>
        <p class="user-id">Facebook ID: {{ currentUser?.id?.slice(0, 8) }}...</p>
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
import { useFacebook } from '@/composables/useFacebook'

// 定義 emits
const emit = defineEmits<{
  statusChange: [
    status: {
      isLoggedIn: boolean
      currentUser: {
        id: string
        name: string
        email?: string
        picture?: {
          data: {
            url: string
          }
        }
        first_name?: string
        last_name?: string
      } | null
      isLoading: boolean
      error: string | null
    },
  ]
}>()

const showDebug = ref(false)

// Facebook 配置
const facebookConfig = {
  appId: import.meta.env.VITE_FACEBOOK_APP_ID || 'your-facebook-app-id',
  redirectUri: window.location.origin,
  scope: 'email,public_profile',
  usePopup: true,
}

const { isLoggedIn, currentUser, isLoading, error, signIn, signOut, checkAuthStatus } =
  useFacebook(facebookConfig)

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
    console.error('Facebook 登入失敗:', err)
  }
}

const handleSignOut = async () => {
  try {
    await signOut()
  } catch (err) {
    console.error('Facebook 登出失敗:', err)
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
.facebook-auth {
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
  padding: 2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e3f2fd;
  border-top: 4px solid #1877f2;
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
  background-color: #ffebee;
  border: 1px solid #f44336;
  border-radius: 8px;
  color: #d32f2f;
  margin-bottom: 1rem;
}

.facebook-sign-in-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: linear-gradient(45deg, #1877f2, #4267b2);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(24, 119, 242, 0.3);
  width: 100%;
}

.facebook-sign-in-btn:hover {
  background: linear-gradient(45deg, #166fe5, #365899);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(24, 119, 242, 0.4);
}

.facebook-sign-in-btn:active {
  transform: translateY(0);
}

.facebook-icon {
  width: 20px;
  height: 20px;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

.user-avatar {
  position: relative;
}

.avatar-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #1877f2;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(45deg, #1877f2, #4267b2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.avatar-placeholder svg {
  width: 40px;
  height: 40px;
}

.user-details {
  text-align: center;
}

.user-details h3 {
  margin: 0 0 0.5rem 0;
  color: #1a202c;
  font-size: 1.5rem;
  font-weight: 700;
}

.user-name {
  margin: 0.25rem 0;
  color: #2d3748;
  font-size: 1.125rem;
  font-weight: 600;
}

.email {
  margin: 0.25rem 0;
  color: #4a5568;
  font-size: 0.875rem;
}

.user-id {
  margin: 0.25rem 0;
  color: #718096;
  font-size: 0.75rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.sign-out-btn,
.retry-btn {
  background: linear-gradient(45deg, #e53e3e, #c53030);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(229, 62, 62, 0.3);
}

.sign-out-btn:hover,
.retry-btn:hover {
  background: linear-gradient(45deg, #c53030, #9c2626);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.4);
}

.retry-btn {
  background: linear-gradient(45deg, #38a169, #2f855a);
  box-shadow: 0 2px 8px rgba(56, 161, 105, 0.3);
  margin-top: 1rem;
}

.retry-btn:hover {
  background: linear-gradient(45deg, #2f855a, #276749);
  box-shadow: 0 4px 12px rgba(56, 161, 105, 0.4);
}

.debug-info {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #f7fafc;
  border-radius: 8px;
  text-align: left;
  font-size: 0.75rem;
}

.debug-info h4 {
  margin: 0 0 0.5rem 0;
  color: #2d3748;
}

.debug-info pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  color: #4a5568;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

/* 響應式設計 */
@media (max-width: 480px) {
  .facebook-auth {
    padding: 1rem;
  }

  .facebook-sign-in-btn {
    padding: 1rem 1.5rem;
    font-size: 0.875rem;
  }

  .avatar-image,
  .avatar-placeholder {
    width: 60px;
    height: 60px;
  }

  .avatar-placeholder svg {
    width: 30px;
    height: 30px;
  }
}
</style>
