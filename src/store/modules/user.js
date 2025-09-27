import { defineStore } from 'pinia'
import { login, getUserInfo } from '@/api/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: null,
    isLoggedIn: false
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token && state.isLoggedIn,
    userId: (state) => state.userInfo?.id,
    username: (state) => state.userInfo?.username,
    nickname: (state) => state.userInfo?.nickname
  },
  
  actions: {
    // 登录
    async login(loginForm) {
      try {
        const response = await login(loginForm)
        const { token, userInfo } = response.data
        
        this.token = token
        this.userInfo = userInfo
        this.isLoggedIn = true
        
        localStorage.setItem('token', token)
        
        return Promise.resolve(response)
      } catch (error) {
        return Promise.reject(error)
      }
    },
    
    // 获取用户信息
    async fetchUserInfo() {
      try {
        const response = await getUserInfo()
        this.userInfo = response.data
        this.isLoggedIn = true
        return Promise.resolve(response)
      } catch (error) {
        this.logout()
        return Promise.reject(error)
      }
    },
    
    // 登出
    logout() {
      this.token = ''
      this.userInfo = null
      this.isLoggedIn = false
      localStorage.removeItem('token')
    },
    
    // 更新用户信息
    updateUserInfo(userInfo) {
      this.userInfo = { ...this.userInfo, ...userInfo }
    }
  }
})
