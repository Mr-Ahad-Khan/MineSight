import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, ClipboardList, ShieldCheck, MapPin, 
  Users, Bell, BarChart3, X, Building2
} from 'lucide-react'
import useAuthStore from '../../store/authStore'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Inspections', href: '/inspections', icon: ClipboardList },
  { name: 'Compliances', href: '/compliances', icon: ShieldCheck },
  { name: 'Mines', href: '/mines', icon: MapPin },
  { name: 'Contractors', href: '/contractors', icon: Users },
  { name: 'Alerts', href: '/alerts', icon: Bell },
  { name: 'AI Analytics', href: '/analytics', icon: BarChart3 },
]

export default function Sidebar({ open, setOpen }) {
  const { user } = useAuthStore()

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-gov-dark text-white
        transform transition-transform duration-200 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm leading-tight">Coal Governance</p>
              <p className="text-[10px] text-slate-400">CIL Smart Platform</p>
            </div>
          </div>
          <button 
            onClick={() => setOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-sm font-semibold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}