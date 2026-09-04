import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import { useLanguageStore } from '../store/themeStore'
import { translations } from '../i18n/translations'
import { requestEmailOtp, verifyEmailOtp } from '../services/api'

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'mine_official',
    phone: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [otp, setOtp] = useState('')
  const [emailVerificationToken, setEmailVerificationToken] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
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
    if (name === 'email') {
      setOtp('')
      setOtpSent(false)
      setEmailVerificationToken('')
    }
  }

  const handleSendOtp = async () => {
    setIsSendingOtp(true)
    try {
      const { data } = await requestEmailOtp({ email: form.email.trim() })
      setOtpSent(true)
      if (data.devOtp) {
        toast.success(`Demo OTP: ${data.devOtp}`)
      } else {
        toast.success('Verification code sent to your mobile')
      }
    } catch (error) {
      const message = error.response?.data?.message || (error.response?.status === 503
        ? 'Email service is not configured. Add email settings to backend/.env.'
        : 'Unable to send verification code')
      toast.error(message)
    } finally {
      setIsSendingOtp(false)
    }
  }

  const handleOtpChange = async (e) => {
    const code = e.target.value.replace(/\D/g, '').slice(0, 6)
    setOtp(code)
    if (code.length !== 6 || isVerifyingOtp || emailVerificationToken) return

    setIsVerifyingOtp(true)
    try {
      const { data } = await verifyEmailOtp({ email: form.email.trim(), code })
      setEmailVerificationToken(data.emailVerificationToken)
      toast.success('Email verified')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Incorrect verification code')
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role,
      phone: form.phone.trim(),
      emailVerificationToken,
    }

    if (!emailVerificationToken) {
      toast.error('Verify your email before creating an account')
      return
    }

    const result = await register(payload)

    if (result.success) {
      toast.success('Account created successfully!')
      navigate('/app', { replace: true })
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
        >
        </div>
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
                <label className="label" htmlFor="email">Email address</label>
                <div className="flex gap-2">
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="input-field min-w-0 flex-1"
                    placeholder="you@cil.gov.in"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isSendingOtp || !/^\S+@\S+\.\S+$/.test(form.email.trim()) || Boolean(emailVerificationToken)}
                    className={`shrink-0 rounded-lg px-3 text-sm font-semibold transition ${emailVerificationToken ? 'bg-emerald-100 text-emerald-700' : 'bg-[#0d3f6b] text-white hover:bg-[#092f52] disabled:cursor-not-allowed disabled:opacity-50'}`}
                  >
                    {emailVerificationToken ? <CheckCircle2 className="h-5 w-5" /> : isSendingOtp ? 'Sending...' : 'Verify'}
                  </button>
                </div>
                {otpSent && !emailVerificationToken && (
                  <div className="mt-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={otp}
                      onChange={handleOtpChange}
                      className="input-field tracking-[0.4em]"
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      autoComplete="one-time-code"
                      aria-label="Email verification code"
                    />
                    <p className="mt-1 text-xs text-slate-500">{isVerifyingOtp ? 'Verifying code...' : 'Code expires in 10 minutes.'}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="label" htmlFor="phone">Phone number (optional)</label>
                <div className="flex gap-2">
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="input-field min-w-0 flex-1"
                    placeholder="9876543210"
                    maxLength={10}
                  />
                </div>
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
                  <option value="contractor">Contractor</option>
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
