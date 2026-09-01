import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import { useLanguageStore } from '../store/themeStore'
import { translations } from '../i18n/translations'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading, token } = useAuthStore()
  const { language, setLanguage } = useLanguageStore()
  const navigate = useNavigate()
  const t = translations[language]

  useEffect(() => {
    if (token) {
      navigate('/app', { replace: true })
    }
  }, [token, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(email.trim(), password)
    if (result.success) {
      toast.success('Login successful!')
      navigate('/app', { replace: true })
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
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden text-white">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(15,23,42,0.88), rgba(15,118,110,0.42)), url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.25),transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.28),transparent_28%)]" />

        <div className="relative z-10 flex w-full flex-col justify-between p-12">
          <div>
<div className="mb-12 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/90 shadow-lg shadow-emerald-900/30">
                    <Building2 className="h-7 w-7" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">Coal Governance</h1>
                    <p className="text-sm text-slate-200/80">Smart Compliance Platform</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                  className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/15"
                >
                  {language === 'en' ? 'हिंदी' : 'English'}
                </button>
            </div>

            <div className="mb-5 inline-flex items-center rounded-full border border-emerald-300/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-emerald-200">
              {t.mineSight}
            </div>

            <h2 className="mb-5 max-w-lg text-4xl font-black leading-tight">
              {language === 'en' ? 'AI-Powered Governance for Indian Coal Mines' : 'भारतीय कोयला खदानों के लिए एआई आधारित शासन'}
            </h2>
            <p className="max-w-md text-lg leading-8 text-slate-200">
              {language === 'en'
                ? 'Centralized platform for statutory compliance, risk analytics, inspections, and paperless governance across mine operations.'
                : 'खदान संचालन के लिए सांविधिक अनुपालन, जोखिम विश्लेषण, निरीक्षण और पेपरलेस शासन के लिए एकीकृत प्लेटफ़ॉर्म।'}
            </p>
          </div>

          <div className="space-y-5">
            {[
              'Real-time compliance monitoring',
              'AI risk scoring & predictive alerts',
              'Geo-tagged field inspections',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/20 p-3 backdrop-blur-sm">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
                <span className="text-sm text-slate-100">{item}</span>
              </div>
            ))}

            <div className="mt-6 grid grid-cols-3 gap-4">
              {[
                ['120+', 'Mines'],
                ['96.4%', 'Safety'],
                ['24/7', 'Monitoring'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center backdrop-blur-md">
                  <div className="text-xl font-black text-white">{value}</div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-300">{label}</div>
                </div>
              ))}
            </div>

            <p className="mt-6 text-xs tracking-[0.18em] text-slate-300/80">
              Ministry of Coal | Coal India Limited | Smart India Hackathon 2026
            </p>
          </div>
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
            <h2 className="text-2xl font-bold mb-1">{t.welcomeBack}</h2>
            <p className="text-slate-500 text-sm mb-6">{t.signInToAccount}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">{t.email}</label>
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
                <label className="label">{t.password}</label>
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
                  t.signIn
                )}
              </button>
            </form>

            {/* Optional demo shortcuts */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 mb-3 text-center">{t.quickDemo}</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => quickLogin('rajesh@ncl.gov.in', 'mine123')}
                  className="text-xs py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  {t.mineOfficial}
                </button>
                <button
                  type="button"
                  onClick={() => quickLogin('corporate@cil.gov.in', 'corp123')}
                  className="text-xs py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  {t.corporate}
                </button>
                <button
                  type="button"
                  onClick={() => quickLogin('admin@cil.gov.in', 'admin123')}
                  className="text-xs py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  {t.admin}
                </button>
                <button
                  type="button"
                  onClick={() => quickLogin('regulator@dgms.gov.in', 'reg123')}
                  className="text-xs py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  {t.regulator}
                </button>
              </div>

              <div className="mt-5 text-center text-sm text-slate-500">
                Don’t have an account?{' '}
                <Link to="/register" className="font-semibold text-primary-700 hover:text-primary-800">
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}