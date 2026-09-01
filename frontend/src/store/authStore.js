import { create } from 'zustand'
import { login as loginApi, getMe } from '../services/api'

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const { data } = await loginApi({ email, password })
      localStorage.setItem('token', data.data.token)
      localStorage.setItem('user', JSON.stringify(data.data))
      set({ user: data.data, token: data.data.token, isLoading: false })
      return { success: true }
    } catch (error) {
      set({ isLoading: false })
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
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