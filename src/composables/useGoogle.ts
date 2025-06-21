import { reactive, computed } from 'vue'

export interface GoogleOAuthConfig {
  clientId: string
  redirectUri: string
  scope?: string[]
  usePopup?: boolean
}

export interface GoogleUser {
  id: string
  email: string
  name: string
  picture: string
}

export interface GoogleAuthState {
  user: GoogleUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// 全域狀態
let googleApiReady = false
let initPromise: Promise<void> | null = null

// 載入 Google Identity Services
async function loadGoogleIdentityServices(): Promise<void> {
  if (googleApiReady) {
    return Promise.resolve()
  }

  if (initPromise) {
    return initPromise
  }

  initPromise = new Promise((resolve, reject) => {
    // 檢查是否已經載入
    if (window.google?.accounts) {
      googleApiReady = true
      resolve()
      return
    }

    // 檢查是否已經有 script 標籤
    const existingScript = document.querySelector('script[src*="accounts.google.com/gsi/client"]')
    if (existingScript) {
      const checkReady = () => {
        if (window.google?.accounts) {
          googleApiReady = true
          resolve()
        } else {
          setTimeout(checkReady, 100)
        }
      }
      checkReady()
      return
    }

    // 創建新的 script 標籤
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true

    script.onload = () => {
      const checkReady = () => {
        if (window.google?.accounts) {
          googleApiReady = true
          resolve()
        } else {
          setTimeout(checkReady, 50)
        }
      }
      checkReady()
    }

    script.onerror = () => {
      reject(new Error('無法載入 Google Identity Services'))
    }

    // 15 秒超時
    setTimeout(() => {
      reject(new Error('Google Identity Services 載入超時'))
    }, 15000)

    document.head.appendChild(script)
  })

  return initPromise
}

export function useGoogle(config: GoogleOAuthConfig) {
  const state = reactive<GoogleAuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  })

  const defaultScopes = ['profile', 'email']
  const scopes = config.scope || defaultScopes

  let tokenClient: any = null
  // 處理登入成功
  const handleAuthSuccess = async (response: any): Promise<void> => {
    try {
      console.log('🎉 認證成功，獲取用戶資訊...', response)

      // 使用 access token 獲取用戶資訊
      const userInfoResponse = await fetch(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${response.access_token}`,
      )

      if (!userInfoResponse.ok) {
        throw new Error('無法獲取用戶資訊')
      }

      const userInfo = await userInfoResponse.json()

      state.user = {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
      }
      state.isAuthenticated = true
      state.error = null

      // 儲存 access token
      localStorage.setItem('google_access_token', response.access_token)
      console.log('✅ 用戶資訊設置完成')
    } catch (error) {
      state.error = '獲取用戶資訊失敗'
      console.error('❌ 處理認證成功時發生錯誤:', error)
    } finally {
      state.isLoading = false
    }
  }

  // 初始化 Google Identity Services
  const initGoogleAuth = async (): Promise<void> => {
    try {
      state.isLoading = true
      state.error = null

      console.log('🚀 開始 Google Identity Services 初始化...')

      // 檢查 Client ID
      if (
        !config.clientId ||
        config.clientId === 'your-google-client-id.apps.googleusercontent.com'
      ) {
        throw new Error('請設置有效的 Google Client ID')
      }

      console.log('✅ Client ID 驗證通過')

      // 載入 Google Identity Services
      await loadGoogleIdentityServices()
      console.log('✅ Google Identity Services 載入完成')

      // 初始化 Token Client
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: config.clientId,
        scope: scopes.join(' '),
        callback: handleAuthSuccess,
        error_callback: (error: any) => {
          console.error('❌ OAuth 錯誤:', error)
          state.error = `認證失敗: ${error.type || '未知錯誤'}`
          state.isLoading = false
        },
      })

      console.log('✅ Token Client 初始化完成')

      // 檢查是否有存儲的 token
      const savedToken = localStorage.getItem('google_access_token')
      if (savedToken) {
        console.log('🔍 發現已保存的 token，驗證中...')
        try {
          // 驗證 token 是否仍然有效
          const response = await fetch(
            `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${savedToken}`,
          )
          if (response.ok) {
            const userInfo = await response.json()
            state.user = {
              id: userInfo.id,
              email: userInfo.email,
              name: userInfo.name,
              picture: userInfo.picture,
            }
            state.isAuthenticated = true
            console.log('✅ 使用已保存的認證狀態')
          } else {
            // Token 無效，清除
            localStorage.removeItem('google_access_token')
            console.log('⚠️ 已保存的 token 無效，已清除')
          }
        } catch (error) {
          console.log('⚠️ 驗證已保存的 token 失敗:', error)
          localStorage.removeItem('google_access_token')
        }
      }

      console.log('🎉 Google Identity Services 初始化完成!')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '初始化失敗'
      state.error = errorMessage
      console.error('❌ Google Identity Services 初始化錯誤:', error)
    } finally {
      state.isLoading = false
    }
  }
  // 登入
  const signIn = async (): Promise<void> => {
    try {
      state.isLoading = true
      state.error = null

      if (!tokenClient) {
        await initGoogleAuth()
      }

      if (!tokenClient) {
        throw new Error('Token client 未初始化')
      }

      console.log('🔐 開始登入流程...')

      // 請求 access token
      tokenClient.requestAccessToken({
        prompt: 'select_account',
      })

      // 注意：登入是異步的，狀態會在回調中更新
      // 這裡不設置 isLoading = false，讓回調函數處理
    } catch (error) {
      state.error = error instanceof Error ? error.message : '登入失敗'
      console.error('❌ 登入錯誤:', error)
      state.isLoading = false
    }
  }

  // 登出
  const signOut = async (): Promise<void> => {
    try {
      state.isLoading = true

      // 撤銷 token
      const savedToken = localStorage.getItem('google_access_token')
      if (savedToken) {
        window.google.accounts.oauth2.revoke(savedToken, () => {
          console.log('✅ Token 已撤銷')
        })
      }

      // 清除狀態
      state.user = null
      state.isAuthenticated = false
      state.error = null
      localStorage.removeItem('google_access_token')

      console.log('✅ 登出成功')
    } catch (error) {
      state.error = '登出失敗'
      console.error('❌ 登出錯誤:', error)
    } finally {
      state.isLoading = false
    }
  }

  // 獲取 access token
  const getAccessToken = (): string | null => {
    return localStorage.getItem('google_access_token')
  }

  // 檢查登入狀態
  const checkAuthStatus = async (): Promise<void> => {
    try {
      await initGoogleAuth()
    } catch (error) {
      console.error('❌ 檢查認證狀態時發生錯誤:', error)
    }
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
    initGoogleAuth,
    signIn,
    signOut,
    getAccessToken,
    checkAuthStatus,
  }
}

// 全域類型聲明
declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: any) => any
          revoke: (token: string, callback: () => void) => void
        }
      }
    }
  }
}
