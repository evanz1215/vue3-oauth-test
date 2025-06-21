# LINE OAuth 整合指南

本指南將協助您設定 LINE Login 並整合到 Vue 3 專案中。

## 📋 前置要求

1. **LINE Business Account**：您需要有 LINE Business Account 來創建 Channel
2. **LINE Developers Console 存取權限**
3. **HTTPS 環境**：LINE Login 要求使用 HTTPS（開發環境除外）

## 🚀 快速開始

### 1. 建立 LINE Login Channel

#### 在 LINE Developers Console 中：

1. 前往 [LINE Developers Console](https://developers.line.biz/console/)
2. 登入您的 LINE Business Account
3. 選擇或建立一個 Provider
4. 點選 "Create a channel"
5. 選擇 "LINE Login"
6. 填入 Channel 資訊：
   - **Channel name**：您的應用程式名稱
   - **Channel description**：應用程式描述
   - **App type**：選擇 "Web app"
7. 點選 "Create"

#### 設定 Channel：

1. 在 Channel 基本設定中記錄：

   - **Channel ID**：這就是您的 `VITE_LINE_CLIENT_ID`
   - **Channel secret**：安全存放，用於後端驗證

2. 在 "LINE Login" 分頁中設定：
   - **Callback URL**：`http://localhost:5173/` (開發環境)
   - **Scope**：勾選 `profile` 和 `openid`

### 2. 環境設定

在您的專案中設定環境變數：

```bash
# 複製環境變數範例
cp .env.example .env

# 編輯 .env 檔案
VITE_LINE_CLIENT_ID=你的LINE_Channel_ID
# 注意：不需要 VITE_LINE_CLIENT_SECRET，客戶端密鑰不應在前端使用
```

### 重要安全提醒

⚠️ **前端實作限制**：

- 本實作為前端範例，實際的 token 交換在沒有 `client_secret` 的情況下可能會失敗
- **建議在生產環境中將 token 交換邏輯移至後端**，以保護 `client_secret`
- 前端僅處理授權流程和 token 使用，後端負責安全的 token 管理

### 3. 使用範例

#### 基本用法：

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { useLine } from '@/composables/useLine'

const { isLoggedIn, currentUser, signIn, signOut, isLoading, error, checkAuthStatus } = useLine({
  clientId: import.meta.env.VITE_LINE_CLIENT_ID,
  redirectUri: window.location.origin,
  scope: 'profile openid',
})

// 組件掛載時檢查認證狀態
onMounted(() => {
  checkAuthStatus()
})
</script>

<template>
  <div>
    <div v-if="isLoading" class="loading">
      <p>正在處理 LINE 登入...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>錯誤：{{ error }}</p>
      <button @click="signIn">重試</button>
    </div>

    <div v-else-if="isLoggedIn && currentUser">
      <h3>歡迎，{{ currentUser.displayName }}！</h3>
      <img
        v-if="currentUser.pictureUrl"
        :src="currentUser.pictureUrl"
        :alt="currentUser.displayName"
      />
      <p v-if="currentUser.statusMessage">{{ currentUser.statusMessage }}</p>
      <button @click="signOut">登出 LINE</button>
    </div>

    <div v-else>
      <button @click="signIn">使用 LINE 登入</button>
    </div>
  </div>
</template>
```

## 🔧 組合式函數 API

### `useLine(config)` 參數

| 參數          | 類型   | 必填 | 說明                                     |
| ------------- | ------ | ---- | ---------------------------------------- |
| `clientId`    | string | ✅   | LINE Channel ID                          |
| `redirectUri` | string | ✅   | 授權回調 URI                             |
| `scope`       | string | ❌   | 請求的權限範圍（預設：'profile openid'） |
| `state`       | string | ❌   | 自訂 state 參數                          |

### 回傳值

| 屬性                 | 類型                            | 說明         |
| -------------------- | ------------------------------- | ------------ |
| `isLoading`          | `ComputedRef<boolean>`          | 載入狀態     |
| `isLoggedIn`         | `ComputedRef<boolean>`          | 登入狀態     |
| `currentUser`        | `ComputedRef<LineUser \| null>` | 目前用戶資訊 |
| `error`              | `ComputedRef<string \| null>`   | 錯誤訊息     |
| `signIn`             | `() => Promise<void>`           | 登入函數     |
| `signOut`            | `() => Promise<void>`           | 登出函數     |
| `getAccessToken`     | `() => string \| null`          | 獲取存取令牌 |
| `getRefreshToken`    | `() => string \| null`          | 獲取刷新令牌 |
| `refreshAccessToken` | `() => Promise<string \| null>` | 刷新存取令牌 |
| `checkAuthStatus`    | `() => Promise<void>`           | 檢查認證狀態 |

### LineUser 介面

```typescript
interface LineUser {
  userId: string
  displayName: string
  pictureUrl?: string
  statusMessage?: string
}
```

## 🔐 安全考量

### 重要提醒

1. **Client Secret 保護**：

   - **絕對不要在前端暴露 Channel Secret**
   - Channel Secret 僅用於後端服務器
   - 前端僅使用 Channel ID (Client ID)

2. **Token 交換安全性**：

   - **建議架構**：前端獲取授權碼 → 傳送至後端 → 後端交換 token
   - 本 composable 中的 token 交換僅為示範，生產環境應在後端實作
   - 使用 PKCE (Proof Key for Code Exchange) 提升安全性

3. **HTTPS 要求**：

   - 生產環境必須使用 HTTPS
   - Callback URL 必須使用 HTTPS

4. **State 參數**：

   - 自動生成隨機 state 參數防止 CSRF 攻擊
   - 每次授權請求都會驗證 state

5. **Token 管理**：
   - Access Token 自動存儲在 localStorage
   - 頁面刷新後自動恢復會話
   - 登出時清理所有本地資料

## 🌍 生產環境部署

### 1. 更新 Callback URL

在 LINE Developers Console 中：

1. 前往您的 Channel 設定
2. 在 "LINE Login" 分頁中
3. 新增生產環境的 Callback URL：
   ```
   https://yourdomain.com/
   ```

### 2. 環境變數設定

```bash
# 生產環境
VITE_LINE_CLIENT_ID=你的LINE_Channel_ID
# 注意：client_secret 應在後端服務器中管理，不應在前端暴露
```

### 3. 安全設定

1. **域名驗證**：確保只有您的域名可以使用此 Channel
2. **HTTPS 憑證**：確保網站使用有效的 SSL 憑證
3. **Content Security Policy**：設定適當的 CSP 標頭

## 📚 進階功能

### 自訂範圍 (Scope)

LINE Login 支援以下範圍：

- `profile`：基本個人資料
- `openid`：OpenID Connect 支援
- `email`：電子郵件地址（需要額外申請）

```javascript
const lineAuth = useLine({
  clientId: 'your-channel-id',
  redirectUri: window.location.origin,
  scope: 'profile openid email', // 包含電子郵件
})
```

### 錯誤處理

```vue
<script setup lang="ts">
const { error } = useLine(config)

// 監聽錯誤
watch(error, (newError) => {
  if (newError) {
    console.error('LINE OAuth 錯誤:', newError)
    // 顯示用戶友善的錯誤訊息
  }
})
</script>
```

### 手動會話恢復

```javascript
// 手動檢查並恢復會話
await checkAuthStatus()
if (isLoggedIn.value) {
  console.log('會話已恢復')
} else {
  console.log('無有效會話')
}

// 獲取存取令牌
const accessToken = getAccessToken()
if (accessToken) {
  console.log('已有有效的存取令牌')
}

// 刷新存取令牌
const newToken = await refreshAccessToken()
if (newToken) {
  console.log('令牌刷新成功')
}
```

## 🐛 常見問題

### Q: 授權後頁面跳轉失敗

**A**: 檢查 Callback URL 設定：

- 確保 URL 完全匹配（包含協議、域名、埠號）
- 開發環境使用 `http://localhost:5173/`
- 生產環境使用 `https://yourdomain.com/`

### Q: 無法取得用戶資料

**A**: 檢查權限範圍：

- 確保 Channel 設定中已勾選 `profile`
- 檢查 `scope` 參數是否包含 `profile`

### Q: Token 過期問題

**A**: TOKEN 管理：

- Access Token 有效期通常為 30 天
- 組合式函數會自動檢查並清理過期 Token
- 無需手動處理 Token 更新

### Q: 本地開發 HTTPS 問題

**A**: 開發環境設定：

- LINE Login 在 localhost 允許 HTTP
- 但其他域名必須使用 HTTPS
- 考慮使用 ngrok 進行本地 HTTPS 測試

## 📖 相關資源

- [LINE Developers 官方文檔](https://developers.line.biz/en/docs/line-login/)
- [LINE Login API 參考](https://developers.line.biz/en/reference/line-login/)
- [OAuth 2.0 規範](https://tools.ietf.org/html/rfc6749)

## 🤝 貢獻

如果您發現問題或有改進建議，歡迎：

1. 提交 Issue
2. 發送 Pull Request
3. 改進文檔

---

⚡ **提示**：LINE Login 在亞洲地區特別受歡迎，建議針對亞洲用戶的應用程式集成此功能。
