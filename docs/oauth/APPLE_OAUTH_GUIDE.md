# Apple OAuth 整合指南

這個項目展示了如何在 Vue 3 應用程式中整合 Apple OAuth 登入功能。

## 功能特色

- ✅ 完整的 Apple OAuth 2.0 整合
- ✅ 基於 Apple ID Services
- ✅ TypeScript 支援
- ✅ Vue 3 Composition API
- ✅ 響應式狀態管理
- ✅ 錯誤處理
- ✅ 自動 token 管理
- ✅ 自動重新載入時恢復登入狀態

## 設置步驟

### 1. Apple Developer Console 設置

#### 創建 App ID

1. 前往 [Apple Developer Console](https://developer.apple.com/account/)
2. 選擇「Certificates, Identifiers & Profiles」
3. 點擊「Identifiers」> 「+」按鈕
4. 選擇「App IDs」> 「Continue」
5. 填寫以下資訊：
   - **Description**: 你的應用程式名稱
   - **Bundle ID**: 選擇「Explicit」並輸入反向網域格式，例如 `com.yourcompany.yourapp`
6. 在「Capabilities」中勾選「Sign In with Apple」
7. 點擊「Continue」> 「Register」

#### 創建 Services ID (用於網頁應用程式)

1. 在 Identifiers 頁面點擊「+」按鈕
2. 選擇「Services IDs」> 「Continue」
3. 填寫以下資訊：
   - **Description**: 你的網頁應用程式名稱
   - **Identifier**: 輸入唯一識別符，例如 `com.yourcompany.yourapp.web`
4. 勾選「Sign In with Apple」
5. 點擊「Configure」
6. 在彈出的視窗中：
   - **Primary App ID**: 選擇你剛才創建的 App ID
   - **Web Domain**: 輸入你的網域，例如 `yourapp.com`（開發時可以用 `localhost`）
   - **Return URLs**: 輸入重定向 URL，例如：
     - `http://localhost:5173` (開發環境)
     - `https://yourapp.com` (生產環境)
7. 點擊「Save」> 「Continue」> 「Register」

#### 創建私鑰 (可選，用於後端驗證)

1. 在左側選單選擇「Keys」
2. 點擊「+」按鈕
3. 填寫 Key Name
4. 勾選「Sign In with Apple」
5. 點擊「Configure」選擇你的 Primary App ID
6. 點擊「Save」> 「Continue」> 「Register」
7. 下載私鑰文件 (.p8)，**注意：只能下載一次**

### 2. 更新配置

創建或更新 `.env.local` 文件：

```bash
# Apple OAuth 配置
VITE_APPLE_CLIENT_ID=com.yourcompany.yourapp.web
```

在 `src/components/AppleAuth.vue` 中的配置會自動使用這個環境變數。

### 3. 網域驗證 (生產環境)

對於生產環境部署，你需要在你的網站根目錄放置 Apple 的驗證文件：

1. 在 Apple Developer Console 的 Services ID 配置中下載 `apple-developer-domain-association.txt`
2. 將此文件放在你的網站根目錄：`https://yourdomain.com/.well-known/apple-developer-domain-association.txt`

## 使用方式

### 基本用法

```vue
<script setup lang="ts">
import { useApple } from '@/composables/useApple'

const appleConfig = {
  clientId: 'com.yourcompany.yourapp.web',
  redirectUri: window.location.origin,
  scope: ['name', 'email'],
  usePopup: true,
}

const { isLoggedIn, currentUser, isLoading, error, signIn, signOut, getIdToken } =
  useApple(appleConfig)
</script>

<template>
  <div>
    <div v-if="isLoading">載入中...</div>
    <div v-else-if="error" class="error">錯誤: {{ error }}</div>
    <button v-else-if="!isLoggedIn" @click="signIn">使用 Apple ID 登入</button>
    <div v-else>
      <p>歡迎, {{ currentUser?.name?.firstName }} {{ currentUser?.name?.lastName }}!</p>
      <p v-if="currentUser?.email">{{ currentUser.email }}</p>
      <button @click="signOut">登出</button>
    </div>
  </div>
</template>
```

### 配置選項

```typescript
interface AppleOAuthConfig {
  clientId: string // Apple Services ID (必需)
  redirectUri: string // 重定向 URI (必需)
  scope?: string[] // OAuth scopes (可選，預設: ['name', 'email'])
  state?: string // 狀態參數 (可選)
  usePopup?: boolean // 是否使用彈窗模式 (可選，預設: true)
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
  initAppleAuth, // 初始化 Apple 認證
  signIn, // 登入
  signOut, // 登出
  getIdToken, // 獲取 ID token
  getAuthCode, // 獲取授權碼
  checkAuthStatus, // 檢查認證狀態
} = useApple(config)
```

### 用戶資訊結構

```typescript
interface AppleUser {
  id: string // Apple 用戶 ID
  email?: string // 電子郵件 (可能不提供)
  name?: { // 姓名 (僅在首次登入時提供)
    firstName: string
    lastName: string
  }
  realUserStatus?: number // 真實用戶狀態 (0: 未知, 1: 可能是真實用戶, 2: 很可能是真實用戶)
}
```

## Apple 登入的特殊性

### 1. 用戶資訊限制

- **姓名和電子郵件**：只在用戶首次登入時提供
- **電子郵件隱藏**：用戶可以選擇隱藏真實電子郵件，Apple 會提供代理電子郵件
- **後續登入**：只會收到用戶 ID，需要在本地或後端存儲其他資訊

### 2. Token 類型

- **ID Token (JWT)**：包含用戶的基本識別資訊
- **Authorization Code**：用於後端與 Apple 服務器的進一步通信

### 3. 安全特性

- **Real User Status**：Apple 提供的用戶真實性指標
- **Private Email Relay**：用戶可以使用 Apple 的私人郵件轉發服務

## 錯誤處理

組件會自動處理常見錯誤：

- Apple ID Services 載入失敗
- 用戶取消登入
- 彈窗被封鎖
- 配置錯誤
- Token 過期

### 常見錯誤類型

```typescript
interface AppleOAuthError {
  error: string
  details?: string
}
```

常見錯誤：
- `popup_closed_by_user`：用戶關閉了彈窗
- `user_cancelled_authorize`：用戶取消了授權

## 安全性考量

1. **Client ID 保護**：Services ID 不是機密資訊，可以在前端程式碼中使用
2. **Token 存儲**：ID Token 會自動存儲在 localStorage 中
3. **HTTPS 要求**：生產環境必須使用 HTTPS
4. **網域驗證**：確保在 Apple Developer Console 中正確配置網域
5. **私鑰保護**：如果使用私鑰進行後端驗證，確保私鑰安全存儲

## 故障排除

### 常見問題

1. **"Invalid client" 錯誤**
   - 檢查 Services ID 是否正確
   - 確認網域已在 Apple Developer Console 中授權

2. **彈窗被封鎖**
   - 引導用戶允許彈窗
   - 檢查瀏覽器設定

3. **"Invalid scope" 錯誤**
   - 確認 scope 參數正確 (`name`, `email`)

4. **重定向錯誤**
   - 檢查 Return URLs 設定是否正確
   - 確認網域驗證文件已正確放置

### 開發工具

在瀏覽器開發者工具中查看：
- 網路請求（Apple ID Services）
- 控制台錯誤訊息
- localStorage 中的 token

## 生產環境部署

1. 在 Apple Developer Console 中添加生產環境網域
2. 確保使用 HTTPS
3. 放置網域驗證文件
4. 更新環境變數為生產環境的 Services ID
5. 考慮實作適當的錯誤監控

## 後端整合建議

如果需要在後端驗證 Apple 的 ID Token：

1. 使用 Apple 的公開金鑰驗證 JWT 簽名
2. 檢查 token 的 audience (aud) 是否為你的 Services ID
3. 檢查 token 是否未過期
4. 驗證 issuer (iss) 是否為 `https://appleid.apple.com`

## 相關連結

- [Sign in with Apple 官方文件](https://developer.apple.com/sign-in-with-apple/)
- [Apple ID Services JavaScript 文件](https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_js)
- [Apple Developer Console](https://developer.apple.com/account/)
- [Vue 3 文件](https://vuejs.org/)
