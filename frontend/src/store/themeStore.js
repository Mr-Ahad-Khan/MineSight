import { create } from 'zustand'

const useThemeStore = create((set) => ({
  darkMode: localStorage.getItem('darkMode') === 'true' || false,

  toggleDarkMode: () => set((state) => {
    const newMode = !state.darkMode
    localStorage.setItem('darkMode', newMode)
    if (newMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    return { darkMode: newMode }
  }),

  initTheme: () => {
    const isDark = localStorage.getItem('darkMode') === 'true'
    if (isDark) {
      document.documentElement.classList.add('dark')
    }
  }
}))

export const useLanguageStore = create((set) => ({
  language: localStorage.getItem('language') || 'en',

  setLanguage: (language) => {
    localStorage.setItem('language', language)
    set({ language })
  },
}))

export default useThemeStore