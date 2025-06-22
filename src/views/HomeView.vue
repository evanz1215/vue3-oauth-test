<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import GoogleAuth from '@/components/GoogleAuth.vue'
import AppleAuth from '@/components/AppleAuth.vue'
import LineAuth from '@/components/LineAuth.vue'
import FacebookAuth from '@/components/FacebookAuth.vue'

const isLoaded = ref(false)
const activeTab = ref('demo')

// OAuth 狀態管理
const googleStatus = ref<{
  isLoggedIn: boolean
  currentUser: {
    id: string
    name: string
    email: string
    picture?: string
  } | null
  isLoading: boolean
  error: string | null
}>({
  isLoggedIn: false,
  currentUser: null,
  isLoading: false,
  error: null,
})

const appleStatus = ref<{
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
}>({
  isLoggedIn: false,
  currentUser: null,
  isLoading: false,
  error: null,
})

const lineStatus = ref<{
  isLoggedIn: boolean
  currentUser: {
    userId: string
    displayName: string
    pictureUrl?: string
    statusMessage?: string
  } | null
  isLoading: boolean
  error: string | null
}>({
  isLoggedIn: false,
  currentUser: null,
  isLoading: false,
  error: null,
})

const facebookStatus = ref<{
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
}>({
  isLoggedIn: false,
  currentUser: null,
  isLoading: false,
  error: null,
})

// 處理各組件狀態變化
const handleGoogleStatusChange = (status: typeof googleStatus.value) => {
  googleStatus.value = status
}

const handleAppleStatusChange = (status: typeof appleStatus.value) => {
  appleStatus.value = status
}

const handleLineStatusChange = (status: typeof lineStatus.value) => {
  lineStatus.value = status
}

const handleFacebookStatusChange = (status: typeof facebookStatus.value) => {
  facebookStatus.value = status
}

// 計算總體登入狀態
const totalConnected = computed(() => {
  let count = 0
  if (googleStatus.value.isLoggedIn) count++
  if (appleStatus.value.isLoggedIn) count++
  if (lineStatus.value.isLoggedIn) count++
  if (facebookStatus.value.isLoggedIn) count++
  return count
})

const connectionRate = computed(() => {
  return Math.round((totalConnected.value / 4) * 100)
})

// 功能特性數據
const features = ref([
  {
    title: '快速整合',
    description: '只需幾行代碼即可完成 OAuth 整合，支援 Google、Apple、LINE 三大平台',
    color: 'linear-gradient(135deg, #667eea, #764ba2)',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
  },
  {
    title: '全平台支援',
    description: '涵蓋全球與亞洲主流 OAuth 提供商，滿足不同地區用戶需求',
    color: 'linear-gradient(135deg, #f093fb, #f5576c)',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
  },
  {
    title: '企業級安全',
    description: '遵循 OAuth 2.0 標準，確保用戶數據的最高安全性',
    color: 'linear-gradient(135deg, #4facfe, #00f2fe)',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  },
  {
    title: '響應式設計',
    description: '完美適配所有設備尺寸，提供一致的用戶體驗',
    color: 'linear-gradient(135deg, #fa709a, #fee140)',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
  },
])

onMounted(() => {
  setTimeout(() => {
    isLoaded.value = true
  }, 100)
})
</script>

<template>
  <main class="oauth-showcase" :class="{ loaded: isLoaded }">
    <!-- 頁面標題 -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-badge">
          <span class="badge-text">OAuth 2.0 整合</span>
        </div>
        <h1 class="hero-title">
          現代化的
          <span class="gradient-text">第三方登入</span>
          解決方案
        </h1>
        <p class="hero-subtitle">
          基於 Vue 3 + TypeScript 的完整 OAuth 整合示範，支援 Google 、 Apple 、 Line 登入
        </p>
        <div class="hero-stats">
          <div class="stat-item">
            <div class="stat-number">{{ totalConnected }}</div>
            <div class="stat-label">已連接服務</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ connectionRate }}%</div>
            <div class="stat-label">連接率</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">Vue 3</div>
            <div class="stat-label">Composition API</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">TypeScript</div>
            <div class="stat-label">類型安全</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 導航標籤 -->
    <div class="nav-tabs">
      <button :class="{ active: activeTab === 'demo' }" @click="activeTab = 'demo'" class="nav-tab">
        <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
        登入示範
      </button>
      <button
        :class="{ active: activeTab === 'status' }"
        @click="activeTab = 'status'"
        class="nav-tab"
      >
        <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zM19 19v-6a2 2 0 00-2-2h-2a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zM9 7V5a2 2 0 00-2-2H5a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2zM19 7V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2z"
          />
        </svg>
        狀態監控
      </button>
      <button :class="{ active: activeTab === 'docs' }" @click="activeTab = 'docs'" class="nav-tab">
        <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10,9 9,9 8,9" />
        </svg>
        技術文檔
      </button>
    </div>

    <!-- 內容區域 -->
    <div class="content-container">
      <!-- 登入示範 -->
      <div v-show="activeTab === 'demo'" class="tab-content">
        <div class="demo-grid">
          <!-- Google OAuth -->
          <div class="oauth-card google-card">
            <div class="card-header">
              <div class="provider-info">
                <div class="provider-icon google-icon">
                  <svg viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </div>
                <div class="provider-details">
                  <h3>Google OAuth</h3>
                  <p>Google Identity Services</p>
                </div>
              </div>
              <div class="status-indicator" :class="{ active: googleStatus.isLoggedIn }">
                <div class="status-dot"></div>
              </div>
            </div>
            <div class="card-content">
              <GoogleAuth @status-change="handleGoogleStatusChange" />
            </div>
          </div>

          <!-- Apple OAuth -->
          <div class="oauth-card apple-card">
            <div class="card-header">
              <div class="provider-info">
                <div class="provider-icon apple-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
                    />
                  </svg>
                </div>
                <div class="provider-details">
                  <h3>Apple OAuth</h3>
                  <p>Apple ID Services</p>
                </div>
              </div>
              <div class="status-indicator" :class="{ active: appleStatus.isLoggedIn }">
                <div class="status-dot"></div>
              </div>
            </div>
            <div class="card-content">
              <AppleAuth @status-change="handleAppleStatusChange" />
            </div>
          </div>

          <!-- LINE OAuth -->
          <div class="oauth-card line-card">
            <div class="card-header">
              <div class="provider-info">
                <div class="provider-icon line-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"
                    />
                  </svg>
                </div>
                <div class="provider-details">
                  <h3>LINE OAuth</h3>
                  <p>LINE Login Services</p>
                </div>
              </div>
              <div class="status-indicator" :class="{ active: lineStatus.isLoggedIn }">
                <div class="status-dot"></div>
              </div>
            </div>
            <div class="card-content">
              <LineAuth @status-change="handleLineStatusChange" />
            </div>
          </div>

          <!-- Facebook OAuth -->
          <div class="oauth-card facebook-card">
            <div class="card-header">
              <div class="provider-info">
                <div class="provider-icon facebook-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                    />
                  </svg>
                </div>
                <div class="provider-details">
                  <h3>Facebook OAuth</h3>
                  <p>Facebook Login Services</p>
                </div>
              </div>
              <div class="status-indicator" :class="{ active: facebookStatus.isLoggedIn }">
                <div class="status-dot"></div>
              </div>
            </div>
            <div class="card-content">
              <FacebookAuth @status-change="handleFacebookStatusChange" />
            </div>
          </div>
        </div>
      </div>

      <!-- 狀態監控 -->
      <div v-show="activeTab === 'status'" class="tab-content">
        <div class="status-dashboard">
          <div class="dashboard-header">
            <h2>即時狀態監控</h2>
            <p>監控所有 OAuth 提供商的認證狀態</p>
          </div>

          <div class="status-grid">
            <!-- Google 狀態 -->
            <div class="status-card" :class="{ authenticated: googleStatus.isLoggedIn }">
              <div class="status-card-header">
                <div class="status-icon google">
                  <svg viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </div>
                <h3>Google</h3>
                <div class="status-badge" :class="{ online: googleStatus.isLoggedIn }">
                  {{ googleStatus.isLoggedIn ? '已連接' : '未連接' }}
                </div>
              </div>
              <div class="status-details">
                <div class="detail-item" v-if="googleStatus.currentUser">
                  <span class="detail-label">用戶名稱</span>
                  <span class="detail-value">{{ googleStatus.currentUser.name }}</span>
                </div>
                <div class="detail-item" v-if="googleStatus.currentUser">
                  <span class="detail-label">電子郵件</span>
                  <span class="detail-value">{{ googleStatus.currentUser.email }}</span>
                </div>
                <div class="detail-item" v-if="googleStatus.currentUser">
                  <span class="detail-label">用戶ID</span>
                  <span class="detail-value"
                    >{{ googleStatus.currentUser.id.slice(0, 12) }}...</span
                  >
                </div>
                <div class="detail-item">
                  <span class="detail-label">載入狀態</span>
                  <span class="detail-value" :class="{ loading: googleStatus.isLoading }">
                    {{ googleStatus.isLoading ? '載入中...' : '就緒' }}
                  </span>
                </div>
                <div class="detail-item" v-if="googleStatus.error">
                  <span class="detail-label">錯誤</span>
                  <span class="detail-value error">{{ googleStatus.error }}</span>
                </div>
              </div>
            </div>

            <!-- Apple 狀態 -->
            <div class="status-card" :class="{ authenticated: appleStatus.isLoggedIn }">
              <div class="status-card-header">
                <div class="status-icon apple">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
                    />
                  </svg>
                </div>
                <h3>Apple</h3>
                <div class="status-badge" :class="{ online: appleStatus.isLoggedIn }">
                  {{ appleStatus.isLoggedIn ? '已連接' : '未連接' }}
                </div>
              </div>
              <div class="status-details">
                <div class="detail-item" v-if="appleStatus.currentUser?.name">
                  <span class="detail-label">用戶名稱</span>
                  <span class="detail-value"
                    >{{ appleStatus.currentUser.name.firstName }}
                    {{ appleStatus.currentUser.name.lastName }}</span
                  >
                </div>
                <div class="detail-item" v-if="appleStatus.currentUser?.email">
                  <span class="detail-label">電子郵件</span>
                  <span class="detail-value">{{ appleStatus.currentUser.email }}</span>
                </div>
                <div class="detail-item" v-if="appleStatus.currentUser">
                  <span class="detail-label">用戶ID</span>
                  <span class="detail-value">{{ appleStatus.currentUser.id.slice(0, 12) }}...</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">載入狀態</span>
                  <span class="detail-value" :class="{ loading: appleStatus.isLoading }">
                    {{ appleStatus.isLoading ? '載入中...' : '就緒' }}
                  </span>
                </div>
                <div class="detail-item" v-if="appleStatus.error">
                  <span class="detail-label">錯誤</span>
                  <span class="detail-value error">{{ appleStatus.error }}</span>
                </div>
              </div>
            </div>

            <!-- LINE 狀態 -->
            <div class="status-card" :class="{ authenticated: lineStatus.isLoggedIn }">
              <div class="status-card-header">
                <div class="status-icon line">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"
                    />
                  </svg>
                </div>
                <h3>LINE</h3>
                <div class="status-badge" :class="{ online: lineStatus.isLoggedIn }">
                  {{ lineStatus.isLoggedIn ? '已連接' : '未連接' }}
                </div>
              </div>
              <div class="status-details">
                <div class="detail-item" v-if="lineStatus.currentUser">
                  <span class="detail-label">用戶名稱</span>
                  <span class="detail-value">{{ lineStatus.currentUser.displayName }}</span>
                </div>
                <div class="detail-item" v-if="lineStatus.currentUser?.statusMessage">
                  <span class="detail-label">狀態訊息</span>
                  <span class="detail-value">{{ lineStatus.currentUser.statusMessage }}</span>
                </div>
                <div class="detail-item" v-if="lineStatus.currentUser">
                  <span class="detail-label">用戶ID</span>
                  <span class="detail-value"
                    >{{ lineStatus.currentUser.userId.slice(0, 12) }}...</span
                  >
                </div>
                <div class="detail-item">
                  <span class="detail-label">載入狀態</span>
                  <span class="detail-value" :class="{ loading: lineStatus.isLoading }">
                    {{ lineStatus.isLoading ? '載入中...' : '就緒' }}
                  </span>
                </div>
                <div class="detail-item" v-if="lineStatus.error">
                  <span class="detail-label">錯誤</span>
                  <span class="detail-value error">{{ lineStatus.error }}</span>
                </div>
              </div>
            </div>

            <!-- Facebook 狀態 -->
            <div class="status-card" :class="{ authenticated: facebookStatus.isLoggedIn }">
              <div class="status-card-header">
                <div class="status-icon facebook">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                    />
                  </svg>
                </div>
                <h3>Facebook</h3>
                <div class="status-badge" :class="{ online: facebookStatus.isLoggedIn }">
                  {{ facebookStatus.isLoggedIn ? '已連接' : '未連接' }}
                </div>
              </div>
              <div class="status-details">
                <div class="detail-item" v-if="facebookStatus.currentUser">
                  <span class="detail-label">用戶名稱</span>
                  <span class="detail-value">{{ facebookStatus.currentUser.name }}</span>
                </div>
                <div class="detail-item" v-if="facebookStatus.currentUser?.email">
                  <span class="detail-label">電子郵件</span>
                  <span class="detail-value">{{ facebookStatus.currentUser.email }}</span>
                </div>
                <div class="detail-item" v-if="facebookStatus.currentUser">
                  <span class="detail-label">用戶ID</span>
                  <span class="detail-value"
                    >{{ facebookStatus.currentUser.id.slice(0, 12) }}...</span
                  >
                </div>
                <div class="detail-item">
                  <span class="detail-label">載入狀態</span>
                  <span class="detail-value" :class="{ loading: facebookStatus.isLoading }">
                    {{ facebookStatus.isLoading ? '載入中...' : '就緒' }}
                  </span>
                </div>
                <div class="detail-item" v-if="facebookStatus.error">
                  <span class="detail-label">錯誤</span>
                  <span class="detail-value error">{{ facebookStatus.error }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 技術文檔 -->
      <div v-show="activeTab === 'docs'" class="tab-content">
        <div class="docs-container">
          <div class="docs-header">
            <h2>技術架構與特色</h2>
            <p>了解這個 OAuth 整合解決方案的技術細節</p>
          </div>

          <div class="docs-grid">
            <div class="doc-card">
              <div class="doc-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  />
                </svg>
              </div>
              <h3>現代化框架</h3>
              <div class="doc-content">
                <ul>
                  <li><strong>Vue 3</strong> - 最新的 Vue.js 框架</li>
                  <li><strong>Composition API</strong> - 更好的邏輯組織</li>
                  <li><strong>TypeScript</strong> - 完整的類型安全</li>
                  <li><strong>Vite</strong> - 快速開發構建工具</li>
                </ul>
              </div>
            </div>

            <div class="doc-card">
              <div class="doc-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3>安全特性</h3>
              <div class="doc-content">
                <ul>
                  <li><strong>OAuth 2.0</strong> - 業界標準認證</li>
                  <li><strong>Token 管理</strong> - 自動更新和存儲</li>
                  <li><strong>HTTPS 支援</strong> - 安全傳輸協議</li>
                  <li><strong>錯誤處理</strong> - 完善的異常處理</li>
                </ul>
              </div>
            </div>

            <div class="doc-card">
              <div class="doc-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <h3>高效能</h3>
              <div class="doc-content">
                <ul>
                  <li><strong>響應式設計</strong> - 自動更新UI狀態</li>
                  <li><strong>懶載入</strong> - 按需載入 OAuth 腳本</li>
                  <li><strong>記憶體優化</strong> - 避免重複初始化</li>
                  <li><strong>快速啟動</strong> - 最小化初始載入時間</li>
                </ul>
              </div>
            </div>

            <div class="doc-card">
              <div class="doc-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    d="M14.5 4h-5L7 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2h-3l-2.5-3z"
                  />
                  <circle cx="12" cy="13" r="3" />
                </svg>
              </div>
              <h3>易用性</h3>
              <div class="doc-content">
                <ul>
                  <li><strong>組合式函數</strong> - 簡單的 API 設計</li>
                  <li><strong>自動恢復</strong> - 頁面刷新後保持登入</li>
                  <li><strong>詳細文檔</strong> - 完整的設置指南</li>
                  <li><strong>示範代碼</strong> - 豐富的使用範例</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="code-example">
            <h3>快速開始</h3>
            <div class="code-block">
              <pre><code>// 在 Vue 組件中使用
import { useGoogle, useApple } from '@/composables'

const { isLoggedIn, currentUser, signIn, signOut } = useGoogle({
  clientId: 'your-google-client-id',
  redirectUri: window.location.origin
})

// 響應式狀態自動更新
watch(isLoggedIn, (newValue) => {
  if (newValue) {
    console.log('用戶已登入:', currentUser.value)
  }
})</code></pre>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 功能亮點 -->
    <div class="features-highlight" v-show="activeTab === 'demo'">
      <div class="features-container">
        <div class="features-header">
          <h2>為什麼選擇我們的解決方案？</h2>
          <p>企業級的 OAuth 整合，提供最佳的開發體驗</p>
        </div>
        <div class="features-grid">
          <div class="feature-card" v-for="(feature, index) in features" :key="index">
            <div class="feature-icon" :style="{ background: feature.color }">
              <div v-html="feature.icon"></div>
            </div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部統計 -->
    <div class="footer-stats">
      <div class="stats-container">
        <div class="stat-item">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
          <div class="stat-text">
            <div class="stat-number">
              {{
                (googleStatus.isLoggedIn ? 1 : 0) +
                (appleStatus.isLoggedIn ? 1 : 0) +
                (lineStatus.isLoggedIn ? 1 : 0)
              }}
            </div>
            <div class="stat-label">活躍連接</div>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div class="stat-text">
            <div class="stat-number">3</div>
            <div class="stat-label">OAuth 提供商</div>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
          </div>
          <div class="stat-text">
            <div class="stat-number">100%</div>
            <div class="stat-label">TypeScript</div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* 基礎樣式 */
.oauth-showcase {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.oauth-showcase::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="0.5" fill="%23ffffff" opacity="0.1"/><circle cx="25" cy="25" r="0.3" fill="%23ffffff" opacity="0.05"/><circle cx="75" cy="75" r="0.4" fill="%23ffffff" opacity="0.08"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  pointer-events: none;
  z-index: 1;
}

.oauth-showcase::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: rotate 20s linear infinite;
  pointer-events: none;
  z-index: 1;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.oauth-showcase.loaded {
  opacity: 1;
  transform: translateY(0);
}

/* 英雄區塊 */
.hero-section {
  padding: 4rem 2rem;
  text-align: center;
  color: white;
  position: relative;
  z-index: 2;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
}

.hero-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50px;
  padding: 0.5rem 1.5rem;
  margin-bottom: 2rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.badge-text {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.hero-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.gradient-text {
  background: linear-gradient(45deg, #ffd89b 0%, #19547b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  opacity: 0.9;
  margin-bottom: 3rem;
  line-height: 1.6;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  flex-wrap: wrap;
}

.hero-stats .stat-item {
  text-align: center;
}

.hero-stats .stat-number {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.hero-stats .stat-label {
  font-size: 0.875rem;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* 導航標籤 */
.nav-tabs {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 2;
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.nav-tab:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.nav-tab.active {
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.tab-icon {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

/* 內容容器 */
.content-container {
  background: #f8fafc;
  min-height: 60vh;
  position: relative;
  z-index: 2;
}

.tab-content {
  padding: 3rem 2rem;
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 示範區塊 */
.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .demo-grid {
    grid-template-columns: 1fr;
  }
}

.oauth-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.oauth-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.provider-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.provider-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.google-icon {
  background: linear-gradient(45deg, #4285f4, #34a853);
}

.apple-icon {
  background: linear-gradient(45deg, #000, #333);
}

.line-icon {
  background: linear-gradient(45deg, #00b900, #00d400);
}

.facebook-icon {
  background: linear-gradient(45deg, #1877f2, #42a5f5);
}

.provider-icon svg {
  width: 24px;
  height: 24px;
}

.provider-details h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #1a202c;
}

.provider-details p {
  margin: 0.25rem 0 0 0;
  color: #718096;
  font-size: 0.875rem;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  position: relative;
}

.status-dot {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #e2e8f0;
  animation: pulse 2s infinite;
}

.status-indicator.active .status-dot {
  background: #48bb78;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(72, 187, 120, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(72, 187, 120, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(72, 187, 120, 0);
  }
}

.card-content {
  padding: 1.5rem;
}

/* 狀態監控 */
.status-dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 3rem;
}

.dashboard-header h2 {
  font-size: 2.5rem;
  color: #1a202c;
  margin-bottom: 1rem;
}

.dashboard-header p {
  font-size: 1.125rem;
  color: #718096;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

@media (max-width: 768px) {
  .status-grid {
    grid-template-columns: 1fr;
  }
}

.status-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  border-left: 4px solid #e2e8f0;
}

.status-card.authenticated {
  border-left-color: #48bb78;
  box-shadow: 0 10px 30px rgba(72, 187, 120, 0.2);
}

.status-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.status-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
}

.status-icon.google {
  background: linear-gradient(45deg, #4285f4, #34a853);
  color: white;
}

.status-icon.apple {
  background: linear-gradient(45deg, #000, #333);
  color: white;
}

.status-icon.line {
  background: linear-gradient(45deg, #00b900, #00d400);
  color: white;
}

.status-icon.facebook {
  background: linear-gradient(45deg, #3b5998, #8b9dc3);
  color: white;
}

.status-icon svg {
  width: 20px;
  height: 20px;
}

.status-card-header h3 {
  margin: 0;
  color: #1a202c;
  font-size: 1.25rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: #fed7d7;
  color: #c53030;
}

.status-badge.online {
  background: #c6f6d5;
  color: #38a169;
}

.status-details {
  padding: 1.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f7fafc;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 500;
  color: #4a5568;
}

.detail-value {
  color: #1a202c;
  font-weight: 600;
}

.detail-value.loading {
  color: #3182ce;
}

.detail-value.error {
  color: #e53e3e;
}

/* 技術文檔 */
.docs-container {
  max-width: 1200px;
  margin: 0 auto;
}

.docs-header {
  text-align: center;
  margin-bottom: 3rem;
}

.docs-header h2 {
  font-size: 2.5rem;
  color: #1a202c;
  margin-bottom: 1rem;
}

.docs-header p {
  font-size: 1.125rem;
  color: #718096;
}

.docs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.doc-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.doc-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.doc-icon {
  width: 60px;
  height: 60px;
  border-radius: 15px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.doc-icon svg {
  width: 30px;
  height: 30px;
  color: white;
  stroke-width: 2;
}

.doc-card h3 {
  margin: 0 0 1rem 0;
  color: #1a202c;
  font-size: 1.5rem;
}

.doc-content ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.doc-content li {
  padding: 0.5rem 0;
  color: #4a5568;
  border-bottom: 1px solid #f7fafc;
}

.doc-content li:last-child {
  border-bottom: none;
}

.code-example {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.code-example h3 {
  margin: 0 0 1.5rem 0;
  color: #1a202c;
  font-size: 1.5rem;
}

.code-block {
  background: #1a202c;
  border-radius: 12px;
  padding: 1.5rem;
  overflow-x: auto;
}

.code-block pre {
  margin: 0;
  color: #e2e8f0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
}

/* 底部統計 */
.footer-stats {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 3rem 2rem;
  color: white;
  position: relative;
  z-index: 2;
}

/* 功能亮點 */
.features-highlight {
  background: linear-gradient(45deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 4rem 2rem;
  position: relative;
  z-index: 2;
}

.features-container {
  max-width: 1200px;
  margin: 0 auto;
}

.features-header {
  text-align: center;
  margin-bottom: 3rem;
}

.features-header h2 {
  font-size: 2.5rem;
  color: #1a202c;
  margin-bottom: 1rem;
  font-weight: 800;
}

.features-header p {
  font-size: 1.25rem;
  color: #4a5568;
  max-width: 600px;
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  border-radius: 20px;
  padding: 2.5rem 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem auto;
  color: white;
}

.feature-icon svg {
  width: 36px;
  height: 36px;
}

.feature-card h3 {
  font-size: 1.5rem;
  color: #1a202c;
  margin-bottom: 1rem;
  font-weight: 700;
}

.feature-card p {
  color: #4a5568;
  line-height: 1.7;
  font-size: 1rem;
}

.stats-container {
  display: flex;
  justify-content: center;
  gap: 3rem;
  max-width: 800px;
  margin: 0 auto;
  flex-wrap: wrap;
}

.footer-stats .stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.footer-stats .stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-stats .stat-icon svg {
  width: 24px;
  height: 24px;
  stroke-width: 2;
}

.footer-stats .stat-number {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.25rem;
}

.footer-stats .stat-label {
  font-size: 0.875rem;
  opacity: 0.8;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .nav-tabs {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .nav-tab {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }

  .hero-stats {
    gap: 1.5rem;
  }

  .stats-container {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
}
</style>
