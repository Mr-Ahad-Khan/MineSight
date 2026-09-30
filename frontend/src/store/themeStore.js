import { create } from "zustand";
import i18n from "../i18n/config";
import { languageOptions } from "../i18n/translations";

const supportedLanguages = languageOptions.map(({ code }) => code);
const storedLanguage = localStorage.getItem("language");
const initialLanguage = supportedLanguages.includes(storedLanguage)
  ? storedLanguage
  : "en";

if (typeof document !== "undefined") {
  document.documentElement.lang = initialLanguage;
}

const useThemeStore = create((set) => ({
  darkMode: localStorage.getItem("darkMode") === "true" || false,

  toggleDarkMode: () =>
    set((state) => {
      const newMode = !state.darkMode;
      localStorage.setItem("darkMode", newMode);
      if (newMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      document.documentElement.style.colorScheme = newMode ? "dark" : "light";
      return { darkMode: newMode };
    }),

  initTheme: () => {
    const isDark = localStorage.getItem("darkMode") === "true";
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  },
}));

export const useLanguageStore = create((set) => ({
  language: initialLanguage,

  setLanguage: (language) => {
    if (!supportedLanguages.includes(language)) return;
    localStorage.setItem("language", language);
    document.documentElement.lang = language;
    window.dispatchEvent(new Event("minesight:language-changing"));
    void i18n.changeLanguage(language).then(() => set({ language }));
  },
}));

export default useThemeStore;
