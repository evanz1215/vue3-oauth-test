<script setup lang="ts">
import { useGoogle } from '@/composables/useGoogle'
import { useApple } from '@/composables/useApple'
import GoogleAuth from '@/components/GoogleAuth.vue'
import AppleAuth from '@/components/AppleAuth.vue'

// Google OAuth 配置
const googleConfig = {
  clientId:
    import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com',
  redirectUri: window.location.origin,
}

// Apple OAuth 配置
const appleConfig = {
  clientId: import.meta.env.VITE_APPLE_CLIENT_ID || 'your-apple-client-id',
  redirectUri: window.location.origin,
}

// 使用 OAuth 組合式函數
const googleAuth = useGoogle(googleConfig)
const appleAuth = useApple(appleConfig)
</script>

<template>
  <main class="oauth-demo">
    <h1>OAuth 整合示範</h1>

    <div class="demo-container">
      <!-- Google OAuth 示範 -->
      <div class="oauth-section">
        <h2>
          <svg class="google-icon" viewBox="0 0 24 24">
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
          Google OAuth
        </h2>
        <GoogleAuth />
      </div>

      <!-- Apple OAuth 示範 -->
      <div class="oauth-section">
        <h2>
          <svg class="apple-icon" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
            />
          </svg>
          Apple OAuth
        </h2>
        <AppleAuth />
      </div>
    </div>

    <!-- 狀態比較 -->
    <div class="status-comparison" v-if="googleAuth.isLoggedIn || appleAuth.isLoggedIn">
      <h3>登入狀態比較</h3>
      <div class="comparison-grid">
        <div class="status-card">
          <h4>Google</h4>
          <div class="status-info">
            <p><strong>狀態:</strong> {{ googleAuth.isLoggedIn ? '已登入' : '未登入' }}</p>
            <p v-if="googleAuth.currentUser">
              <strong>姓名:</strong> {{ googleAuth.currentUser.name }}
            </p>
            <p v-if="googleAuth.currentUser">
              <strong>郵件:</strong> {{ googleAuth.currentUser.email }}
            </p>
            <p v-if="googleAuth.currentUser">
              <strong>ID:</strong> {{ googleAuth.currentUser.id.slice(0, 8) }}...
            </p>
          </div>
        </div>

        <div class="status-card">
          <h4>Apple</h4>
          <div class="status-info">
            <p><strong>狀態:</strong> {{ appleAuth.isLoggedIn ? '已登入' : '未登入' }}</p>
            <p v-if="appleAuth.currentUser?.name">
              <strong>姓名:</strong> {{ appleAuth.currentUser.name.firstName }}
              {{ appleAuth.currentUser.name.lastName }}
            </p>
            <p v-if="appleAuth.currentUser?.email">
              <strong>郵件:</strong> {{ appleAuth.currentUser.email }}
            </p>
            <p v-if="appleAuth.currentUser">
              <strong>ID:</strong> {{ appleAuth.currentUser.id.slice(0, 8) }}...
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 開發者資訊 -->
    <div class="developer-info">
      <h3>開發者資訊</h3>
      <div class="info-grid">
        <div class="info-card">
          <h4>實作特色</h4>
          <ul>
            <li>TypeScript 完整支援</li>
            <li>Vue 3 Composition API</li>
            <li>響應式狀態管理</li>
            <li>錯誤處理機制</li>
            <li>自動 Token 管理</li>
            <li>本地狀態持久化</li>
          </ul>
        </div>

        <div class="info-card">
          <h4>技術架構</h4>
          <ul>
            <li><strong>Google:</strong> Identity Services API</li>
            <li><strong>Apple:</strong> Apple ID Services</li>
            <li><strong>狀態管理:</strong> Vue Reactive</li>
            <li><strong>存儲:</strong> localStorage</li>
            <li><strong>類型安全:</strong> TypeScript</li>
          </ul>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.oauth-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.oauth-demo h1 {
  text-align: center;
  margin-bottom: 3rem;
  color: var(--color-heading);
  font-size: 2.5rem;
}

.demo-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
}

@media (max-width: 768px) {
  .demo-container {
    grid-template-columns: 1fr;
  }
}

.oauth-section {
  padding: 2rem;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background: var(--color-background-soft);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.oauth-section h2 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  color: var(--color-heading);
}

.google-icon {
  width: 24px;
  height: 24px;
}

.apple-icon {
  width: 24px;
  height: 24px;
}

.status-comparison {
  margin-bottom: 3rem;
  padding: 2rem;
  background: var(--color-background-mute);
  border-radius: 16px;
  border: 1px solid var(--color-border);
}

.status-comparison h3 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: var(--color-heading);
}

.comparison-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .comparison-grid {
    grid-template-columns: 1fr;
  }
}

.status-card {
  padding: 1.5rem;
  background: var(--color-background-soft);
  border-radius: 12px;
  border: 1px solid var(--color-border);
}

.status-card h4 {
  margin: 0 0 1rem 0;
  color: var(--color-heading);
  font-size: 1.25rem;
}

.status-info p {
  margin: 0.5rem 0;
  color: var(--color-text);
}

.developer-info {
  padding: 2rem;
  background: var(--color-background-mute);
  border-radius: 16px;
  border: 1px solid var(--color-border);
}

.developer-info h3 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: var(--color-heading);
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}

.info-card {
  padding: 1.5rem;
  background: var(--color-background-soft);
  border-radius: 12px;
  border: 1px solid var(--color-border);
}

.info-card h4 {
  margin: 0 0 1rem 0;
  color: var(--color-heading);
  font-size: 1.25rem;
}

.info-card ul {
  margin: 0;
  padding-left: 1.5rem;
}

.info-card li {
  margin: 0.5rem 0;
  color: var(--color-text);
}
</style>
