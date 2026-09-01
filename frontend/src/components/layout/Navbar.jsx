import { Menu, Moon, Sun, LogOut, Bell, Languages } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import useThemeStore, { useLanguageStore } from '../../store/themeStore'
import { translations } from '../../i18n/translations'

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuthStore()
  const { darkMode, toggleDarkMode } = useThemeStore()
  const { language, setLanguage } = useLanguageStore()
  const navigate = useNavigate()
  const t = translations[language]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block">
          <h1 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {language === 'en' ? 'Smart Governance Platform' : 'स्मार्ट गवर्नेंस प्लेटफॉर्म'}
          </h1>
          <p className="text-xs text-slate-500">{language === 'en' ? 'Ministry of Coal | Coal India Limited' : 'कोयला मंत्रालय | कोल इंडिया लिमिटेड'}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Toggle language"
        >
          <Languages className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        </button>

        <button
          onClick={() => navigate('/app/alerts')}
          className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}
        </button>

        <div className="hidden md:flex items-center gap-2 ml-2 pl-3 border-l border-slate-200 dark:border-slate-700">
          <div className="text-right">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-600 dark:text-slate-300 hover:text-red-600"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}