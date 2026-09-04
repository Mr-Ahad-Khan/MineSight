import {
  LayoutDashboard,
  ClipboardList,
  ShieldCheck,
  MapPin,
  Users,
  Bell,
  BarChart3,
  MessageCircle,
  Moon,
  Sun,
  Languages,
  LogOut,
  Building2,
  UserCircle,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import useThemeStore, { useLanguageStore } from '../../store/themeStore'
import { translations } from '../../i18n/translations'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const { darkMode, toggleDarkMode } = useThemeStore()
  const { language, setLanguage } = useLanguageStore()
  const navigate = useNavigate()
  const t = translations[language]

  const navigation = [
    { name: t.dashboard, href: '/app', icon: LayoutDashboard },
    { name: t.inspections, href: '/app/inspections', icon: ClipboardList },
    { name: t.compliances, href: '/app/compliances', icon: ShieldCheck },
    { name: t.mines, href: '/app/mines', icon: MapPin },
    { name: t.contractors, href: '/app/contractors', icon: Users },
    { name: t.alerts, href: '/app/alerts', icon: Bell },
    { name: t.analytics, href: '/app/analytics', icon: BarChart3 },
    { name: 'Coal AI', href: '/app/chat', icon: MessageCircle },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 h-[72px] border-b border-[#d7c7ab] bg-[#e8dfcf] shadow-[0_2px_8px_rgba(74,54,32,0.08)] dark:border-slate-700 dark:bg-[#111c24] dark:shadow-none">
      <div className="flex h-full w-full min-w-0 items-center overflow-hidden">
        <div className="flex h-full w-[220px] shrink-0 items-center gap-3 border-r border-[#b99a72] bg-[#0c3f6d] px-4 text-white lg:w-[280px] lg:px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2d5b8d]">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="text-[15px] font-semibold tracking-tight">Coal Governance</p>
            <p className="text-[10px] text-slate-200">CIL Smart Platform</p>
          </div>
        </div>

        <nav className="navbar-scrollbar-hidden hidden min-w-0 flex-1 items-center justify-start gap-0 overflow-x-auto bg-[#e8dfcf] px-2 md:flex lg:gap-1 lg:px-3 dark:bg-[#111c24]">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === '/app'}
              className={({ isActive }) =>
                `group relative flex shrink-0 items-center gap-1.5 whitespace-nowrap px-2 py-3 text-xs font-medium transition-colors lg:gap-2 lg:px-3 lg:text-[14px] ${
                  isActive ? 'text-[#0f2f49] dark:text-white' : 'text-[#3a3a3a] hover:text-[#152b3d] dark:text-slate-300 dark:hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                  {isActive && (
                    <span className="absolute inset-x-2 bottom-0 h-[3px] rounded-t bg-[#0d3f6b]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1 border-l border-[#b99a72] bg-[#e8dfcf] px-2 text-[#3a3a3a] sm:gap-1.5 sm:px-3 lg:px-4 dark:border-slate-700 dark:bg-[#111c24] dark:text-slate-200">
          <button
            type="button"
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="inline-flex h-9 items-center gap-1 rounded-full border border-[#b99a72] bg-[#f4ecdf] p-1 text-[10px] font-bold tracking-wide text-[#5d554b] transition hover:border-[#0d3f6b] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-sky-400"
            title="Change language"
            aria-label="Change language"
          >
            <Languages className="mx-1 h-3.5 w-3.5 text-[#0d3f6b] dark:text-sky-300" />
            <span className={`rounded-full px-2 py-1 ${language === 'en' ? 'bg-[#0d3f6b] text-white' : ''}`}>EN</span>
            <span className={`rounded-full px-2 py-1 ${language === 'hi' ? 'bg-[#0d3f6b] text-white' : ''}`}>हिंदी</span>
          </button>

          <button
            onClick={() => navigate('/app/alerts')}
            className="relative rounded-lg p-2 hover:bg-[#efe7da] dark:hover:bg-slate-800"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          </button>

          <button
            onClick={toggleDarkMode}
            className="rounded-lg p-2 hover:bg-[#efe7da] dark:hover:bg-slate-800"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <div className="hidden items-center gap-3 border-l border-[#b99a72] pl-3 xl:flex">
            <div className="text-right leading-tight text-[#1d1d1d] dark:text-slate-100">
              <p className="text-[13px] font-medium">{user?.name || 'Rajesh Kumar'}</p>
              <p className="text-[10px] text-[#504a42] capitalize dark:text-slate-400">{user?.role?.replace('_', ' ') || 'Mine Official'}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dfeaf9] text-[12px] font-semibold text-[#163a5f]">
              {(user?.name || 'Rajesh Kumar').charAt(0).toUpperCase()}
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/app/profile')}
            className="rounded-lg p-2 hover:bg-[#efe7da] dark:hover:bg-slate-800"
            title="Edit profile"
            aria-label="Edit profile"
          >
            <UserCircle className="h-4 w-4" />
          </button>

          <button
            onClick={handleLogout}
            className="rounded-lg p-2 hover:bg-[#efe7da] hover:text-[#3a3a3a] dark:hover:bg-slate-800 dark:hover:text-white"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}