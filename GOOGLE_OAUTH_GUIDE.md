# Vue 3 Google OAuth 整合指南

這個項目展示了如何在 Vue 3 應用程式中整合 Google OAuth 登入功能。

## 功能特色

- ✅ 完整的 Google OAuth 2.0 整合
- ✅ 支援彈窗和重定向兩種登入模式
- ✅ TypeScript 支援
- ✅ Vue 3 Composition API
- ✅ 響應式狀態管理
- ✅ 錯誤處理
- ✅ 自動 token 管理

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
  redirectUri: window.location.origin,
  scope: ['profile', 'email'],
  usePopup: true, // 或 false 使用重定向模式
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
  redirectUri: window.location.origin,
  usePopup: true,
}

const { isLoggedIn, currentUser, isLoading, error, signIn, signOut, getAccessToken } =
  useGoogle(googleConfig)
</script>

<template>
  <div>
    <button v-if="!isLoggedIn" @click="signIn">登入</button>
    <div v-else>
      <p>歡迎, {{ currentUser?.name }}!</p>
      <button @click="signOut">登出</button>
    </div>
  </div>
</template>
```

### 配置選項

```typescript
interface GoogleOAuthConfig {
  clientId: string // Google Client ID (必需)
  redirectUri: string // 重定向 URI (必需)
  scope?: string[] // OAuth scopes (可選，預設: ['profile', 'email'])
  usePopup?: boolean // 是否使用彈窗模式 (可選，預設: false)
}
```

### 可用的方法和狀態

```typescript
const {
  // 狀態
  isLoggedIn, // 是否已登入
  currentUser, // 當前用戶資訊
  isLoading, // 載入狀態
  error, // 錯誤訊息

  // 方法
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

## 登入模式

### 彈窗模式 (推薦)

```typescript
const config = {
  clientId: 'your-client-id',
  redirectUri: 'http://localhost:5173',
  usePopup: true,
}
```

**優點：**

- 用戶不會離開當前頁面
- 更好的用戶體驗
- 即時反馈

**缺點：**

- 可能被彈窗封鎖器阻擋
- 在某些行動裝置上可能有問題

### 重定向模式

```typescript
const config = {
  clientId: 'your-client-id',
  redirectUri: 'http://localhost:5173',
  usePopup: false,
}
```

**優點：**

- 更可靠，不會被彈窗封鎖器影響
- 在所有裝置上都能正常工作

**缺點：**

- 頁面會重新載入
- 需要處理重定向回來的狀態

## 錯誤處理

組件會自動處理常見錯誤：

- 網路錯誤
- 用戶取消登入
- API 載入失敗
- 認證失敗

錯誤會存儲在 `error` 響應式變數中，你可以在 UI 中顯示。

## 安全性考量

1. **Client ID 保護：** Client ID 不是機密資訊，可以在前端程式碼中使用
2. **Token 存儲：** Access token 會自動存儲在 localStorage 中
3. **HTTPS：** 生產環境請務必使用 HTTPS
4. **Scope 限制：** 只請求應用程式需要的權限

## 故障排除

### 常見問題

1. **"Invalid client" 錯誤**

   - 檢查 Client ID 是否正確
   - 確認網域已在 Google Cloud Console 中授權

2. **彈窗被封鎖**

   - 改用重定向模式
   - 或者引導用戶允許彈窗

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
2. 更新 `redirectUri` 為生產環境 URL
3. 確保使用 HTTPS
4. 考慮實作適當的錯誤監控

## 相關連結

- [Google OAuth 2.0 文件](https://developers.google.com/identity/protocols/oauth2)
- [Google API JavaScript 客戶端](https://developers.google.com/api-client-library/javascript)
- [Vue 3 文件](https://vuejs.org/)
