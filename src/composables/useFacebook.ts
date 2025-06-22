import { reactive, computed } from 'vue'

export interface FacebookOAuthConfig {
  appId: string
  redirectUri: string
  scope?: string
  version?: string
  usePopup?: boolean
}

export interface FacebookUser {
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

export interface FacebookAuthState {
  user: FacebookUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// Facebook SDK 類型定義
interface FacebookAuthResponse {
  accessToken: string
  userID: string
  expiresIn: number
  signedRequest: string
}

interface FacebookLoginResponse {
  status: string
  authResponse?: FacebookAuthResponse
}

interface FacebookSDK {
  init: (params: { appId: string; cookie: boolean; xfbml: boolean; version: string }) => void
  login: (callback: (response: FacebookLoginResponse) => void, options?: { scope: string }) => void
  logout: (callback: () => void) => void
  getLoginStatus: (callback: (response: FacebookLoginResponse) => void) => void
  api: (
    path: string,
    params: Record<string, string>,
    callback: (response: FacebookUser | { error: unknown }) => void,
  ) => void
}

// Facebook SDK 全局變數聲明
declare global {
  interface Window {
    FB: FacebookSDK
    fbAsyncInit: () => void
  }
}

export function useFacebook(config: FacebookOAuthConfig) {
  const state = reactive<FacebookAuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  })

  const version = config.version || 'v18.0'

  // 載入 Facebook SDK
  const loadFacebookSDK = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // 檢查 SDK 是否已載入
      if (window.FB) {
        resolve()
        return
      }

      // 檢查腳本是否已存在
      if (document.getElementById('facebook-jssdk')) {
        resolve()
        return
      }

      // 設置 fbAsyncInit 回調
      window.fbAsyncInit = () => {
        try {
          window.FB.init({
            appId: config.appId,
            cookie: true,
            xfbml: true,
            version: version,
          })
          console.log('✅ Facebook SDK 初始化完成')
          resolve()
        } catch (error) {
          console.error('❌ Facebook SDK 初始化失敗:', error)
          reject(error)
        }
      }

      // 載入 Facebook SDK 腳本
      const script = document.createElement('script')
      script.id = 'facebook-jssdk'
      script.src = 'https://connect.facebook.net/zh_TW/sdk.js'
      script.async = true
      script.defer = true
      script.crossOrigin = 'anonymous'

      script.onload = () => {
        console.log('✅ Facebook SDK 腳本載入完成')
      }

      script.onerror = (error) => {
        console.error('❌ Facebook SDK 腳本載入失敗:', error)
        reject(new Error('Facebook SDK 載入失敗'))
      }

      document.head.appendChild(script)
    })
  }

  // 獲取用戶資訊
  const fetchUserInfo = (): Promise<FacebookUser> => {
    return new Promise((resolve, reject) => {
      window.FB.api(
        '/me',
        { fields: 'id,name,email,picture,first_name,last_name' },
        (response: FacebookUser | { error: unknown }) => {
          if ('error' in response) {
            reject(response.error || new Error('獲取用戶資訊失敗'))
          } else {
            resolve(response)
          }
        },
      )
    })
  }
  // 處理登入成功
  const handleAuthSuccess = async (authResponse: FacebookAuthResponse): Promise<void> => {
    try {
      console.log('🎉 Facebook 登入成功:', authResponse)

      // 獲取用戶資訊
      const userInfo = await fetchUserInfo()
      console.log('👤 Facebook 用戶資訊:', userInfo)

      state.user = userInfo
      state.isAuthenticated = true
      state.error = null

      // 儲存用戶資訊和 token
      localStorage.setItem('facebook_user_info', JSON.stringify(userInfo))
      localStorage.setItem('facebook_access_token', authResponse.accessToken)

      console.log('✅ Facebook 用戶狀態已更新')
    } catch (error) {
      console.error('❌ 處理 Facebook 登入失敗:', error)
      state.error = error instanceof Error ? error.message : 'Facebook 登入處理失敗'
    }
  }

  // 檢查登入狀態
  const checkLoginStatus = (): Promise<void> => {
    return new Promise((resolve) => {
      window.FB.getLoginStatus((response: FacebookLoginResponse) => {
        console.log('🔍 Facebook 登入狀態:', response)

        if (response.status === 'connected' && response.authResponse) {
          handleAuthSuccess(response.authResponse).then(resolve)
        } else {
          // 檢查本地存儲的用戶資訊
          const savedUserInfo = localStorage.getItem('facebook_user_info')
          if (savedUserInfo) {
            try {
              state.user = JSON.parse(savedUserInfo)
              state.isAuthenticated = true
              console.log('✅ 使用已保存的 Facebook 用戶資訊')
            } catch (error) {
              console.log('⚠️ 解析已保存的用戶資訊失敗，已清除:', error)
              localStorage.removeItem('facebook_user_info')
              localStorage.removeItem('facebook_access_token')
            }
          }
          resolve()
        }
      })
    })
  }

  // 初始化 Facebook OAuth
  const initFacebookAuth = async (): Promise<void> => {
    try {
      state.isLoading = true
      state.error = null

      console.log('🚀 開始 Facebook OAuth 初始化...')

      // 檢查 App ID
      if (!config.appId || config.appId === 'your-facebook-app-id') {
        throw new Error('請設置有效的 Facebook App ID')
      }

      console.log('✅ Facebook App ID 驗證通過:', config.appId.substring(0, 8) + '...')

      // 載入 Facebook SDK
      await loadFacebookSDK()

      // 檢查登入狀態
      await checkLoginStatus()

      console.log('🎉 Facebook OAuth 初始化完成!')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Facebook 初始化失敗'
      state.error = errorMessage
      console.error('❌ Facebook OAuth 初始化錯誤:', error)
    } finally {
      state.isLoading = false
    }
  }

  // 登入
  const signIn = async (): Promise<void> => {
    try {
      state.isLoading = true
      state.error = null

      console.log('🔐 開始 Facebook 登入流程...')

      if (!window.FB) {
        throw new Error('Facebook SDK 尚未載入')
      }
      const scope = config.scope || 'email,public_profile'

      // 使用 Facebook Login API
      window.FB.login(
        (response: FacebookLoginResponse) => {
          console.log('📱 Facebook 登入回應:', response)

          if (response.authResponse) {
            handleAuthSuccess(response.authResponse).finally(() => {
              state.isLoading = false
            })
          } else {
            console.log('ℹ️ 用戶取消了 Facebook 登入')
            state.isLoading = false
          }
        },
        { scope },
      )
    } catch (error) {
      state.error = error instanceof Error ? error.message : 'Facebook 登入失敗'
      console.error('❌ Facebook 登入錯誤:', error)
      state.isLoading = false
    }
  }

  // 登出
  const signOut = async (): Promise<void> => {
    try {
      console.log('🔓 開始 Facebook 登出流程...')

      // 清除本地狀態
      state.user = null
      state.isAuthenticated = false
      state.error = null

      // 清除本地存儲
      localStorage.removeItem('facebook_user_info')
      localStorage.removeItem('facebook_access_token')

      // 如果 Facebook SDK 已載入，執行 Facebook 登出
      if (window.FB) {
        window.FB.logout(() => {
          console.log('✅ Facebook 登出成功')
        })
      } else {
        console.log('✅ Facebook 本地登出成功')
      }
    } catch (error) {
      console.error('❌ Facebook 登出錯誤:', error)
      // 即使登出失敗，也要清除本地狀態
      state.user = null
      state.isAuthenticated = false
    }
  }

  // 檢查認證狀態
  const checkAuthStatus = async (): Promise<void> => {
    await initFacebookAuth()
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
    initFacebookAuth,
    signIn,
    signOut,
    checkAuthStatus,
  }
}
