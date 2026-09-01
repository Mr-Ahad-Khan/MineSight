import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import { useLanguageStore } from '../store/themeStore'
import { translations } from '../i18n/translations'

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'mine_official',
    phone: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const { register, isLoading, token } = useAuthStore()
  const { language } = useLanguageStore()
  const navigate = useNavigate()
  const t = translations[language]

  useEffect(() => {
    if (token) {
      navigate('/app', { replace: true })
    }
  }, [token, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role,
      phone: form.phone.trim(),
    }

    const result = await register(payload)

    if (result.success) {
      toast.success('Account created successfully!')
      navigate('/login', { replace: true })
    } else {
      toast.error(result.message)
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
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
            <div className="mb-12 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/90 shadow-lg shadow-emerald-900/30">
                <Building2 className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{t.mineSight}</h1>
                <p className="text-sm text-slate-200/80">{t.digitalGovernance}</p>
              </div>
            </div>

            <div className="mb-5 inline-flex items-center rounded-full border border-emerald-300/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-emerald-200">
              {language === 'en' ? 'Register access' : 'पंजीकरण एक्सेस'}
            </div>

            <h2 className="mb-5 max-w-lg text-4xl font-black leading-tight">
              {language === 'en' ? 'Build a safer, smarter mining operation.' : 'एक सुरक्षित और स्मार्ट खदान संचालन बनाएं।'}
            </h2>
            <p className="max-w-md text-lg leading-8 text-slate-200">
              {language === 'en'
                ? 'Join the command center for mine inspections, compliance tracking, and operational intelligence.'
                : 'खदान निरीक्षण, अनुपालन ट्रैकिंग और परिचालन बौद्धिकता के लिए कमांड सेंटर में शामिल हों।'}
            </p>
          </div>

          <div className="space-y-4">
            {[
              'Create secure operational access',
              'Track regulatory deadlines in real time',
              'Coordinate mine teams from one platform',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/20 p-3 backdrop-blur-sm">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
                <span className="text-sm text-slate-100">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="card p-8">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold mb-1">Create account</h2>
              <p className="text-slate-500 text-sm">Register as a mine stakeholder</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Full name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <label className="label">Email address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="you@cil.gov.in"
                  required
                />
              </div>

              <div>
                <label className="label">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="9876543210"
                />
              </div>

              <div>
                <label className="label">Role</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="mine_official">Mine Official</option>
                  <option value="corporate">Corporate</option>
                  <option value="admin">Admin</option>
                  <option value="regulator">Regulator</option>
                </select>
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="input-field pr-10"
                    placeholder="Create a strong password"
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
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary-700 hover:text-primary-800">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
