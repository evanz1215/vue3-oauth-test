# Vue 3 Google OAuth 整合指南

這個項目展示了如何在 Vue 3 應用程式中整合 Google OAuth 登入功能。

## 功能特色

- ✅ 完整的 Google OAuth 2.0 整合
- ✅ 基於 Google Identity Services
- ✅ TypeScript 支援
- ✅ Vue 3 Composition API
- ✅ 響應式狀態管理
- ✅ 錯誤處理
- ✅ 自動 token 管理
- ✅ 自動重新載入時恢復登入狀態

## 設置步驟

### 1. Google Cloud Console 設置

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 創建新專案或選擇現有專案
3. 啟用 Google+ API
4. 前往「憑證」頁面
5. 點擊「建立憑證」> 「OAuth 2.0 用戶端 ID」
6. 選擇「網頁應用程式」
7. 設置授權的 JavaScript 來源：
   - `http://localhost:5173` (開發環境)
   - 你的生產環境網域
8. 設置授權的重新導向 URI：
   - `http://localhost:5173` (開發環境)
   - 你的生產環境網域
9. 複製 Client ID

### 2. 更新配置

在 `src/components/GoogleAuth.vue` 中更新你的 Google Client ID：

```typescript
const googleConfig = {
  clientId: 'your-actual-client-id.apps.googleusercontent.com', // 替換為你的 Client ID
  redirectUri: window.location.origin, // 目前未使用，但保留以備將來擴展
  scope: ['profile', 'email'],
}
```

### 3. 安裝和運行

```bash
# 安裝依賴
pnpm install

# 開發模式運行
pnpm dev
```

## 使用方式

### 基本用法

```vue
<script setup lang="ts">
import { useGoogle } from '@/composables/useGoogle'

const googleConfig = {
  clientId: 'your-client-id.apps.googleusercontent.com',
  redirectUri: window.location.origin, // 保留以備將來使用
}

const { isLoggedIn, currentUser, isLoading, error, signIn, signOut, getAccessToken } =
  useGoogle(googleConfig)
</script>

<template>
  <div>
    <div v-if="isLoading">載入中...</div>
    <div v-else-if="error" class="error">錯誤: {{ error }}</div>
    <button v-else-if="!isLoggedIn" @click="signIn">登入 Google</button>
    <div v-else>
      <p>歡迎, {{ currentUser?.name }}!</p>
      <img :src="currentUser?.picture" :alt="currentUser?.name" />
      <button @click="signOut">登出</button>
    </div>
  </div>
</template>
```

### 配置選項

```typescript
interface GoogleOAuthConfig {
  clientId: string // Google Client ID (必需)
  redirectUri: string // 重定向 URI (保留以備將來使用)
  scope?: string[] // OAuth scopes (可選，預設: ['profile', 'email'])
}
```

### 可用的方法和狀態

```typescript
const {
  // 狀態
  state, // 完整的狀態物件
  isLoggedIn, // 是否已登入
  currentUser, // 當前用戶資訊
  isLoading, // 載入狀態
  error, // 錯誤訊息

  // 方法
  initGoogleAuth, // 初始化 Google 認證
  signIn, // 登入
  signOut, // 登出
  getAccessToken, // 獲取 access token
  checkAuthStatus, // 檢查認證狀態
} = useGoogle(config)
```

### 用戶資訊結構

```typescript
interface GoogleUser {
  id: string // Google 用戶 ID
  email: string // 電子郵件
  name: string // 姓名
  picture: string // 頭像 URL
}
```

## 登入實現

這個實現使用 Google Identity Services 的 Token Client 方式進行認證。

### 工作原理

```typescript
const config = {
  clientId: 'your-client-id',
  redirectUri: 'http://localhost:5173', // 保留以備將來使用
  scope: ['profile', 'email'],
}
```

**特點：**

- 使用彈窗方式進行認證
- 基於 Google Identity Services (GSI)
- 自動處理 token 管理
- 支援自動重新認證

**認證流程：**

1. 載入 Google Identity Services 腳本
2. 初始化 Token Client
3. 用戶點擊登入後彈出 Google 認證窗口
4. 獲取 access token
5. 使用 token 獲取用戶資訊
6. 自動儲存 token 到 localStorage

## 錯誤處理

組件會自動處理常見錯誤：

- Google API 載入失敗
- 網路錯誤
- 用戶取消登入
- Token 無效或過期
- 認證配置錯誤

錯誤會存儲在 `error` 響應式變數中，你可以在 UI 中顯示。

### 錯誤類型

```typescript
interface GoogleOAuthError {
  type: string
  details?: string
}
```

常見錯誤類型：

- `popup_closed_by_user`：用戶關閉了彈窗
- `access_denied`：用戶拒絕授權
- `invalid_client`：無效的 Client ID

## 安全性考量

1. **Client ID 保護：** Client ID 不是機密資訊，可以在前端程式碼中使用
2. **Token 存儲：** Access token 會自動存儲在 localStorage 中
3. **自動恢復：** 頁面重新載入時會自動檢查並恢復登入狀態
4. **HTTPS：** 生產環境請務必使用 HTTPS
5. **Scope 限制：** 只請求應用程式需要的權限

## 故障排除

### 常見問題

1. **"Invalid client" 錯誤**

   - 檢查 Client ID 是否正確
   - 確認網域已在 Google Cloud Console 中授權

2. **彈窗被封鎖**

   - 引導用戶允許彈窗
   - 檢查瀏覽器設定

3. **"Unauthorized client" 錯誤**

   - 檢查授權的 JavaScript 來源設定
   - 確認重新導向 URI 設定正確

4. **CORS 錯誤**
   - 確認在 Google Cloud Console 中正確設定了來源網域

### 開發工具

在瀏覽器開發者工具中查看：

- 網路請求
- 控制台錯誤訊息
- 應用程式標籤中的 localStorage

## 生產環境部署

1. 在 Google Cloud Console 中添加生產環境網域
2. 確保使用 HTTPS
3. 考慮實作適當的錯誤監控
4. 定期檢查 Token 的有效性

## API 參考

### useGoogle 組合式函數

```typescript
function useGoogle(config: GoogleOAuthConfig): {
  // 狀態
  state: GoogleAuthState
  isLoggedIn: ComputedRef<boolean>
  currentUser: ComputedRef<GoogleUser | null>
  isLoading: ComputedRef<boolean>
  error: ComputedRef<string | null>

  // 方法
  initGoogleAuth: () => Promise<void>
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  getAccessToken: () => string | null
  checkAuthStatus: () => Promise<void>
}
```

## 相關連結

- [Google Identity Services](https://developers.google.com/identity/gsi/web)
- [Google OAuth 2.0 文件](https://developers.google.com/identity/protocols/oauth2)
- [Vue 3 文件](https://vuejs.org/)
- [TypeScript 文件](https://www.typescriptlang.org/)
