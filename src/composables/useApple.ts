import { reactive, computed } from 'vue'

export interface AppleOAuthConfig {
  clientId: string
  redirectUri: string
  scope?: string[]
  state?: string
  usePopup?: boolean
}

export interface AppleUser {
  id: string
  email?: string
  name?: {
    firstName: string
    lastName: string
  }
  realUserStatus?: number
}

export interface AppleAuthState {
  user: AppleUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// Apple OAuth 相關的類型定義
export interface AppleSignInResponse {
  authorization: {
    code: string
    id_token: string
    state?: string
  }
  user?: {
    email: string
    name: {
      firstName: string
      lastName: string
    }
  }
}

export interface AppleOAuthError {
  error: string
  details?: string
}

export interface AppleSignInConfig {
  clientId: string
  redirectURI: string
  scope: string
  state?: string
  usePopup: boolean
}

export interface AppleJWTPayload {
  sub: string
  email?: string
  real_user_status?: number
  exp?: number
  iat?: number
  aud?: string
  iss?: string
}

// 全域狀態
let appleApiReady = false
let initPromise: Promise<void> | null = null

// 載入 Apple ID Services
async function loadAppleIdServices(): Promise<void> {
  if (appleApiReady) {
    return Promise.resolve()
  }

  if (initPromise) {
    return initPromise
  }

  initPromise = new Promise((resolve, reject) => {
    // 檢查是否已經載入
    if (window.AppleID) {
      appleApiReady = true
      resolve()
      return
    }

    // 檢查是否已經有 script 標籤
    const existingScript = document.querySelector('script[src*="appleid.cdn-apple.com"]')
    if (existingScript) {
      const checkReady = () => {
        if (window.AppleID) {
          appleApiReady = true
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
    script.src =
      'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js'
    script.async = true
    script.defer = true

    script.onload = () => {
      const checkReady = () => {
        if (window.AppleID) {
          appleApiReady = true
          resolve()
        } else {
          setTimeout(checkReady, 50)
        }
      }
      checkReady()
    }

    script.onerror = () => {
      reject(new Error('無法載入 Apple ID Services'))
    }

    // 15 秒超時
    setTimeout(() => {
      reject(new Error('Apple ID Services 載入超時'))
    }, 15000)

    document.head.appendChild(script)
  })

  return initPromise
}

export function useApple(config: AppleOAuthConfig) {
  const state = reactive<AppleAuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  })

  const defaultScopes = ['name', 'email']
  const scopes = config.scope || defaultScopes

  // 處理登入成功
  const handleAuthSuccess = (response: AppleSignInResponse): void => {
    try {
      console.log('🎉 Apple 認證成功', response)

      // 解析 ID Token 獲取用戶資訊
      const idToken = response.authorization.id_token
      const payload = parseJWT(idToken)

      const user: AppleUser = {
        id: payload.sub,
        email: payload.email,
        realUserStatus: payload.real_user_status,
      }

      // 如果有用戶名稱資訊（僅在首次登入時提供）
      if (response.user?.name) {
        user.name = response.user.name
      }

      state.user = user
      state.isAuthenticated = true
      state.error = null

      // 儲存認證資訊
      localStorage.setItem('apple_id_token', idToken)
      localStorage.setItem('apple_auth_code', response.authorization.code)
      if (response.user) {
        localStorage.setItem('apple_user_info', JSON.stringify(response.user))
      }

      console.log('✅ Apple 用戶資訊設置完成')
    } catch (error) {
      state.error = '處理 Apple 認證失敗'
      console.error('❌ 處理 Apple 認證成功時發生錯誤:', error)
    } finally {
      state.isLoading = false
    }
  }

  // 處理登入失敗
  const handleAuthError = (error: AppleOAuthError): void => {
    console.error('❌ Apple OAuth 錯誤:', error)
    state.error = `Apple 認證失敗: ${error.error ?? '未知錯誤'}`
    state.isLoading = false
  }
  // 解析 JWT Token
  const parseJWT = (token: string): AppleJWTPayload => {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      )
      return JSON.parse(jsonPayload)
    } catch (error) {
      console.error('❌ 解析 JWT 失敗:', error)
      return { sub: '' }
    }
  }

  // 初始化 Apple ID Services
  const initAppleAuth = async (): Promise<void> => {
    try {
      state.isLoading = true
      state.error = null

      console.log('🚀 開始 Apple ID Services 初始化...')

      // 檢查 Client ID
      if (!config.clientId) {
        throw new Error('請設置有效的 Apple Client ID')
      }

      console.log('✅ Apple Client ID 驗證通過')

      // 載入 Apple ID Services
      await loadAppleIdServices()
      console.log('✅ Apple ID Services 載入完成')

      // 初始化 Apple ID
      window.AppleID.auth.init({
        clientId: config.clientId,
        scope: scopes.join(' '),
        redirectURI: config.redirectUri,
        state: config.state || 'default-state',
        usePopup: config.usePopup ?? true,
      })

      console.log('✅ Apple ID 初始化完成')

      // 檢查是否有存儲的認證資訊
      const savedIdToken = localStorage.getItem('apple_id_token')
      const savedUserInfo = localStorage.getItem('apple_user_info')

      if (savedIdToken) {
        console.log('🔍 發現已保存的 Apple ID Token，驗證中...')
        try {
          const payload = parseJWT(savedIdToken)
          const currentTime = Math.floor(Date.now() / 1000)

          // 檢查 token 是否過期
          if (payload.exp && payload.exp > currentTime) {
            const user: AppleUser = {
              id: payload.sub,
              email: payload.email,
              realUserStatus: payload.real_user_status,
            }

            // 如果有保存的用戶資訊，加載它
            if (savedUserInfo) {
              const userInfo = JSON.parse(savedUserInfo)
              user.name = userInfo.name
            }

            state.user = user
            state.isAuthenticated = true
            console.log('✅ 使用已保存的 Apple 認證狀態')
          } else {
            // Token 過期，清除
            localStorage.removeItem('apple_id_token')
            localStorage.removeItem('apple_auth_code')
            localStorage.removeItem('apple_user_info')
            console.log('⚠️ 已保存的 Apple token 已過期，已清除')
          }
        } catch (error) {
          console.log('⚠️ 驗證已保存的 Apple token 失敗:', error)
          localStorage.removeItem('apple_id_token')
          localStorage.removeItem('apple_auth_code')
          localStorage.removeItem('apple_user_info')
        }
      }

      console.log('🎉 Apple ID Services 初始化完成!')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Apple 初始化失敗'
      state.error = errorMessage
      console.error('❌ Apple ID Services 初始化錯誤:', error)
    } finally {
      state.isLoading = false
    }
  }

  // 登入
  const signIn = async (): Promise<void> => {
    try {
      state.isLoading = true
      state.error = null

      if (!appleApiReady) {
        await initAppleAuth()
      }

      if (!window.AppleID) {
        throw new Error('Apple ID Services 未初始化')
      }

      console.log('🔐 開始 Apple 登入流程...') // 執行 Apple 登入
      const response = await window.AppleID.auth.signIn()
      handleAuthSuccess(response)
    } catch (error: unknown) {
      // Apple ID 登入被取消不算錯誤
      const appleError = error as AppleOAuthError
      if (
        appleError.error === 'popup_closed_by_user' ||
        appleError.error === 'user_cancelled_authorize'
      ) {
        console.log('ℹ️ 用戶取消了 Apple 登入')
        state.isLoading = false
        return
      }

      handleAuthError(appleError)
    }
  }

  // 登出
  const signOut = async (): Promise<void> => {
    try {
      state.isLoading = true

      // 清除狀態
      state.user = null
      state.isAuthenticated = false
      state.error = null

      // 清除本地存儲
      localStorage.removeItem('apple_id_token')
      localStorage.removeItem('apple_auth_code')
      localStorage.removeItem('apple_user_info')

      console.log('✅ Apple 登出成功')
    } catch (error) {
      state.error = 'Apple 登出失敗'
      console.error('❌ Apple 登出錯誤:', error)
    } finally {
      state.isLoading = false
    }
  }

  // 獲取 ID Token
  const getIdToken = (): string | null => {
    return localStorage.getItem('apple_id_token')
  }

  // 獲取 Auth Code
  const getAuthCode = (): string | null => {
    return localStorage.getItem('apple_auth_code')
  }

  // 檢查登入狀態
  const checkAuthStatus = async (): Promise<void> => {
    try {
      await initAppleAuth()
    } catch (error) {
      console.error('❌ 檢查 Apple 認證狀態時發生錯誤:', error)
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
    initAppleAuth,
    signIn,
    signOut,
    getIdToken,
    getAuthCode,
    checkAuthStatus,
  }
}

// 全域類型聲明
declare global {
  interface Window {
    AppleID: {
      auth: {
        init: (config: AppleSignInConfig) => void
        signIn: () => Promise<AppleSignInResponse>
      }
    }
  }
}
