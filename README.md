# Vue 3 OAuth 整合測試

這個專案展示了如何在 Vue 3 應用程式中整合 Google OAuth、Apple OAuth 和 LINE OAuth 登入功能。

## 功能特色

- ✅ Google OAuth 2.0 整合
- ✅ Apple OAuth 2.0 整合
- ✅ LINE OAuth 2.0 整合
- ✅ TypeScript 支援
- ✅ Vue 3 Composition API
- ✅ 響應式狀態管理
- ✅ 錯誤處理
- ✅ 自動 token 管理
- ✅ 現代化響應式設計

## 快速開始

### 1. 克隆專案

```bash
git clone <repository-url>
cd vue3-oauth-test
```

### 2. 安裝依賴

```bash
pnpm install
```

### 3. 設置環境變數

複製 `.env.example` 到 `.env.local` 並填入你的配置：

```bash
cp .env.example .env.local
```

編輯 `.env.local`：

```bash
# Google OAuth 配置
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Apple OAuth 配置
VITE_APPLE_CLIENT_ID=com.yourcompany.yourapp.web

# LINE OAuth 配置
VITE_LINE_CLIENT_ID=your-line-client-id
```

### 4. 運行開發服務器

```bash
pnpm dev
```

## OAuth 設置指南

### Google OAuth

請參考 [GOOGLE_OAUTH_GUIDE.md](./GOOGLE_OAUTH_GUIDE.md) 了解詳細的 Google OAuth 設置步驟。

### Apple OAuth

請參考 [APPLE_OAUTH_GUIDE.md](./APPLE_OAUTH_GUIDE.md) 了解詳細的 Apple OAuth 設置步驟。

### LINE OAuth

請參考 [LINE_OAUTH_GUIDE.md](./LINE_OAUTH_GUIDE.md) 了解詳細的 LINE OAuth 設置步驟。

### Apple OAuth

請參考 [APPLE_OAUTH_GUIDE.md](./APPLE_OAUTH_GUIDE.md) 了解詳細的 Apple OAuth 設置步驟。

## 使用範例

### Google OAuth

```vue
<script setup lang="ts">
import { useGoogle } from '@/composables/useGoogle'

const googleConfig = {
  clientId: 'your-google-client-id.apps.googleusercontent.com',
  redirectUri: window.location.origin,
}

const { isLoggedIn, currentUser, signIn, signOut } = useGoogle(googleConfig)
</script>
```

### Apple OAuth

```vue
<script setup lang="ts">
import { useApple } from '@/composables/useApple'

const appleConfig = {
  clientId: 'com.yourcompany.yourapp.web',
  redirectUri: window.location.origin,
}

const { isLoggedIn, currentUser, signIn, signOut } = useApple(appleConfig)
</script>
```

### LINE OAuth

```vue
<script setup lang="ts">
import { useLine } from '@/composables/useLine'

const lineConfig = {
  clientId: 'your-line-client-id',
  redirectUri: window.location.origin,
  scope: 'profile openid',
}

const { isLoggedIn, currentUser, signIn, signOut } = useLine(lineConfig)
</script>
```

## 架構說明

### 組合式函數設計

每個 OAuth 提供商都有對應的組合式函數：

- `useGoogle(config)` - Google OAuth 整合
- `useApple(config)` - Apple OAuth 整合
- `useLine(config)` - LINE OAuth 整合

所有組合式函數都提供一致的 API：

```typescript
interface OAuthComposable {
  isLoading: ComputedRef<boolean>
  isLoggedIn: ComputedRef<boolean>
  currentUser: ComputedRef<User | null>
  error: ComputedRef<string | null>
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}
```

### 特色功能

1. **自動會話恢復**：頁面刷新後自動恢復登入狀態
2. **錯誤處理**：統一的錯誤處理機制
3. **響應式狀態**：基於 Vue 3 響應式系統
4. **TypeScript 支援**：完整的類型定義
5. **安全性**：遵循 OAuth 2.0 安全最佳實踐

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run End-to-End Tests with [Cypress](https://www.cypress.io/)

```sh
npm run test:e2e:dev
```

This runs the end-to-end tests against the Vite development server.
It is much faster than the production build.

But it's still recommended to test the production build with `test:e2e` before deploying (e.g. in CI environments):

```sh
npm run build
npm run test:e2e
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
