import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'

export default function Login() {
  const [email, setEmail] = useState('rajesh@ncl.gov.in')
  const [password, setPassword] = useState('mine123')
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(email, password)
    if (result.success) {
      toast.success('Login successful!')
      navigate('/')
    } else {
      toast.error(result.message)
    }
  }

  const quickLogin = (roleEmail, rolePass) => {
    setEmail(roleEmail)
    setPassword(rolePass)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gov-dark text-white flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Coal Governance</h1>
              <p className="text-sm text-slate-400">Smart Compliance Platform</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold leading-tight mb-4">
            AI-Powered Governance for<br />Indian Coal Mines
          </h2>
          <p className="text-slate-300 text-lg max-w-md">
            Centralized platform for statutory compliance, real-time inspections, 
            risk analytics and paperless governance across Coal India Limited.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            Real-time compliance monitoring
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            AI risk scoring & predictive alerts
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            Geo-tagged field inspections
          </div>
          <p className="text-xs text-slate-500 mt-8">
            Ministry of Coal | Coal India Limited | Smart India Hackathon 2026
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold">Coal Governance</h1>
              <p className="text-xs text-slate-500">Smart Compliance Platform</p>
            </div>
          </div>

          <div className="card p-8">
            <h2 className="text-2xl font-bold mb-1">Welcome back</h2>
            <p className="text-slate-500 text-sm mb-6">Sign in to your account</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@cil.gov.in"
                  required
                />
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            {/* Quick login for demo */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 mb-3 text-center">Quick demo login</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => quickLogin('rajesh@ncl.gov.in', 'mine123')}
                  className="text-xs py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  Mine Official
                </button>
                <button
                  type="button"
                  onClick={() => quickLogin('corporate@cil.gov.in', 'corp123')}
                  className="text-xs py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  Corporate
                </button>
                <button
                  type="button"
                  onClick={() => quickLogin('admin@cil.gov.in', 'admin123')}
                  className="text-xs py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => quickLogin('regulator@dgms.gov.in', 'reg123')}
                  className="text-xs py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  Regulator
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}