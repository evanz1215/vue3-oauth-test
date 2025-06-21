import { reactive, computed } from 'vue'

export interface LineOAuthConfig {
  clientId: string
  redirectUri: string
  scope?: string
  state?: string
  usePopup?: boolean
}

export interface LineUser {
  userId: string
  displayName: string
  pictureUrl?: string
  statusMessage?: string
}

export interface LineAuthState {
  user: LineUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// LINE OAuth 相關的類型定義
export interface LineOAuthError {
  error: string
  error_description?: string
  state?: string
}

// 生成隨機狀態字符串
function generateState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// 生成 LINE OAuth 授權 URL
function generateLineAuthUrl(config: LineOAuthConfig): string {
  const baseUrl = 'https://access.line.me/oauth2/v2.1/authorize'
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scope || 'profile openid',
    state: config.state || generateState(),
  })

  return `${baseUrl}?${params.toString()}`
}

export function useLine(config: LineOAuthConfig) {
  const state = reactive<LineAuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  })

  // 處理登入成功 - 僅處理授權碼，實際 token 交換應在後端進行
  const handleAuthSuccess = (code: string): void => {
    console.log('🎉 LINE 認證成功，已獲取授權碼', { code })

    // 儲存授權碼供後端使用
    localStorage.setItem('line_auth_code', code)
    localStorage.setItem('line_auth_timestamp', Date.now().toString())

    state.error = null
    console.log('✅ LINE 授權碼已保存，請調用後端 API 完成登入流程')
  }

  // 設定用戶資訊 - 由後端驗證後調用
  const setUser = (user: LineUser): void => {
    state.user = user
    state.isAuthenticated = true
    state.error = null

    // 儲存用戶資訊
    localStorage.setItem('line_user_info', JSON.stringify(user))
    console.log('✅ LINE 用戶資訊已設置')
  }

  // 獲取保存的授權碼
  const getAuthCode = (): string | null => {
    return localStorage.getItem('line_auth_code')
  }

  // 清除授權碼
  const clearAuthCode = (): void => {
    localStorage.removeItem('line_auth_code')
    localStorage.removeItem('line_auth_timestamp')
  }

  // 檢查 URL 中的授權回調
  const handleAuthCallback = (): boolean => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const error = urlParams.get('error')
    const errorDescription = urlParams.get('error_description')

    if (error) {
      state.error = `LINE 授權失敗: ${errorDescription || error}`
      console.error('❌ LINE OAuth 錯誤:', { error, errorDescription })
      return false
    }

    if (code) {
      try {
        state.isLoading = true
        handleAuthSuccess(code)

        // 清理 URL 參數
        const newUrl = window.location.origin + window.location.pathname
        window.history.replaceState({}, document.title, newUrl)

        return true
      } catch (error) {
        console.error('❌ 處理 LINE 授權回調失敗:', error)
        return false
      } finally {
        state.isLoading = false
      }
    }

    return false
  }

  // 初始化 LINE OAuth
  const initLineAuth = (): void => {
    try {
      state.isLoading = true
      state.error = null

      console.log('🚀 開始 LINE OAuth 初始化...')

      // 檢查 Client ID
      if (!config.clientId || config.clientId === 'your-line-client-id') {
        throw new Error('請設置有效的 LINE Client ID')
      }

      console.log('✅ LINE Client ID 驗證通過')

      // 檢查是否是授權回調
      const callbackHandled = handleAuthCallback()
      if (callbackHandled) {
        console.log('✅ 處理 LINE 授權回調完成')
        return
      }

      // 檢查是否有存儲的用戶資訊
      const savedUserInfo = localStorage.getItem('line_user_info')

      if (savedUserInfo) {
        console.log('🔍 發現已保存的用戶資訊')
        try {
          state.user = JSON.parse(savedUserInfo)
          state.isAuthenticated = true
          console.log('✅ 使用已保存的 LINE 用戶資訊')
        } catch (parseError) {
          console.log('⚠️ 解析已保存的用戶資訊失敗，已清除:', parseError)
          localStorage.removeItem('line_user_info')
        }
      }

      console.log('🎉 LINE OAuth 初始化完成!')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'LINE 初始化失敗'
      state.error = errorMessage
      console.error('❌ LINE OAuth 初始化錯誤:', error)
    } finally {
      state.isLoading = false
    }
  }

  // 登入
  const signIn = async (): Promise<void> => {
    try {
      state.isLoading = true
      state.error = null

      console.log('🔐 開始 LINE 登入流程...')

      // 檢查配置
      if (!config.clientId) {
        throw new Error('LINE Client ID 未配置')
      }

      // 生成授權 URL
      const authUrl = generateLineAuthUrl(config)

      if (config.usePopup) {
        // 使用彈窗模式
        const popup = window.open(
          authUrl,
          'line-oauth',
          'width=500,height=600,scrollbars=yes,resizable=yes',
        )

        if (!popup) {
          throw new Error('無法開啟彈窗，請檢查瀏覽器設定')
        }

        // 監聽彈窗關閉或成功
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed)
            state.isLoading = false
            console.log('ℹ️ 用戶關閉了 LINE 登入彈窗')
          }
        }, 1000)

        // 監聽來自彈窗的消息
        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return

          if (event.data.type === 'LINE_AUTH_SUCCESS') {
            clearInterval(checkClosed)
            popup.close()
            window.removeEventListener('message', handleMessage)
            handleAuthSuccess(event.data.code)
            state.isLoading = false
          } else if (event.data.type === 'LINE_AUTH_ERROR') {
            clearInterval(checkClosed)
            popup.close()
            window.removeEventListener('message', handleMessage)
            state.error = `LINE 授權失敗: ${event.data.error}`
            state.isLoading = false
          }
        }

        window.addEventListener('message', handleMessage)
      } else {
        // 使用重定向模式
        window.location.href = authUrl
      }
    } catch (error) {
      state.error = error instanceof Error ? error.message : 'LINE 登入失敗'
      console.error('❌ LINE 登入錯誤:', error)
      state.isLoading = false
    }
  }

  // 登出
  const signOut = (): void => {
    // 清除狀態
    state.user = null
    state.isAuthenticated = false
    state.error = null

    // 清除本地存儲
    localStorage.removeItem('line_user_info')
    localStorage.removeItem('line_auth_code')
    localStorage.removeItem('line_auth_timestamp')

    console.log('✅ LINE 登出成功')
  }

  // 檢查登入狀態
  const checkAuthStatus = (): void => {
    initLineAuth()
  }

  // Computed properties
  const isLoggedIn = computed(() => state.isAuthenticated)
  const currentUser = computed(() => state.user)
  const isLoading = computed(() => state.isLoading)
  const error = computed(() => state.error)

  return {
    // State
    state,
    isLoggedIn,
    currentUser,
    isLoading,
    error,

    // Methods
    initLineAuth,
    signIn,
    signOut,
    setUser,
    getAuthCode,
    clearAuthCode,
    checkAuthStatus,
  }
}
