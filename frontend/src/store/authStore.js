import { create } from 'zustand'
import { login as loginApi, register as registerApi, getMe } from '../services/api'

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

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const { data } = await loginApi({ email, password })
      const authUser = data?.data || data
      const token = authUser?.token

      if (!token) {
        throw new Error('Authentication token missing from server response')
      }

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(authUser))
      set({ user: authUser, token, isLoading: false })
      return { success: true }
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
      set({ user: authUser, token: authUser?.token || null, isLoading: false })
      return { success: true, user: authUser }
    } catch (error) {
      set({ isLoading: false })
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Registration failed'
      }
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null })
  },

  setUser: (user) => set({ user }),
}))

export default useAuthStore