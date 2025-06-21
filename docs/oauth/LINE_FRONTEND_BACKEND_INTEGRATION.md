# 前端與後端 LINE OAuth 整合範例

本文檔展示如何使用 `useLine` composable 與後端 API 配合完成完整的 LINE OAuth 流程。

## 🔄 完整流程

### 1. 前端：發起授權

```vue
<script setup lang="ts">
import { useLine } from '@/composables/useLine'

const { signIn, getAuthCode, setUser, isLoggedIn, currentUser } = useLine({
  clientId: import.meta.env.VITE_LINE_CLIENT_ID,
  redirectUri: window.location.origin,
  scope: 'profile openid',
})

// 開始登入流程
const handleLogin = () => {
  signIn()
}
</script>
```

### 2. 後端：處理授權碼交換

當用戶授權成功後，前端會自動儲存授權碼。接下來需要將授權碼傳送給後端：

```javascript
// 獲取授權碼並傳送給後端
const completeLogin = async () => {
  const authCode = getAuthCode()
  if (!authCode) {
    console.error('找不到授權碼')
    return
  }

  try {
    // 調用後端 API 完成登入
    const response = await fetch('/api/auth/line/callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: authCode,
        redirectUri: window.location.origin,
      }),
    })

    const result = await response.json()

    if (response.ok) {
      // 設定用戶資訊
      setUser({
        userId: result.user.userId,
        displayName: result.user.displayName,
        pictureUrl: result.user.pictureUrl,
        statusMessage: result.user.statusMessage,
      })

      // 清除授權碼
      clearAuthCode()

      console.log('登入成功!')
    } else {
      console.error('登入失敗:', result.error)
    }
  } catch (error) {
    console.error('API 調用失敗:', error)
  }
}
```

### 3. 後端 API 範例 (Node.js/Express)

```javascript
// POST /api/auth/line/callback
app.post('/api/auth/line/callback', async (req, res) => {
  const { code, redirectUri } = req.body

  try {
    // 1. 交換 access token
    const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: process.env.LINE_CLIENT_ID,
        client_secret: process.env.LINE_CLIENT_SECRET,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      return res.status(400).json({ error: 'Token exchange failed' })
    }

    // 2. 獲取用戶資料
    const profileResponse = await fetch('https://api.line.me/v2/profile', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    const userProfile = await profileResponse.json()

    if (!profileResponse.ok) {
      return res.status(400).json({ error: 'Failed to fetch user profile' })
    }

    // 3. 儲存用戶資料到資料庫 (optional)
    // await saveUserToDatabase(userProfile)

    // 4. 生成 JWT token (optional)
    // const jwtToken = generateJwtToken(userProfile)

    // 5. 回傳用戶資料
    res.json({
      user: {
        userId: userProfile.userId,
        displayName: userProfile.displayName,
        pictureUrl: userProfile.pictureUrl,
        statusMessage: userProfile.statusMessage,
      },
      // token: jwtToken, // optional
    })
  } catch (error) {
    console.error('LINE OAuth error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})
```

## 🔗 完整的 Vue 組件範例

```vue
<template>
  <div class="line-auth">
    <!-- 載入狀態 -->
    <div v-if="isLoading" class="loading">
      <p>正在處理 LINE 登入...</p>
    </div>

    <!-- 錯誤狀態 -->
    <div v-else-if="error" class="error">
      <p>錯誤：{{ error }}</p>
      <button @click="handleLogin">重試</button>
    </div>

    <!-- 已登入狀態 -->
    <div v-else-if="isLoggedIn && currentUser" class="logged-in">
      <h3>歡迎，{{ currentUser.displayName }}！</h3>
      <img
        v-if="currentUser.pictureUrl"
        :src="currentUser.pictureUrl"
        :alt="currentUser.displayName"
      />
      <button @click="signOut">登出</button>
    </div>

    <!-- 未登入狀態 -->
    <div v-else class="not-logged-in">
      <button @click="handleLogin">使用 LINE 登入</button>
    </div>

    <!-- 需要完成登入 -->
    <div v-if="hasAuthCode && !isLoggedIn" class="complete-login">
      <p>已獲取授權，正在完成登入流程...</p>
      <button @click="completeLogin">完成登入</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useLine } from '@/composables/useLine'

const {
  signIn,
  signOut,
  setUser,
  getAuthCode,
  clearAuthCode,
  checkAuthStatus,
  isLoggedIn,
  currentUser,
  isLoading,
  error,
} = useLine({
  clientId: import.meta.env.VITE_LINE_CLIENT_ID,
  redirectUri: window.location.origin,
  scope: 'profile openid',
})

// 檢查是否有授權碼待處理
const hasAuthCode = computed(() => !!getAuthCode())

// 開始登入流程
const handleLogin = () => {
  signIn()
}

// 完成登入流程
const completeLogin = async () => {
  const authCode = getAuthCode()
  if (!authCode) return

  try {
    const response = await fetch('/api/auth/line/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: authCode,
        redirectUri: window.location.origin,
      }),
    })

    const result = await response.json()

    if (response.ok) {
      setUser(result.user)
      clearAuthCode()
    } else {
      console.error('登入失敗:', result.error)
    }
  } catch (err) {
    console.error('API 調用失敗:', err)
  }
}

// 組件掛載時檢查狀態
onMounted(() => {
  checkAuthStatus()

  // 如果有授權碼，自動完成登入
  if (hasAuthCode.value && !isLoggedIn.value) {
    completeLogin()
  }
})
</script>
```

## 🔐 安全注意事項

1. **授權碼時效性**：授權碼有效期很短（通常 10 分鐘），應立即處理
2. **客戶端密鑰**：絕對不要在前端暴露 `client_secret`
3. **HTTPS 要求**：生產環境必須使用 HTTPS
4. **狀態驗證**：後端應驗證 `state` 參數防止 CSRF 攻擊

## 📚 相關檔案

- `src/composables/useLine.ts` - 前端 OAuth 處理
- `backend/routes/auth.js` - 後端 API 處理 (需自行實作)
- `LINE_OAUTH_GUIDE.md` - 完整設定指南
