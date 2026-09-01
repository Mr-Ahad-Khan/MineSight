// import { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { ArrowRight, Building2, ShieldCheck, Gauge, MapPinned, ChevronLeft, ChevronRight, PlayCircle, CheckCircle2, BarChart3, Flame, Factory, Shield } from 'lucide-react'
// import toast from 'react-hot-toast'
// import useAuthStore from '../store/authStore'

// const slides = [
//   {
//     title: 'MineSight Digital Governance',
//     subtitle: 'AI-led oversight for coal mining compliance, safety, and production efficiency.',
//     image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
//     badge: 'Coal Intelligence Platform',
//   },
//   {
//     title: 'Safer Mines. Smarter Compliance.',
//     subtitle: 'Track inspections, contractor risks, and environmental checks from one command center.',
//     image: 'https://images.unsplash.com/photo-1532619187608-e5375feb6d0b?auto=format&fit=crop&w=1200&q=80',
//     badge: 'Live Risk Monitoring',
//   },
//   {
//     title: 'See the full picture underground.',
//     subtitle: 'Geo-tagged operations and automated alerts keep every site aligned with safety mandates.',
//     image: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80',
//     badge: 'Real-time Visibility',
//   },
// ]

// const features = [
//   {
//     icon: Gauge,
//     title: 'Dynamic risk scoring',
//     description: 'Identify high-risk operations before issues become incidents.',
//   },
//   {
//     icon: ShieldCheck,
//     title: 'Compliance control',
//     description: 'Keep permits, alerts, and inspections synchronized across every mine.',
//   },
//   {
//     icon: MapPinned,
//     title: 'Geo-aware monitoring',
//     description: 'Understand site conditions through location-based operational analytics.',
//   },
// ]

// const stats = [
//   { label: 'Mines monitored', value: '120+' },
//   { label: 'Inspection score', value: '96.4%' },
//   { label: 'Safety alerts resolved', value: '3.8k' },
//   { label: 'Response time', value: '< 12h' },
// ]

// export default function HomePage() {
//   const [activeSlide, setActiveSlide] = useState(0)
//   const [email, setEmail] = useState('rajesh@ncl.gov.in')
//   const [password, setPassword] = useState('mine123')
//   const [isDemo, setIsDemo] = useState(false)
//   const { login, isLoading, token } = useAuthStore()
//   const navigate = useNavigate()

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setActiveSlide((current) => (current + 1) % slides.length)
//     }, 5000)

//     return () => clearInterval(timer)
//   }, [])

//   const handleSubmit = async (event) => {
//     event.preventDefault()
//     const result = await login(email, password)

//     if (result.success) {
//       toast.success('Login successful. Redirecting to dashboard...')
//       navigate('/app')
//       return
//     }

//     toast.error(result.message)
//   }

//   const quickLogin = (roleEmail, rolePass, label) => {
//     setEmail(roleEmail)
//     setPassword(rolePass)
//     setIsDemo(true)
//     toast.success(`${label} credentials loaded`)
//   }

//   const current = slides[activeSlide]

//   return (
//     <div className="min-h-screen bg-slate-950 text-slate-100">
//       <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
//         <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
//           <div className="flex items-center gap-3">
//             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-primary-600 shadow-lg shadow-emerald-900/30">
//               <Building2 className="h-5 w-5" />
//             </div>
//             <div>
//               <p className="text-sm font-semibold tracking-[0.2em] text-emerald-300 uppercase">MineSight</p>
//               <p className="text-xs text-slate-400">Coal governance platform</p>
//             </div>
//           </div>

//           <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
//             <a href="#overview" className="transition hover:text-white">Overview</a>
//             <a href="#solutions" className="transition hover:text-white">Solutions</a>
//             <a href="#features" className="transition hover:text-white">Features</a>
//             <a href="#contact" className="transition hover:text-white">Contact</a>
//           </nav>

//           <div className="flex items-center gap-3">
//             <button
//               type="button"
//               onClick={() => navigate('/login')}
//               className="hidden rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10 sm:inline-flex"
//             >
//               Sign in
//             </button>
//             <button
//               type="button"
//               onClick={() => (token ? navigate('/app') : navigate('/login'))}
//               className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
//             >
//               {token ? 'Open dashboard' : 'Get started'}
//               <ArrowRight className="h-4 w-4" />
//             </button>
//           </div>
//         </div>
//       </header>

//       <main>
//         <section className="relative overflow-hidden">
//           <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(37,99,235,0.2),transparent_35%)]" />
//           <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
//             <div className="flex flex-col justify-center">
//               <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
//                 <Flame className="h-3.5 w-3.5" />
//                 {current.badge}
//               </div>

//               <h1 className="max-w-xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
//                 {current.title}
//               </h1>

//               <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
//                 {current.subtitle}
//               </p>

//               <div className="mt-8 flex flex-wrap items-center gap-4">
//                 <button
//                   type="button"
//                   onClick={() => navigate('/login')}
//                   className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
//                 >
//                   Explore portal
//                   <ArrowRight className="h-4 w-4" />
//                 </button>
//                 <button
//                   type="button"
//                   className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
//                 >
//                   <PlayCircle className="h-4 w-4" />
//                   Watch demo
//                 </button>
//               </div>

//               <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
//                 {stats.map((item) => (
//                   <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
//                     <div className="text-2xl font-black text-white">{item.value}</div>
//                     <div className="mt-1 text-xs text-slate-400">{item.label}</div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div className="relative">
//               <div className="hero-slider overflow-hidden rounded-[28px] border border-white/10 bg-slate-900 shadow-2xl shadow-slate-950/30">
//                 <div
//                   className="hero-slide"
//                   style={{ backgroundImage: `linear-gradient(135deg, rgba(2,6,23,0.55), rgba(15,23,42,0.2)), url(${current.image})` }}
//                 >
//                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.30),transparent_30%)]" />
//                   <div className="relative flex h-full flex-col justify-between p-6 sm:p-8">
//                     <div className="flex items-center justify-between">
//                       <span className="rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-200">
//                         {current.badge}
//                       </span>
//                       <div className="flex gap-2">
//                         <button
//                           type="button"
//                           aria-label="Previous slide"
//                           onClick={() => setActiveSlide((activeSlide - 1 + slides.length) % slides.length)}
//                           className="rounded-full border border-white/15 bg-slate-950/35 p-2 text-white transition hover:bg-slate-900/70"
//                         >
//                           <ChevronLeft className="h-4 w-4" />
//                         </button>
//                         <button
//                           type="button"
//                           aria-label="Next slide"
//                           onClick={() => setActiveSlide((activeSlide + 1) % slides.length)}
//                           className="rounded-full border border-white/15 bg-slate-950/35 p-2 text-white transition hover:bg-slate-900/70"
//                         >
//                           <ChevronRight className="h-4 w-4" />
//                         </button>
//                       </div>
//                     </div>

//                     <div className="max-w-sm rounded-2xl border border-white/10 bg-slate-950/35 p-4 backdrop-blur-md">
//                       <div className="mb-3 flex items-center gap-2 text-emerald-300">
//                         <Factory className="h-4 w-4" />
//                         Operation health index
//                       </div>
//                       <div className="text-4xl font-black text-white">91.8</div>
//                       <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
//                         <div className="h-full w-[91.8%] rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" />
//                       </div>
//                       <div className="mt-3 text-sm text-slate-300">Above benchmark safety compliance target.</div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-4 flex justify-center gap-2">
//                 {slides.map((slide, index) => (
//                   <button
//                     key={slide.title}
//                     type="button"
//                     aria-label={`Go to slide ${index + 1}`}
//                     onClick={() => setActiveSlide(index)}
//                     className={`h-2.5 rounded-full transition-all ${index === activeSlide ? 'w-10 bg-emerald-400' : 'w-2.5 bg-slate-600'}`}
//                   />
//                 ))}
//               </div>
//             </div>
//           </div>
//         </section>

//         <section id="overview" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
//           <div className="grid gap-6 md:grid-cols-3">
//             {features.map(({ icon: Icon, title, description }) => (
//               <div key={title} className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20">
//                 <div className="mb-4 inline-flex rounded-2xl bg-emerald-500/10 p-3 text-emerald-400">
//                   <Icon className="h-6 w-6" />
//                 </div>
//                 <h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
//                 <p className="text-slate-300">{description}</p>
//               </div>
//             ))}
//           </div>
//         </section>

//         <section id="solutions" className="border-y border-white/10 bg-slate-900/80">
//           <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
//             <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
//               <div>
//                 <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Operations overview</p>
//                 <h2 className="mt-2 text-3xl font-black text-white">One control room for every mine site</h2>
//               </div>
//               <div className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-200">
//                 24/7 monitoring active
//               </div>
//             </div>

//             <div className="grid gap-6 lg:grid-cols-3">
//               {[
//                 {
//                   title: 'Safety dashboards',
//                   text: 'Monitor permit status, near miss trends, and incident escalation in one place.',
//                   image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80',
//                 },
//                 {
//                   title: 'Contractor governance',
//                   text: 'Review contractor performance and compliance track records before approvals.',
//                   image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80',
//                 },
//                 {
//                   title: 'Environmental assurance',
//                   text: 'Track moisture, dust, ventilation, and environmental checkpoints across all sites.',
//                   image: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=900&q=80',
//                 },
//               ].map((card) => (
//                 <div key={card.title} className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950 text-left">
//                   <div
//                     className="h-52 bg-cover bg-center"
//                     style={{ backgroundImage: `url(${card.image})` }}
//                   />
//                   <div className="p-6">
//                     <div className="mb-2 flex items-center gap-2 text-emerald-300">
//                       <CheckCircle2 className="h-4 w-4" />
//                       Live intelligence
//                     </div>
//                     <h3 className="mb-2 text-xl font-bold text-white">{card.title}</h3>
//                     <p className="text-slate-300">{card.text}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </section>

//         <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
//           <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
//             <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-8">
//               <div className="mb-4 inline-flex rounded-full bg-emerald-500/10 p-2 text-emerald-300">
//                 <Shield className="h-5 w-5" />
//               </div>
//               <h3 className="text-3xl font-black text-white">Built for audit readiness</h3>
//               <p className="mt-4 text-slate-300">
//                 Maintain transparent records, reduce administrative friction, and assign actions quickly across teams.
//               </p>

//               <div className="mt-8 space-y-4">
//                 {[
//                   'Automated inspection workflow tracking',
//                   'Instant issue escalation and closure',
//                   'Geo-tagged compliance reminders',
//                   'Role-based access for field teams',
//                 ].map((item) => (
//                   <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-200">
//                     <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-400" />
//                     <span>{item}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6">
//               <div className="mb-6 flex items-center justify-between gap-4">
//                 <div>
//                   <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Operations summary</p>
//                   <h3 className="mt-2 text-2xl font-black text-white">Mine performance snapshot</h3>
//                 </div>
//                 <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">+18.2% month</div>
//               </div>

//               <div className="grid gap-4 sm:grid-cols-2">
//                 {[
//                   { label: 'Active sites', value: '32', icon: Building2 },
//                   { label: 'Safety score', value: '96.4%', icon: ShieldCheck },
//                   { label: 'Alerts', value: '14', icon: Gauge },
//                   { label: 'Reports', value: '248', icon: BarChart3 },
//                 ].map(({ label, value, icon: Icon }) => (
//                   <div key={label} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
//                     <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
//                       <Icon className="h-5 w-5" />
//                     </div>
//                     <div className="text-2xl font-black text-white">{value}</div>
//                     <div className="mt-1 text-sm text-slate-400">{label}</div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </section>

//         <section id="contact" className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
//           <div className="grid gap-8 rounded-[32px] border border-white/10 bg-gradient-to-r from-slate-900 to-slate-950 p-6 lg:grid-cols-[1fr_420px] lg:p-8">
//             <div>
//               <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Ready to scale</p>
//               <h2 className="mt-3 text-3xl font-black text-white">Bring every mine under one intelligent safety system.</h2>
//               <p className="mt-4 max-w-xl text-slate-300">
//                 From mine operators to compliance officers, MineSight empowers decision-makers with real-world operational clarity.
//               </p>
//             </div>

//             <div className="rounded-[28px] border border-white/10 bg-slate-950/80 p-5">
//               <div className="mb-4 flex items-center gap-3">
//                 <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
//                   <Building2 className="h-5 w-5" />
//                 </div>
//                 <div>
//                   <div className="font-bold text-white">Mine control login</div>
//                   <div className="text-xs text-slate-400">Secure field access</div>
//                 </div>
//               </div>

//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <div>
//                   <label className="mb-1 block text-xs font-medium uppercase tracking-[0.15em] text-slate-400">Email</label>
//                   <input
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
//                     placeholder="you@cil.gov.in"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="mb-1 block text-xs font-medium uppercase tracking-[0.15em] text-slate-400">Password</label>
//                   <input
//                     type="password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
//                     placeholder="••••••••"
//                     required
//                   />
//                 </div>

//                 <button
//                   type="submit"
//                   disabled={isLoading}
//                   className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
//                 >
//                   {isLoading ? 'Signing in...' : 'Access dashboard'}
//                 </button>
//               </form>

//               <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
//                 {[
//                   ['rajesh@ncl.gov.in', 'mine123', 'Mine official'],
//                   ['admin@cil.gov.in', 'admin123', 'Admin'],
//                 ].map(([demoEmail, demoPass, label]) => (
//                   <button
//                     key={label}
//                     type="button"
//                     onClick={() => quickLogin(demoEmail, demoPass, label)}
//                     className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-slate-200 transition hover:bg-white/10"
//                   >
//                     {label}
//                   </button>
//                 ))}
//               </div>

//               {isDemo && (
//                 <p className="mt-3 text-xs text-emerald-300">Demo credentials loaded and ready to sign in.</p>
//               )}
//             </div>
//           </div>
//         </section>
//       </main>
//     </div>
//   )
// }











import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Building2,
  ShieldCheck,
  Gauge,
  MapPinned,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  CheckCircle2,
  BarChart3,
  Flame,
  Factory,
  Shield,
  Sparkles,
  Eye,
  EyeOff,
  Zap,
  Languages,
} from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import { useLanguageStore } from '../store/themeStore'
import { translations } from '../i18n/translations'

const slides = [
  {
    title: 'MineSight Digital Governance',
    subtitle: 'AI-led oversight for coal mining compliance, safety, and production efficiency.',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
    badge: 'Coal Intelligence Platform',
  },
  {
    title: 'Safer Mines. Smarter Compliance.',
    subtitle: 'Track inspections, contractor risks, and environmental checks from one command center.',
    image: 'https://images.unsplash.com/photo-1532619187608-e5375feb6d0b?auto=format&fit=crop&w=1200&q=80',
    badge: 'Live Risk Monitoring',
  },
  {
    title: 'See the full picture underground.',
    subtitle: 'Geo-tagged operations and automated alerts keep every site aligned with safety mandates.',
    image: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80',
    badge: 'Real-time Visibility',
  },
]

const features = [
  {
    icon: Gauge,
    title: 'Dynamic risk scoring',
    description: 'Identify high-risk operations before issues become incidents.',
    color: 'from-emerald-400 to-teal-500',
  },
  {
    icon: ShieldCheck,
    title: 'Compliance control',
    description: 'Keep permits, alerts, and inspections synchronized across every mine.',
    color: 'from-cyan-400 to-blue-500',
  },
  {
    icon: MapPinned,
    title: 'Geo-aware monitoring',
    description: 'Understand site conditions through location-based operational analytics.',
    color: 'from-violet-400 to-purple-500',
  },
]

const stats = [
  { label: 'Mines monitored', value: '120+', accent: 'text-emerald-400' },
  { label: 'Inspection score', value: '96.4%', accent: 'text-cyan-400' },
  { label: 'Safety alerts resolved', value: '3.8k', accent: 'text-teal-400' },
  { label: 'Response time', value: '< 12h', accent: 'text-sky-400' },
]

export default function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0)
  const [email, setEmail] = useState('rajesh@ncl.gov.in')
  const [password, setPassword] = useState('mine123')
  const [isDemo, setIsDemo] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading, token } = useAuthStore()
  const { language, setLanguage } = useLanguageStore()
  const navigate = useNavigate()
  const t = translations[language]

  const navItems = language === 'en'
    ? ['Overview', 'Solutions', 'Features', 'Contact']
    : ['अवलोकन', 'उपाय', 'विशेषताएँ', 'संपर्क']

  const localizedCopy = language === 'en'
    ? {
        brandTag: 'Coal governance platform',
        operationsOverview: 'Operations overview',
        controlRoom: 'One control room for every mine site',
        monitoringActive: '24/7 monitoring active',
        liveIntelligence: 'Live intelligence',
        readyToScale: 'Ready to scale',
        scaleHeading: 'Bring every mine under one intelligent safety system.',
        scaleText: 'From mine operators to compliance officers, MineSight empowers decision-makers with real-world operational clarity.',
        secureAccess: 'Secure access',
        realTime: 'Real-time',
        roleBased: 'Role-based',
        loginCardTitle: 'Mine control login',
        loginCardSubtitle: 'Secure field access',
        email: 'Email',
        password: 'Password',
        quickDemoAccess: 'Quick demo access',
        demoReady: 'Demo credentials loaded — ready to sign in',
        operationHealthIndex: 'Operation health index',
        aboveBenchmark: 'Above benchmark safety target',
        supportText: 'Sustainable operations',
      }
    : {
        brandTag: 'कोयला शासन प्लेटफ़ॉर्म',
        operationsOverview: 'संचालन अवलोकन',
        controlRoom: 'हर खदान स्थल के लिए एक नियंत्रण कक्ष',
        monitoringActive: '24/7 निगरानी सक्रिय',
        liveIntelligence: 'लाइव इंटेलिजेंस',
        readyToScale: 'स्केलिंग के लिए तैयार',
        scaleHeading: 'हर खदान को एक स्मार्ट सुरक्षा प्रणाली के तहत लाएँ।',
        scaleText: 'खदान संचालकों से लेकर अनुपालन अधिकारियों तक, माइनसाइट निर्णय निर्माताओं को वास्तविक परिचालन स्पष्टता देता है।',
        secureAccess: 'सुरक्षित एक्सेस',
        realTime: 'रियल-टाइम',
        roleBased: 'भूमिका आधारित',
        loginCardTitle: 'माइन कंट्रोल लॉगिन',
        loginCardSubtitle: 'सुरक्षित फ़ील्ड एक्सेस',
        email: 'ईमेल',
        password: 'पासवर्ड',
        quickDemoAccess: 'त्वरित डेमो एक्सेस',
        demoReady: 'डेमो क्रेडेंशियल लोड हो गया — साइन इन के लिए तैयार',
        operationHealthIndex: 'ऑपरेशन हेल्थ इंडेक्स',
        aboveBenchmark: 'बेचेंच सुरक्षित-प्रतिकूल लक्ष्य से ऊपर',
        supportText: 'सतत संचालन',
      }

  const heroSlides = language === 'en'
    ? slides
    : [
        {
          title: 'माइनसाइट डिजिटल शासन',
          subtitle: 'कोयला खदान अनुपालन, सुरक्षा और उत्पादन दक्षता के लिए एआई आधारित निगरानी।',
          image: slides[0].image,
          badge: 'कोयला इंटेलिजेंस प्लेटफ़ॉर्म',
        },
        {
          title: 'सुरक्षित खदानें। स्मार्ट अनुपालन।',
          subtitle: 'एक कमांड सेंटर से निरीक्षण, ठेकेदार जोखिम और पर्यावरणीय निगरानी ट्रैक करें।',
          image: slides[1].image,
          badge: 'लाइव जोखिम मॉनिटरिंग',
        },
        {
          title: 'भूखण्ड के भीतर पूरा चित्र देखें।',
          subtitle: 'जियो-टैग्ड ऑपरेशन और ऑटोमैटिक अलर्ट हर साइट को सुरक्षा मानकों के साथ जोड़ते हैं।',
          image: slides[2].image,
          badge: 'रियल-टाइम दृश्यता',
        },
      ]

  const translatedSlides = heroSlides
  const current = translatedSlides[activeSlide]

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = await login(email, password)
    if (result.success) {
      toast.success('Login successful. Redirecting to dashboard...')
      navigate('/app')
      return
    }
    toast.error(result.message)
  }

  const quickLogin = (roleEmail, rolePass, label) => {
    setEmail(roleEmail)
    setPassword(rolePass)
    setIsDemo(true)
    toast.success(`${label} credentials loaded`)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500/40 overflow-x-hidden">
      {/* Animated background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-500/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[450px] w-[450px] rounded-full bg-cyan-500/15 blur-[100px] animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-[40%] left-[60%] h-[300px] w-[300px] rounded-full bg-blue-600/10 blur-[80px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500 shadow-lg shadow-emerald-500/40 transition-all duration-300 group-hover:scale-110 group-hover:shadow-emerald-400/60">
              <Building2 className="h-5 w-5 text-slate-950" />
              <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-[0.22em] text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300 uppercase">
                MineSight
              </p>
              <p className="text-xs text-slate-400">{localizedCopy.brandTag}</p>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex">
            {navItems.map((item) => (
              <a
                key={item}
                href={`#${language === 'en' ? item.toLowerCase() : 'overview'}`}
                className="relative py-1 transition-colors hover:text-white after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-emerald-400 after:to-cyan-400 after:transition-all after:duration-300 hover:after:w-full"
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="rounded-full border border-white/15 bg-white/5 p-2.5 text-slate-100 transition hover:bg-white/10"
              aria-label="Toggle language"
              title="Toggle language"
            >
              <Languages className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="hidden rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-100 transition-all hover:bg-white/10 hover:border-emerald-400/40 hover:text-white sm:inline-flex"
            >
              {t.signIn}
            </button>
            <button
              type="button"
              onClick={() => (token ? navigate('/app') : navigate('/login'))}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/30 transition-all hover:shadow-emerald-400/50 hover:scale-105 active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2">
                {token ? t.openDashboard : t.getStarted}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-8 pb-16 lg:pt-12 lg:pb-24">
          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
            {/* Left content */}
            <div className="flex flex-col justify-center">
              <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-300 shadow-lg shadow-emerald-900/20 backdrop-blur-sm">
                <Flame className="h-3.5 w-3.5 text-orange-400 animate-pulse" />
                <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                  {current.badge}
                </span>
              </div>

              <h1 className="max-w-xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-[3.4rem] leading-[1.08]">
                <span className="bg-gradient-to-r from-white via-emerald-100 to-cyan-200 bg-clip-text text-transparent">
                  {current.title}
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300/90">
                {current.subtitle}
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-7 py-3.5 font-bold text-slate-950 shadow-xl shadow-emerald-500/30 transition-all hover:shadow-emerald-400/50 hover:scale-[1.03] active:scale-95"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {t.explorePortal}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </button>

                <button
                  type="button"
                  className="group inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-7 py-3.5 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-500/10"
                >
                  <PlayCircle className="h-5 w-5 text-cyan-400 transition-transform group-hover:scale-110" />
                  {t.watchDemo}
                </button>
              </div>

              {/* Stats */}
              <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {stats.map((item, idx) => (
                  <div
                    key={item.label}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/8 to-white/3 p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/40 hover:shadow-xl hover:shadow-emerald-500/10"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className={`text-2xl font-black ${item.accent} transition-transform group-hover:scale-110`}>
                      {item.value}
                    </div>
                    <div className="mt-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">
                      {item.label}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/0 to-cyan-400/0 group-hover:from-emerald-400/5 group-hover:to-cyan-400/5 transition-all" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Interactive Slider */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-[32px] border border-white/15 bg-slate-900/80 shadow-2xl shadow-emerald-900/20 ring-1 ring-white/10">
                {/* Glow behind card */}
                <div className="absolute -inset-1 rounded-[34px] bg-gradient-to-r from-emerald-500/30 via-cyan-500/20 to-blue-500/20 blur-xl opacity-60" />

                <div
                  className="relative h-[460px] sm:h-[520px] overflow-hidden rounded-[32px] transition-all duration-700"
                  style={{
                    backgroundImage: `linear-gradient(160deg, rgba(2,6,23,0.75), rgba(15,23,42,0.4)), url(${current.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(16,185,129,0.35),transparent_50%)]" />

                  <div className="relative flex h-full flex-col justify-between p-6 sm:p-8">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full border border-emerald-400/50 bg-emerald-500/20 px-4 py-1.5 text-xs font-semibold text-emerald-200 backdrop-blur-md shadow-lg shadow-emerald-900/30">
                        {current.badge}
                      </span>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          aria-label="Previous slide"
                          onClick={() => setActiveSlide((activeSlide - 1 + slides.length) % slides.length)}
                          className="rounded-full border border-white/20 bg-slate-950/60 p-2.5 text-white backdrop-blur-md transition-all hover:bg-emerald-500/20 hover:border-emerald-400/50 hover:scale-110 active:scale-95"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          aria-label="Next slide"
                          onClick={() => setActiveSlide((activeSlide + 1) % slides.length)}
                          className="rounded-full border border-white/20 bg-slate-950/60 p-2.5 text-white backdrop-blur-md transition-all hover:bg-emerald-500/20 hover:border-emerald-400/50 hover:scale-110 active:scale-95"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Floating metric card */}
                    <div className="max-w-xs rounded-2xl border border-white/15 bg-slate-950/70 p-5 backdrop-blur-xl shadow-2xl shadow-black/40">
                      <div className="mb-3 flex items-center gap-2 text-emerald-300">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
                          <Factory className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium">{localizedCopy.operationHealthIndex}</span>
                      </div>

                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-black text-white tracking-tight">91.8</span>
                        <span className="mb-1.5 text-sm font-medium text-emerald-400">/ 100</span>
                      </div>

                      <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 shadow-[0_0_12px_rgba(52,211,153,0.6)] transition-all duration-1000 ease-out"
                          style={{ width: '91.8%' }}
                        />
                      </div>

                      <div className="mt-3 flex items-center gap-2 text-sm text-slate-300">
                        <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                        {localizedCopy.aboveBenchmark}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide indicators */}
              <div className="mt-6 flex justify-center gap-2.5">
                {slides.map((slide, index) => (
                  <button
                    key={slide.title}
                    type="button"
                    aria-label={`Go to slide ${index + 1}`}
                    onClick={() => setActiveSlide(index)}
                    className={`h-2.5 rounded-full transition-all duration-400 ${
                      index === activeSlide
                        ? 'w-12 bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-md shadow-emerald-500/50'
                        : 'w-2.5 bg-slate-600 hover:bg-slate-400 hover:w-6'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="overview" className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description, color }, idx) => (
              <div
                key={title}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 p-7 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:border-white/20 hover:shadow-2xl hover:shadow-emerald-500/10"
              >
                <div className={`mb-5 inline-flex rounded-2xl bg-gradient-to-br ${color} p-3.5 text-slate-950 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-white">{title}</h3>
                <p className="text-slate-300 leading-relaxed">{description}</p>

                {/* Hover gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-[0.07] transition-opacity duration-500`} />
              </div>
            ))}
          </div>
        </section>

        {/* Solutions */}
        <section id="solutions" className="relative border-y border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-950/80">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  {localizedCopy.operationsOverview}
                </p>
                <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
                  {localizedCopy.controlRoom}
                </h2>
              </div>

              <div className="inline-flex items-center gap-2.5 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-5 py-2 text-sm font-medium text-emerald-200 shadow-lg shadow-emerald-900/20">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>
                {localizedCopy.monitoringActive}
              </div>
            </div>

            <div className="grid gap-7 lg:grid-cols-3">
              {[
                {
                  title: language === 'en' ? 'Safety dashboards' : 'सुरक्षा डैशबोर्ड',
                  text: language === 'en'
                    ? 'Monitor permit status, near miss trends, and incident escalation in one place.'
                    : 'परमिट स्थिति, नज़दीकी घटना रुझान और दुर्घटना एस्केलेशन को एक ही स्थान पर देखें।',
                  image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80',
                  accent: 'from-emerald-500/20 to-teal-500/10',
                },
                {
                  title: language === 'en' ? 'Contractor governance' : 'ठेकेदार शासन',
                  text: language === 'en'
                    ? 'Review contractor performance and compliance track records before approvals.'
                    : 'स्वीकृति से पहले ठेकेदार के प्रदर्शन और अनुपालन ट्रैक रिकॉर्ड की समीक्षा करें।',
                  image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80',
                  accent: 'from-cyan-500/20 to-blue-500/10',
                },
                {
                  title: language === 'en' ? 'Environmental assurance' : 'पर्यावरणीय आश्वासन',
                  text: language === 'en'
                    ? 'Track moisture, dust, ventilation, and environmental checkpoints across all sites.'
                    : 'सभी स्थलों पर नमी, धूल, वेंटिलेशन और पर्यावरणीय चेकपॉइंट ट्रैक करें।',
                  image: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=900&q=80',
                  accent: 'from-violet-500/20 to-purple-500/10',
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80 transition-all duration-500 hover:-translate-y-2 hover:border-emerald-400/30 hover:shadow-2xl hover:shadow-emerald-500/15"
                >
                  <div className="relative h-52 overflow-hidden">
                    <div
                      className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                      style={{ backgroundImage: `url(${card.image})` }}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${card.accent} to-transparent opacity-60`} />
                  </div>

                  <div className="p-6">
                    <div className="mb-3 flex items-center gap-2 text-emerald-300">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-semibold">{localizedCopy.liveIntelligence}</span>
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-white group-hover:text-emerald-200 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-slate-300 leading-relaxed">{card.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features / Audit readiness */}
        <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            {/* Left card */}
            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-8 shadow-2xl">
              <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />

              <div className="relative">
                <div className="mb-5 inline-flex rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 p-3 text-slate-950 shadow-lg shadow-emerald-500/30">
                  <Shield className="h-6 w-6" />
                </div>

                <h3 className="text-3xl font-black text-white">{language === 'en' ? 'Built for audit readiness' : 'अडिट तत्परता के लिए निर्मित'}</h3>
                <p className="mt-4 text-slate-300 leading-relaxed">
                  {language === 'en'
                    ? 'Maintain transparent records, reduce administrative friction, and assign actions quickly across teams.'
                    : 'पारदर्शी रिकॉर्ड बनाए रखें, प्रशासनिक जटिलता कम करें और टीमों में कार्रवाई तुरंत सौंपें।'}
                </p>

                <div className="mt-8 space-y-3">
                  {[
                    language === 'en' ? 'Automated inspection workflow tracking' : 'ऑटोमेटेड निरीक्षण वर्कफ़्लो ट्रैकिंग',
                    language === 'en' ? 'Instant issue escalation and closure' : 'तत्काल समस्या प्रगति और समाधान',
                    language === 'en' ? 'Geo-tagged compliance reminders' : 'जियो-टैग्ड अनुपालन रिमाइंडर',
                    language === 'en' ? 'Role-based access for field teams' : 'फ़ील्ड टीमों के लिए भूमिका आधारित एक्सेस',
                  ].map((item) => (
                    <div
                      key={item}
                      className="group flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:border-emerald-400/30 hover:bg-emerald-500/5"
                    >
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400 transition-transform group-hover:scale-110" />
                      <span className="text-slate-200">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right snapshot */}
            <div className="rounded-[32px] border border-white/10 bg-slate-900/70 p-7 shadow-2xl backdrop-blur-sm">
              <div className="mb-7 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">{language === 'en' ? 'Operations summary' : 'संचालन सारांश'}</p>
                  <h3 className="mt-2 text-2xl font-black text-white">{language === 'en' ? 'Mine performance snapshot' : 'खदान प्रदर्शन स्नैपशॉट'}</h3>
                </div>
                <div className="rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-400/30 px-4 py-1.5 text-sm font-bold text-emerald-300">
                  {language === 'en' ? '+18.2% month' : '+18.2% महीना'}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: language === 'en' ? 'Active sites' : 'सक्रिय साइट्स', value: '32', icon: Building2, color: 'from-emerald-400 to-teal-500' },
                  { label: language === 'en' ? 'Safety score' : 'सुरक्षा स्कोर', value: '96.4%', icon: ShieldCheck, color: 'from-cyan-400 to-blue-500' },
                  { label: language === 'en' ? 'Alerts' : 'अलर्ट', value: '14', icon: Gauge, color: 'from-amber-400 to-orange-500' },
                  { label: language === 'en' ? 'Reports' : 'रिपोर्ट्स', value: '248', icon: BarChart3, color: 'from-violet-400 to-purple-500' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div
                    key={label}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-lg"
                  >
                    <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-slate-950 shadow-md transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-2xl font-black text-white">{value}</div>
                    <div className="mt-1 text-sm text-slate-400">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact / Login */}
        <section id="contact" className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-7 lg:p-10 shadow-2xl">
            {/* Background accents */}
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

            <div className="relative grid gap-10 lg:grid-cols-[1fr_420px]">
              <div className="flex flex-col justify-center">
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  {localizedCopy.readyToScale}
                </p>
                <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl leading-tight">
                  {localizedCopy.scaleHeading}
                </h2>
                <p className="mt-5 max-w-xl text-slate-300 leading-relaxed">
                  {localizedCopy.scaleText}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  {[
                    { icon: ShieldCheck, label: localizedCopy.secureAccess },
                    { icon: Zap, label: localizedCopy.realTime },
                    { icon: CheckCircle2, label: localizedCopy.roleBased },
                  ].map(({ icon: Icon, label }) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur-sm"
                    >
                      <Icon className="h-4 w-4 text-emerald-400" />
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Login card */}
              <div className="relative rounded-[28px] border border-white/15 bg-slate-950/90 p-6 shadow-2xl backdrop-blur-xl">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/30">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-lg">{localizedCopy.loginCardTitle}</div>
                    <div className="text-xs text-slate-400">{localizedCopy.loginCardSubtitle}</div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      {localizedCopy.email}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-slate-900/80 px-4 py-3 text-white placeholder:text-slate-500 transition-all focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
                      placeholder="you@cil.gov.in"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      {localizedCopy.password}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-xl border border-white/15 bg-slate-900/80 px-4 py-3 pr-12 text-white placeholder:text-slate-500 transition-all focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-emerald-300"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-4 py-3.5 font-bold text-slate-950 shadow-lg shadow-emerald-500/30 transition-all hover:shadow-emerald-400/50 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70 active:scale-[0.98]"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isLoading ? 'Signing in...' : 'Access dashboard'}
                      {!isLoading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
                    </span>
                  </button>
                </form>

                <div className="mt-6">
                  <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">
                    {localizedCopy.quickDemoAccess}
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      ['rajesh@ncl.gov.in', 'mine123', 'Mine official'],
                      ['admin@cil.gov.in', 'admin123', 'Admin'],
                    ].map(([demoEmail, demoPass, label]) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => quickLogin(demoEmail, demoPass, label)}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-medium text-slate-200 transition-all hover:bg-emerald-500/10 hover:border-emerald-400/40 hover:text-emerald-200 active:scale-95"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {isDemo && (
                  <p className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" />
                    {localizedCopy.demoReady}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}