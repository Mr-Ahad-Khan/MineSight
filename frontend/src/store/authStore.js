import { create } from 'zustand'
import { login as loginApi, register as registerApi, updateProfile as updateProfileApi } from '../services/api'

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const useAuthStore = create((set) => ({
  user: getStoredUser(),
  token: localStorage.getItem('token') || null,
  isLoading: false,

  login: async (email, password, recaptchaToken) => {
    set({ isLoading: true })
    try {
      const { data } = await loginApi({ email, password, recaptchaToken })
      const authUser = data?.data || data
      const token = authUser?.token || data?.token

      if (!token) {
        throw new Error('Authentication token missing from server response')
      }

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(authUser))
      set({ user: authUser, token, isLoading: false })
      return { success: true, user: authUser }
    } catch (error) {
      set({ isLoading: false })
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Login failed' 
      }
    }
  },

  register: async (userData) => {
    set({ isLoading: true })
    try {
      const { data } = await registerApi(userData)
      const authUser = data?.data || data
      const token = authUser?.token || data?.token || `offline_token_${Date.now()}`
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(authUser))
      set({ user: authUser, token, isLoading: false })
      return { success: true, user: authUser }
    } catch (error) {
      // If offline or network failure, create local user session
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        const offlineUser = {
          _id: `user_offline_${Date.now()}`,
          name: userData.name || 'New Inspector',
          email: userData.email,
          role: userData.role || 'mine_official',
          token: `offline_token_${Date.now()}`,
        }
        localStorage.setItem('token', offlineUser.token)
        localStorage.setItem('user', JSON.stringify(offlineUser))
        set({ user: offlineUser, token: offlineUser.token, isLoading: false })
        return { success: true, user: offlineUser }
      }
      set({ isLoading: false })
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Registration failed'
      }
    }
  },

  updateProfile: async (profileData) => {
    set({ isLoading: true })
    try {
      const { data } = await updateProfileApi(profileData)
      const updatedUser = data?.data || data
      const currentUser = getStoredUser()
      const user = { ...currentUser, ...updatedUser }
      localStorage.setItem('user', JSON.stringify(user))
      set({ user, isLoading: false })
      return { success: true, user }
    } catch (error) {
      set({ isLoading: false })
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Profile update failed'
      }
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null })
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("minesight:auth-logout"));
    }
  },

  setUser: (user) => set({ user }),
}))

export default useAuthStore