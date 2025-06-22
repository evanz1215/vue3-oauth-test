# Facebook OAuth 整合指南

本指南將協助您在 Vue 3 應用程式中整合 Facebook OAuth 登入功能。

## 📋 目錄

- [前置需求](#前置需求)
- [Facebook 應用程式設置](#facebook-應用程式設置)
- [環境變數配置](#環境變數配置)
- [基本使用方式](#基本使用方式)
- [進階配置](#進階配置)
- [API 參考](#api-參考)
- [故障排除](#故障排除)
- [安全考量](#安全考量)

## 🚀 前置需求

在開始之前，請確保您擁有：

- Vue 3 應用程式
- TypeScript 支援 (可選但建議)
- HTTPS 環境 (Facebook 要求)
- Facebook 開發者帳號

## 🔧 Facebook 應用程式設置

### 1. 建立 Facebook 應用程式

1. 前往 [Facebook for Developers](https://developers.facebook.com/)
2. 點擊「我的應用程式」→「建立應用程式」
3. 選擇「消費者」類型
4. 填寫應用程式名稱和聯絡電子郵件
5. 點擊「建立應用程式 ID」

### 2. 設置 Facebook 登入

1. 在應用程式控制台中，點擊「加入產品」
2. 找到「Facebook 登入」，點擊「設定」
3. 選擇「網路」平台
4. 在「有效的 OAuth 重新導向 URI」中加入：
   ```
   https://yourdomain.com/
   https://localhost:3000/
   ```

### 3. 基本設定

在「設定」→「基本」中：

- **應用程式網域**：設定您的網域
- **隱私權政策網址**：必填
- **使用條款網址**：建議填寫

### 4. Facebook 登入設定

在「Facebook 登入」→「設定」中：

- **用戶端 OAuth 登入**：啟用
- **網路 OAuth 登入**：啟用
- **有效的 OAuth 重新導向 URI**：加入您的回調網址

## ⚙️ 環境變數配置

在您的 `.env` 檔案中加入 Facebook 應用程式 ID：

```env
# Facebook OAuth 設定
VITE_FACEBOOK_APP_ID=your_facebook_app_id_here
```

**注意**：請勿將應用程式密鑰暴露在前端程式碼中！

## 📝 基本使用方式

### 1. 在組件中使用

```vue
<template>
  <div>
    <FacebookAuth @status-change="handleFacebookStatusChange" />
  </div>
</template>

<script setup lang="ts">
import FacebookAuth from '@/components/FacebookAuth.vue'

const handleFacebookStatusChange = (status) => {
  console.log('Facebook 狀態變化:', status)
  if (status.isLoggedIn) {
    console.log('使用者已登入:', status.currentUser)
  }
}
</script>
```

### 2. 直接使用 Composable

```vue
<script setup lang="ts">
import { useFacebook } from '@/composables/useFacebook'

const facebookConfig = {
  appId: import.meta.env.VITE_FACEBOOK_APP_ID,
  redirectUri: window.location.origin,
  scope: 'email,public_profile',
}

const { isLoggedIn, currentUser, signIn, signOut } = useFacebook(facebookConfig)

// 登入
const handleLogin = async () => {
  try {
    await signIn()
    console.log('登入成功:', currentUser.value)
  } catch (error) {
    console.error('登入失敗:', error)
  }
}

// 登出
const handleLogout = async () => {
  await signOut()
  console.log('已登出')
}
</script>
```

## 🔧 進階配置

### 自訂配置選項

```typescript
const facebookConfig = {
  appId: 'your-app-id',
  redirectUri: 'https://yourdomain.com',
  scope: 'email,public_profile,user_friends', // 請求的權限
  version: 'v18.0', // Facebook API 版本
  usePopup: true, // 使用彈窗模式
}
```

### 可用的權限範圍

- `public_profile`：基本公開資料
- `email`：電子郵件地址
- `user_friends`：朋友清單
- `user_photos`：相片存取權限
- `user_posts`：貼文存取權限

**注意**：某些權限需要 Facebook 審核才能在正式環境中使用。

## 📚 API 參考

### `useFacebook(config)`

#### 參數

- `config.appId` (string)：Facebook 應用程式 ID
- `config.redirectUri` (string)：登入後重導向的 URI
- `config.scope` (string, 可選)：請求的權限，預設為 `'email,public_profile'`
- `config.version` (string, 可選)：Facebook API 版本，預設為 `'v18.0'`
- `config.usePopup` (boolean, 可選)：是否使用彈窗模式，預設為 `true`

#### 回傳值

```typescript
{
  // 狀態
  isLoggedIn: ComputedRef<boolean>
  currentUser: ComputedRef<FacebookUser | null>
  isLoading: ComputedRef<boolean>
  error: ComputedRef<string | null>

  // 方法
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  checkAuthStatus: () => Promise<void>
}
```

#### FacebookUser 類型

```typescript
interface FacebookUser {
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
}
```

## 🐛 故障排除

### 常見問題

#### 1. "App Not Set Up: This app is still in development mode"

**解決方案**：

- 確保您的應用程式已設定為「上線」模式
- 在 Facebook 開發者控制台中檢查應用程式狀態

#### 2. "Invalid OAuth redirect URI"

**解決方案**：

- 檢查 Facebook 應用程式設定中的「有效的 OAuth 重新導向 URI」
- 確保 URI 完全匹配（包括協議和埠號）

#### 3. "This app is in development mode"

**解決方案**：

- 將測試使用者加入應用程式的「角色」設定中
- 或將應用程式切換到「上線」模式

#### 4. SDK 載入失敗

**解決方案**：

- 檢查網路連線
- 確保沒有廣告封鎖程式干擾
- 檢查 CSP 設定

### 除錯技巧

1. **啟用詳細日誌**：

   ```typescript
   const { signIn } = useFacebook(config)

   // 監聽錯誤
   watch(error, (newError) => {
     if (newError) {
       console.error('Facebook 錯誤:', newError)
     }
   })
   ```

2. **檢查 Facebook SDK 狀態**：

   ```javascript
   console.log('FB SDK 載入狀態:', !!window.FB)
   ```

3. **驗證配置**：
   ```typescript
   console.log('Facebook 配置:', {
     appId: config.appId,
     redirectUri: config.redirectUri,
     scope: config.scope,
   })
   ```

## 🔒 安全考量

### 1. 應用程式密鑰安全

- **永遠不要**在前端程式碼中暴露應用程式密鑰
- 應用程式密鑰只能在後端使用

### 2. HTTPS 要求

- Facebook OAuth 要求 HTTPS 連線
- 確保您的正式環境使用 SSL 憑證

### 3. 權限最小化原則

- 只請求應用程式真正需要的權限
- 避免請求過多不必要的權限

### 4. 資料處理

- 遵守 Facebook 的資料使用政策
- 妥善處理使用者的個人資料

### 5. Token 安全

- Access Token 會自動由 Facebook SDK 管理
- 不要將 Token 儲存在不安全的地方

## 📱 行動裝置支援

Facebook OAuth 在行動裝置上會自動切換到適當的登入方式：

- **iOS Safari**：使用 Facebook 應用程式或網頁登入
- **Android Chrome**：使用 Facebook 應用程式或網頁登入
- **其他瀏覽器**：使用網頁登入

## 🔄 與其他 OAuth 提供商整合

本 Facebook OAuth 實作與其他 OAuth 提供商（Google、Apple、LINE）使用相同的架構：

```vue
<template>
  <div class="oauth-providers">
    <GoogleAuth @status-change="handleGoogleStatusChange" />
    <AppleAuth @status-change="handleAppleStatusChange" />
    <FacebookAuth @status-change="handleFacebookStatusChange" />
    <LineAuth @status-change="handleLineStatusChange" />
  </div>
</template>
```

## 📖 延伸閱讀

- [Facebook for Developers](https://developers.facebook.com/)
- [Facebook 登入文件](https://developers.facebook.com/docs/facebook-login/)
- [Facebook Graph API](https://developers.facebook.com/docs/graph-api/)
- [權限參考](https://developers.facebook.com/docs/permissions/reference)

## ❓ 常見問題

**Q: 可以在本機開發環境中測試嗎？**
A: 可以，但需要使用 HTTPS 或在 Facebook 設定中加入 `localhost` 作為有效網域。

**Q: 如何獲取更多使用者資訊？**
A: 修改 `scope` 參數並在 `fetchUserInfo` 函數中加入更多欄位。

**Q: 支援伺服器端渲染 (SSR) 嗎？**
A: 是的，但需要確保 Facebook SDK 只在客戶端載入。

**Q: 如何處理使用者拒絕權限？**
A: 組件會自動處理使用者取消登入的情況，不會顯示錯誤訊息。

## 🆘 技術支援

如果您遇到問題：

1. 檢查 [故障排除](#故障排除) 章節
2. 查看瀏覽器開發者工具的錯誤訊息
3. 參考 Facebook 開發者文件
4. 在專案中建立 Issue

---

**更新日期**：2024年12月

**版本**：1.0.0
