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

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUp,
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
  Moon,
  Sun,
  Mail,
  Send,
} from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore";
import useThemeStore, { useLanguageStore } from "../store/themeStore";
import { translations } from "../i18n/translations";
import { getPublicHomeStats, saveChatMessage } from "../services/api";
import BrandLogo from "../components/common/BrandLogo";

const slides = [
  {
    title: "Powering Progress. Built on Reliability.",
    subtitle:
      "Efficient coal extraction. Uncompromising safety. Delivered at scale.",
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=70",
    badge: "Coal Intelligence Platform",
  },
  {
    title: "Safer Mines. Smarter Compliance.",
    subtitle:
      "Track inspections, contractor risks, and environmental checks from one command center.",
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=70",
    badge: "Live Risk Monitoring",
  },
  {
    title: "See the full picture underground.",
    subtitle:
      "Geo-tagged operations and automated alerts keep every site aligned with safety mandates.",
    image:
      "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1000&q=70",
    badge: "Real-time Visibility",
  },
];

const features = [
  {
    icon: Gauge,
    title: "Dynamic risk scoring",
    description:
      "Identify high-risk operations before issues become incidents.",
    color: "from-emerald-400 to-teal-500",
  },
  {
    icon: ShieldCheck,
    title: "Compliance control",
    description:
      "Keep permits, alerts, and inspections synchronized across every mine.",
    color: "from-cyan-400 to-blue-500",
  },
  {
    icon: MapPinned,
    title: "Geo-aware monitoring",
    description:
      "Understand site conditions through location-based operational analytics.",
    color: "from-violet-400 to-purple-500",
  },
];

const stats = [
  { label: "Mines monitored", value: "120+", accent: "text-emerald-400" },
  { label: "Inspection score", value: "96.4%", accent: "text-cyan-400" },
  { label: "Safety alerts resolved", value: "3.8k", accent: "text-teal-400" },
  { label: "Response time", value: "< 12h", accent: "text-sky-400" },
];

export default function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [metricValues, setMetricValues] = useState({
    production: 0,
    availability: 0,
    ltis: 0,
    experience: 0,
  });
  const [homeStats, setHomeStats] = useState(null);
  const [email, setEmail] = useState("rajesh@ncl.gov.in");
  const [password, setPassword] = useState("mine123");
  const [isDemo, setIsDemo] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // Do not cover the first mobile viewport with a non-essential panel. It is
  // still immediately available from the floating assistant button.
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantChatOpen, setAssistantChatOpen] = useState(false);
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantEmail, setAssistantEmail] = useState("");
  const [assistantSending, setAssistantSending] = useState(false);
  const [assistantReady, setAssistantReady] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    organization: "",
    subject: "",
    message: "",
  });
  const [contactSending, setContactSending] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [assistantMessages, setAssistantMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Hello! I can help with inspections, compliance, mine safety, and dashboards.",
    },
  ]);
  const { login, isLoading, token } = useAuthStore();
  const { darkMode, toggleDarkMode } = useThemeStore();
  const { language, setLanguage } = useLanguageStore();
  const navigate = useNavigate();
  const t = translations[language];

  const navItems =
    language === "en"
      ? ["Overview", "Solutions", "Features", "Contact"]
      : ["अवलोकन", "उपाय", "विशेषताएँ", "संपर्क"];

  const localizedCopy =
    language === "en"
      ? {
          brandTag: "Coal governance platform",
          operationsOverview: "Operations overview",
          controlRoom: "One control room for every mine site",
          monitoringActive: "24/7 monitoring active",
          liveIntelligence: "Live intelligence",
          readyToScale: "Ready to scale",
          scaleHeading: "Bring every mine under one intelligent safety system.",
          scaleText:
            "From mine operators to compliance officers, MineSight empowers decision-makers with real-world operational clarity.",
          secureAccess: "Secure access",
          realTime: "Real-time",
          roleBased: "Role-based",
          loginCardTitle: "Mine control login",
          loginCardSubtitle: "Secure field access",
          email: "Email",
          password: "Password",
          quickDemoAccess: "Quick demo access",
          demoReady: "Demo credentials loaded — ready to sign in",
          operationHealthIndex: "Operation health index",
          aboveBenchmark: "Above benchmark safety target",
          supportText: "Sustainable operations",
        }
      : {
          brandTag: "कोयला शासन प्लेटफ़ॉर्म",
          operationsOverview: "संचालन अवलोकन",
          controlRoom: "हर खदान स्थल के लिए एक नियंत्रण कक्ष",
          monitoringActive: "24/7 निगरानी सक्रिय",
          liveIntelligence: "लाइव इंटेलिजेंस",
          readyToScale: "स्केलिंग के लिए तैयार",
          scaleHeading: "हर खदान को एक स्मार्ट सुरक्षा प्रणाली के तहत लाएँ।",
          scaleText:
            "खदान संचालकों से लेकर अनुपालन अधिकारियों तक, माइनसाइट निर्णय निर्माताओं को वास्तविक परिचालन स्पष्टता देता है।",
          secureAccess: "सुरक्षित एक्सेस",
          realTime: "रियल-टाइम",
          roleBased: "भूमिका आधारित",
          loginCardTitle: "माइन कंट्रोल लॉगिन",
          loginCardSubtitle: "सुरक्षित फ़ील्ड एक्सेस",
          email: "ईमेल",
          password: "पासवर्ड",
          quickDemoAccess: "त्वरित डेमो एक्सेस",
          demoReady: "डेमो क्रेडेंशियल लोड हो गया — साइन इन के लिए तैयार",
          operationHealthIndex: "ऑपरेशन हेल्थ इंडेक्स",
          aboveBenchmark: "बेचेंच सुरक्षित-प्रतिकूल लक्ष्य से ऊपर",
          supportText: "सतत संचालन",
        };

  const heroSlides =
    language === "en"
      ? slides
      : [
          {
            title: "माइनसाइट डिजिटल शासन",
            subtitle:
              "कोयला खदान अनुपालन, सुरक्षा और उत्पादन दक्षता के लिए एआई आधारित निगरानी।",
            image: slides[0].image,
            badge: "कोयला इंटेलिजेंस प्लेटफ़ॉर्म",
          },
          {
            title: "सुरक्षित खदानें। स्मार्ट अनुपालन।",
            subtitle:
              "एक कमांड सेंटर से निरीक्षण, ठेकेदार जोखिम और पर्यावरणीय निगरानी ट्रैक करें।",
            image: slides[1].image,
            badge: "लाइव जोखिम मॉनिटरिंग",
          },
          {
            title: "भूखण्ड के भीतर पूरा चित्र देखें।",
            subtitle:
              "जियो-टैग्ड ऑपरेशन और ऑटोमैटिक अलर्ट हर साइट को सुरक्षा मानकों के साथ जोड़ते हैं।",
            image: slides[2].image,
            badge: "रियल-टाइम दृश्यता",
          },
        ];

  const translatedSlides = heroSlides;
  const current = translatedSlides[activeSlide];

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return undefined;

    const advanceSlide = () => {
      if (!document.hidden)
        setActiveSlide((current) => (current + 1) % slides.length);
    };
    const timer = window.setInterval(advanceSlide, 5000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;
    getPublicHomeStats()
      .then((response) => {
        if (isMounted) setHomeStats(response.data.data);
      })
      // Public stats are progressive enhancement: retain the static landing page
      // when the API is unavailable instead of emitting a noisy console error.
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!homeStats) return undefined;

    const targets = {
      production: homeStats.activeMines,
      availability: homeStats.averageCompliance,
      ltis: homeStats.openInspections,
      experience: homeStats.totalReports,
    };
    const duration = 1400;
    const startedAt = Date.now();
    const timer = setInterval(() => {
      const progress = Math.min((Date.now() - startedAt) / duration, 1);
      const easedProgress = 1 - (1 - progress) ** 3;

      setMetricValues({
        production: Math.round(targets.production * easedProgress),
        availability: Number((targets.availability * easedProgress).toFixed(1)),
        ltis: targets.ltis,
        experience: Math.round(targets.experience * easedProgress),
      });

      if (progress === 1) clearInterval(timer);
    }, 32);

    return () => clearInterval(timer);
  }, [homeStats]);

  useEffect(() => {
    const timer = setTimeout(() => setAssistantReady(true), 120);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 360);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      toast.success("Login successful. Redirecting to dashboard...");
      navigate("/app");
      return;
    }
    toast.error(result.message);
  };

  const handleContactSubmit = async (event) => {
    event.preventDefault();
    if (contactSending) return;

    setContactSending(true);
    try {
      const message = [
        `Name: ${contactForm.name}`,
        `Organization: ${contactForm.organization || "Not provided"}`,
        `Subject: ${contactForm.subject}`,
        "",
        contactForm.message,
      ].join("\n");

      await saveChatMessage({
        email: contactForm.email.trim(),
        message,
        reply:
          "Contact form inquiry received. Our team will follow up shortly.",
      });
      toast.success(
        language === "en"
          ? "Message sent successfully."
          : "संदेश सफलतापूर्वक भेजा गया।",
      );
      setContactForm({
        name: "",
        email: "",
        organization: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      toast.error(
        language === "en"
          ? "Could not send your message right now."
          : "अभी संदेश नहीं भेजा जा सका।",
      );
    } finally {
      setContactSending(false);
    }
  };

  const quickLogin = (roleEmail, rolePass, label) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setIsDemo(true);
    toast.success(`${label} credentials loaded`);
  };

  const getAssistantReply = (message) => {
    const lower = message.toLowerCase();

    if (lower.includes("inspection") || lower.includes("inspect")) {
      return "You can review inspection status, photos, and voice notes from the dashboard and inspection module.";
    }
    if (lower.includes("risk") || lower.includes("safety")) {
      return "I can help prioritize high-risk mines and track safety escalations in real time.";
    }
    if (lower.includes("compliance") || lower.includes("permit")) {
      return "Compliance tracking is available for permits, deadlines, and alert follow-up across all mines.";
    }
    if (lower.includes("contractor")) {
      return "You can review team compliance, contractor performance, and approval history from the contractor section.";
    }
    if (lower.includes("hello") || lower.includes("hi")) {
      return "Hi! I can help you navigate inspections, alerts, risk trends, and site compliance.";
    }

    return "I can help you with mine governance, compliance, inspection workflows, and operational risk analysis.";
  };

  const handleAssistantSend = async () => {
    const trimmed = assistantInput.trim();
    if (!trimmed || !assistantEmail.trim() || assistantSending) return;

    const reply = getAssistantReply(trimmed);
    setAssistantSending(true);

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: trimmed,
    };

    setAssistantMessages((prev) => [...prev, userMessage]);
    setAssistantInput("");

    try {
      await saveChatMessage({
        email: assistantEmail.trim(),
        message: trimmed,
        reply,
      });
      setAssistantMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: `${reply} Your message has been saved and sent to our team.`,
        },
      ]);
    } catch (error) {
      setAssistantMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: "We could not send your message right now. Please try again.",
        },
      ]);
    } finally {
      setAssistantSending(false);
    }
  };

  return (
    <div
      className={`home-page ${darkMode ? "theme-dark bg-slate-950 text-slate-100" : "theme-light bg-[#f3eadb] text-slate-800"} min-h-screen overflow-x-hidden selection:bg-emerald-500/40`}
    >
      {/* Animated background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-500/20 blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-[-10%] right-[-10%] h-[450px] w-[450px] rounded-full bg-cyan-500/15 blur-[100px] animate-pulse"
          style={{ animationDelay: "1.5s" }}
        />
        <div className="absolute top-[40%] left-[60%] h-[300px] w-[300px] rounded-full bg-blue-600/10 blur-[80px]" />
      </div>

      {/* Header */}
      <header
        className={`fixed inset-x-0 top-0 z-40 border-b backdrop-blur-2xl ${darkMode ? "border-[#61543b] bg-[#151719]/95" : "border-[#c9b69d] bg-[#f3eadb]/95"}`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-1 px-2 py-2 sm:gap-4 sm:px-6 sm:py-4 lg:px-8">
          <div
            className="group flex min-w-0 items-center gap-2 cursor-pointer sm:gap-3"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <BrandLogo imageClassName="h-10 w-28 rounded min-[380px]:h-12 min-[380px]:w-36 sm:h-14 sm:w-44" />
          </div>

          <nav
            className={`hidden items-center gap-8 text-sm font-medium md:flex ${darkMode ? "text-[#d7d0c4]" : "text-[#4d5b62]"}`}
          >
            {navItems.map((item) => (
              <a
                key={item}
                href={`#${language === "en" ? item.toLowerCase() : "overview"}`}
                className={`relative py-1 transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-[#e5a416] after:transition-all after:duration-300 hover:after:w-full ${darkMode ? "hover:text-white" : "hover:text-[#17314a]"}`}
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:gap-3">
            <button
              type="button"
              onClick={toggleDarkMode}
              className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${darkMode ? "border-white/20 bg-white/5 text-[#e5a416] hover:border-[#e5a416]" : "border-[#b99a72] bg-white/60 text-[#0d3f6d] hover:border-[#0d3f6d]"}`}
              aria-label={
                darkMode ? "Switch to light mode" : "Switch to dark mode"
              }
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setLanguage(language === "en" ? "hi" : "en")}
              className={`inline-flex h-9 items-center gap-0.5 rounded-full border p-1 text-[10px] font-bold tracking-wide transition hover:border-[#e5a416] sm:gap-1 ${darkMode ? "border-white/20 bg-white/5 text-[#e5ded2]" : "border-[#b99a72] bg-white/60 text-[#4d5b62]"}`}
              aria-label="Change language"
              title="Change language"
            >
              <Languages className="mx-0.5 h-3.5 w-3.5 text-[#e5a416] sm:mx-1" />
              <span
                className={`rounded-full px-2 py-1 ${language === "en" ? "bg-[#e5a416] text-[#151719]" : ""}`}
              >
                EN
              </span>
              <span
                className={`rounded-full px-2 py-1 ${language === "hi" ? "bg-[#e5a416] text-[#151719]" : ""}`}
              >
                हिंदी
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className={`hidden rounded-md border px-5 py-2.5 text-sm font-medium transition-all hover:border-[#e5a416] sm:inline-flex ${darkMode ? "border-white/30 bg-white/5 text-[#f1ece4] hover:bg-[#e5a416]/10 hover:text-white" : "border-[#b99a72] bg-white/50 text-[#17314a] hover:bg-[#e5a416]/10"}`}
            >
              {t.signIn}
            </button>
            <button
              type="button"
              onClick={() => (token ? navigate("/app") : navigate("/login"))}
              className="group relative inline-flex items-center overflow-hidden rounded-md bg-[#e5a416] px-2.5 py-2.5 text-sm font-bold text-[#151719] shadow-lg shadow-black/30 transition-all hover:bg-[#f5b82c] hover:scale-105 active:scale-95 sm:gap-2 sm:px-5"
            >
              <span className="relative z-10 flex items-center sm:gap-2">
                <span className="hidden sm:inline">
                  {token ? t.openDashboard : t.getStarted}
                </span>
                <span className="sm:hidden">{token ? "Open" : "Start"}</span>
                <ArrowRight className="ml-2 hidden h-4 w-4 transition-transform group-hover:translate-x-1 sm:inline" />
              </span>
              <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          </div>
        </div>
      </header>

      <main className="pt-[60px] sm:pt-[76px]">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-[#3b3b3b] bg-[#0c0f11]">
          <div
            className="relative min-h-[520px] bg-cover bg-center sm:min-h-[590px] lg:min-h-[650px]"
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(5, 8, 10, 0.68) 0%, rgba(5, 8, 10, 0.42) 42%, rgba(5, 8, 10, 0.12) 78%), linear-gradient(0deg, rgba(5, 8, 10, 0.52) 0%, transparent 45%), url(${current.image})`,
            }}
          >
            <div className="mx-auto flex min-h-[520px] max-w-7xl items-center px-4 py-12 sm:min-h-[590px] sm:px-8 sm:py-16 lg:min-h-[650px] lg:px-10">
              <div className="max-w-2xl">
                <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[#f3b323] sm:mb-5 sm:text-xs sm:tracking-[0.24em]">
                  {current.badge}
                </p>
                <h1 className="max-w-2xl text-3xl font-black leading-[1.05] tracking-tight text-white min-[380px]:text-4xl sm:text-6xl lg:text-[4.4rem]">
                  {current.title}
                </h1>
                <p className="mt-6 max-w-xl text-base leading-7 text-slate-200 sm:text-lg">
                  {current.subtitle}
                </p>

                <div className="mt-8 flex flex-col items-stretch gap-3 min-[420px]:flex-row min-[420px]:flex-wrap min-[420px]:items-center sm:mt-9 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="group inline-flex items-center justify-center gap-4 rounded-md bg-[#e5a416] px-5 py-3.5 text-sm font-bold uppercase tracking-wide text-[#111315] transition hover:bg-[#f5b82c]"
                  >
                    {activeSlide === 0 ? "Explore Operations" : t.explorePortal}
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-3 rounded-md border border-white/70 bg-black/25 px-5 py-3.5 text-sm font-bold uppercase tracking-wide text-white backdrop-blur-sm transition hover:bg-white/10"
                  >
                    <PlayCircle className="h-5 w-5" />
                    {activeSlide === 0
                      ? "Download Capability Statement"
                      : t.watchDemo}
                  </button>
                </div>

                <div className="mt-8 flex items-center gap-2 sm:mt-10 sm:gap-3">
                  {slides.map((slide, index) => (
                    <button
                      key={slide.title}
                      type="button"
                      aria-label={`Go to slide ${index + 1}`}
                      onClick={() => setActiveSlide(index)}
                      className={`h-1.5 rounded-full transition-all ${index === activeSlide ? "w-12 bg-[#e5a416]" : "w-5 bg-white/50 hover:bg-white"}`}
                    />
                  ))}
                  <div className="ml-4 flex gap-2">
                    <button
                      type="button"
                      aria-label="Previous slide"
                      onClick={() =>
                        setActiveSlide(
                          (activeSlide - 1 + slides.length) % slides.length,
                        )
                      }
                      className="rounded-md border border-white/40 bg-black/30 p-2 text-white transition hover:border-[#e5a416] hover:text-[#f3b323]"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Next slide"
                      onClick={() =>
                        setActiveSlide((activeSlide + 1) % slides.length)
                      }
                      className="rounded-md border border-white/40 bg-black/30 p-2 text-white transition hover:border-[#e5a416] hover:text-[#f3b323]"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/15 bg-[#101416]">
            <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-white/20 sm:grid-cols-4 sm:divide-y-0">
              {[
                {
                  value: metricValues.production,
                  suffix: "",
                  label: "Active Mines",
                  detail: "Sites currently operating",
                  progress: Math.min(metricValues.production * 10, 100),
                },
                {
                  value: `${metricValues.availability}%`,
                  suffix: "",
                  label: "Average Compliance",
                  detail: "Across active mine sites",
                  progress: metricValues.availability,
                },
                {
                  value: metricValues.ltis,
                  suffix: "",
                  label: "Open Inspections",
                  detail: "Items needing attention",
                  progress: Math.min(metricValues.ltis * 5, 100),
                },
                {
                  value: metricValues.experience,
                  suffix: "",
                  label: "Total Reports",
                  detail: "Compliance, inspection and alert records",
                  progress: Math.min(metricValues.experience * 5, 100),
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="group relative overflow-hidden px-5 py-5 transition-colors duration-300 hover:bg-[#1a1e1f] sm:px-8 sm:py-6 lg:px-12"
                >
                  <div className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-[#e5a416] transition-transform duration-500 group-hover:scale-x-100" />
                  <div className="flex items-end justify-between gap-3">
                    <div className="text-3xl font-black text-[#e5a416] transition-transform duration-300 group-hover:-translate-y-0.5 sm:text-4xl lg:text-5xl">
                      {item.value}
                      <span className="ml-1 text-xl sm:text-2xl">
                        {item.suffix}
                      </span>
                    </div>
                    <span className="mb-1 hidden text-[10px] font-bold uppercase tracking-[0.16em] text-[#f3b323] opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:block">
                      Live
                    </span>
                  </div>
                  <div className="mt-1 text-xs font-semibold text-slate-100 sm:text-sm">
                    {item.label}
                  </div>
                  <div className="mt-1 max-h-0 overflow-hidden text-[11px] text-[#aaa69e] opacity-0 transition-all duration-300 group-hover:max-h-8 group-hover:opacity-100">
                    {item.detail}
                  </div>
                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[#e5a416] transition-[width] duration-700"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="overview"
          className="relative scroll-mt-[76px] overflow-hidden border-y border-[#263c48] bg-[#101c24]"
        >
          <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-[#1c5960]/20 blur-3xl" />
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="mb-12 flex flex-col gap-6 border-b border-white/10 pb-10 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.28em] text-[#e5a416]">
                  <span className="h-px w-10 bg-[#e5a416]" />
                  MineSight capabilities
                </div>
                <h2 className="text-3xl font-black leading-tight text-white sm:text-5xl">
                  Intelligence that keeps every operation moving.
                </h2>
                <p className="mt-4 max-w-xl text-base leading-7 text-[#c6c9c1] sm:text-lg">
                  Turn field activity into clear decisions with connected
                  safety, compliance, and location intelligence.
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3 text-sm text-[#b8c8cd]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#39c7b0] shadow-[0_0_0_4px_rgba(57,199,176,0.12)]" />
                Built for daily decisions
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {features.map(({ icon: Icon, title, description }, idx) => (
                <article
                  key={title}
                  className="group relative overflow-hidden border border-white/10 bg-[#172730] p-6 transition-colors duration-300 hover:border-[#e5a416]/60 hover:bg-[#1c3039] sm:p-7"
                >
                  <div className="mb-10 flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#39c7b0]/30 bg-[#143c43] text-[#61dfca]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="font-mono text-xs font-semibold tracking-[0.2em] text-[#71868e]">
                      0{idx + 1} / 03
                    </span>
                  </div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#e5a416]">
                    Core capability
                  </p>
                  <h3 className="text-xl font-bold text-white">{title}</h3>
                  <p className="mt-3 min-h-[56px] leading-relaxed text-[#b9c2c2]">
                    {description}
                  </p>
                  <div className="mt-6 flex items-center gap-2 border-t border-white/10 pt-4 text-xs font-semibold text-[#89a3a8]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#e5a416]" />
                    Connected to your control room
                  </div>
                  <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#e5a416] transition-all duration-300 group-hover:w-full" />
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Solutions */}
        <section
          id="solutions"
          className="relative scroll-mt-[76px] overflow-hidden border-y border-[#2d706e] bg-gradient-to-b from-[#0e272d] via-[#102d32] to-[#101416]"
        >
          <div className="pointer-events-none absolute -right-24 top-16 h-72 w-72 rounded-full bg-[#e5a416]/[0.06] blur-3xl" />
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#39c7b0]">
                  {localizedCopy.operationsOverview}
                </p>
                <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
                  {localizedCopy.controlRoom}
                </h2>
              </div>

              <div className="inline-flex items-center gap-2.5 rounded-full border border-[#39c7b0]/40 bg-[#39c7b0]/10 px-5 py-2 text-sm font-medium text-[#8de4d7] shadow-lg shadow-black/20">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#39c7b0] opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#39c7b0]" />
                </span>
                {localizedCopy.monitoringActive}
              </div>
            </div>

            <div className="grid gap-7 lg:grid-cols-3">
              {[
                {
                  title:
                    language === "en"
                      ? "Safety dashboards"
                      : "सुरक्षा डैशबोर्ड",
                  text:
                    language === "en"
                      ? "Monitor permit status, near miss trends, and incident escalation in one place."
                      : "परमिट स्थिति, नज़दीकी घटना रुझान और दुर्घटना एस्केलेशन को एक ही स्थान पर देखें।",
                  image:
                    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80",
                  accent: "from-emerald-500/20 to-teal-500/10",
                },
                {
                  title:
                    language === "en"
                      ? "Contractor governance"
                      : "ठेकेदार शासन",
                  text:
                    language === "en"
                      ? "Review contractor performance and compliance track records before approvals."
                      : "स्वीकृति से पहले ठेकेदार के प्रदर्शन और अनुपालन ट्रैक रिकॉर्ड की समीक्षा करें।",
                  image:
                    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80",
                  accent: "from-cyan-500/20 to-blue-500/10",
                },
                {
                  title:
                    language === "en"
                      ? "Environmental assurance"
                      : "पर्यावरणीय आश्वासन",
                  text:
                    language === "en"
                      ? "Track moisture, dust, ventilation, and environmental checkpoints across all sites."
                      : "सभी स्थलों पर नमी, धूल, वेंटिलेशन और पर्यावरणीय चेकपॉइंट ट्रैक करें।",
                  image:
                    "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=900&q=80",
                  accent: "from-violet-500/20 to-purple-500/10",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="group relative overflow-hidden rounded-2xl border border-[#354548] bg-[#101416]/95 shadow-[0_14px_32px_rgba(0,0,0,0.2)] transition-all duration-500 hover:-translate-y-3 hover:border-[#e5a416]/70 hover:bg-[#151b1c] hover:shadow-2xl hover:shadow-[#e5a416]/15"
                >
                  <div className="relative h-52 overflow-hidden">
                    <div
                      className="h-full w-full bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-125"
                      style={{ backgroundImage: `url(${card.image})` }}
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-t ${card.accent} to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90`}
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-[#e5a416] transition-transform duration-500 group-hover:scale-x-100" />
                  </div>

                  <div className="p-6">
                    <div className="mb-3 flex items-center gap-2 text-[#39c7b0]">
                      <CheckCircle2 className="h-4 w-4 transition-transform duration-300 group-hover:scale-125" />
                      <span className="text-sm font-semibold">
                        {localizedCopy.liveIntelligence}
                      </span>
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-white transition-colors group-hover:text-[#f3b323]">
                      {card.title}
                    </h3>
                    <p className="leading-relaxed text-[#c5c7c2]">
                      {card.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features / Audit readiness */}
        <section
          id="features"
          className="landing-audit relative scroll-mt-[76px] border-y border-amber-300/10 bg-gradient-to-br from-[#2a241c] via-[#20212a] to-[#151c2a]"
        >
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
              {/* Left card */}
              <div className="audit-feature-card relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-8 shadow-2xl">
                <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />

                <div className="relative">
                  <div className="mb-5 inline-flex rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 p-3 text-slate-950 shadow-lg shadow-emerald-500/30">
                    <Shield className="h-6 w-6" />
                  </div>

                  <h3 className="text-3xl font-black text-white">
                    {language === "en"
                      ? "Built for audit readiness"
                      : "अडिट तत्परता के लिए निर्मित"}
                  </h3>
                  <p className="mt-4 text-slate-300 leading-relaxed">
                    {language === "en"
                      ? "Maintain transparent records, reduce administrative friction, and assign actions quickly across teams."
                      : "पारदर्शी रिकॉर्ड बनाए रखें, प्रशासनिक जटिलता कम करें और टीमों में कार्रवाई तुरंत सौंपें।"}
                  </p>

                  <div className="mt-8 space-y-3">
                    {[
                      language === "en"
                        ? "Automated inspection workflow tracking"
                        : "ऑटोमेटेड निरीक्षण वर्कफ़्लो ट्रैकिंग",
                      language === "en"
                        ? "Instant issue escalation and closure"
                        : "तत्काल समस्या प्रगति और समाधान",
                      language === "en"
                        ? "Geo-tagged compliance reminders"
                        : "जियो-टैग्ड अनुपालन रिमाइंडर",
                      language === "en"
                        ? "Role-based access for field teams"
                        : "फ़ील्ड टीमों के लिए भूमिका आधारित एक्सेस",
                    ].map((item) => (
                      <div
                        key={item}
                        className="audit-feature-item group flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:border-emerald-400/30 hover:bg-emerald-500/5"
                      >
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400 transition-transform group-hover:scale-110" />
                        <span className="text-slate-200">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right snapshot */}
              <div className="audit-snapshot rounded-[32px] border border-white/10 bg-slate-900/70 p-7 shadow-2xl backdrop-blur-sm">
                <div className="mb-7 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
                      {language === "en"
                        ? "Operations summary"
                        : "संचालन सारांश"}
                    </p>
                    <h3 className="mt-2 text-2xl font-black text-white">
                      {language === "en"
                        ? "Mine performance snapshot"
                        : "खदान प्रदर्शन स्नैपशॉट"}
                    </h3>
                  </div>
                  <div className="rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-400/30 px-4 py-1.5 text-sm font-bold text-emerald-300">
                    {language === "en" ? "+18.2% month" : "+18.2% महीना"}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    {
                      label:
                        language === "en" ? "Active sites" : "सक्रिय साइट्स",
                      value: homeStats?.activeMines ?? 0,
                      icon: Building2,
                      color: "from-emerald-400 to-teal-500",
                    },
                    {
                      label:
                        language === "en" ? "Safety score" : "सुरक्षा स्कोर",
                      value: `${homeStats?.averageCompliance ?? 0}%`,
                      icon: ShieldCheck,
                      color: "from-cyan-400 to-blue-500",
                    },
                    {
                      label: language === "en" ? "Alerts" : "अलर्ट",
                      value: homeStats?.totalAlerts ?? 0,
                      icon: Gauge,
                      color: "from-amber-400 to-orange-500",
                    },
                    {
                      label: language === "en" ? "Reports" : "रिपोर्ट्स",
                      value: homeStats?.totalReports ?? 0,
                      icon: BarChart3,
                      color: "from-violet-400 to-purple-500",
                    },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div
                      key={label}
                      className="audit-metric group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-lg"
                    >
                      <div
                        className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-slate-950 shadow-md transition-transform group-hover:scale-110 group-hover:rotate-6`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-2xl font-black text-white">
                        {value}
                      </div>
                      <div className="mt-1 text-sm text-slate-400">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact / Login */}
        <section
          id="contact"
          className="landing-contact relative scroll-mt-[76px] border-y border-[#e5a416]/20 bg-gradient-to-br from-[#102b46] via-[#102338] to-[#17232a] px-4 pb-24 pt-8 sm:px-6 lg:px-8"
        >
          <div className="contact-shell relative overflow-hidden rounded-[40px] border border-[#3b5662] bg-gradient-to-br from-[#172b3a] via-[#101b2b] to-[#0d1622] p-7 shadow-2xl lg:p-10">
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

              {/* Contact card */}
              <div className="contact-card relative rounded-[28px] border border-[#526875] bg-[#0a1420]/95 p-6 shadow-2xl backdrop-blur-xl">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f3c24b] to-[#e5a416] text-[#17232a] shadow-lg shadow-[#e5a416]/30">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-lg">
                      Talk to our team
                    </div>
                    <div className="text-xs text-slate-400">
                      Plan safer, clearer mine operations
                    </div>
                  </div>
                </div>

                <form onSubmit={handleContactSubmit} className="space-y-3.5">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Name
                    </label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, name: e.target.value })
                      }
                      className="w-full rounded-xl border border-[#405564] bg-[#152536] px-4 py-3 text-white placeholder:text-[#8da0aa] transition-all focus:border-[#e5a416] focus:outline-none focus:ring-2 focus:ring-[#e5a416]/30"
                      placeholder="Your full name"
                      required
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Email
                      </label>
                      <input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            email: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-[#405564] bg-[#152536] px-4 py-3 text-white placeholder:text-[#8da0aa] transition-all focus:border-[#e5a416] focus:outline-none focus:ring-2 focus:ring-[#e5a416]/30"
                        placeholder="you@organization.gov.in"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Organization
                      </label>
                      <input
                        type="text"
                        value={contactForm.organization}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            organization: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-[#405564] bg-[#152536] px-4 py-3 text-white placeholder:text-[#8da0aa] transition-all focus:border-[#e5a416] focus:outline-none focus:ring-2 focus:ring-[#e5a416]/30"
                        placeholder="Mine or company"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      What can we help with?
                    </label>
                    <select
                      value={contactForm.subject}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          subject: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-[#405564] bg-[#152536] px-4 py-3 text-white transition-all focus:border-[#e5a416] focus:outline-none focus:ring-2 focus:ring-[#e5a416]/30"
                      required
                    >
                      <option value="">Choose an area</option>
                      <option value="Platform access">Platform access</option>
                      <option value="Mine onboarding">Mine onboarding</option>
                      <option value="Compliance support">
                        Compliance support
                      </option>
                      <option value="General inquiry">General inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Message
                    </label>
                    <textarea
                      value={contactForm.message}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          message: e.target.value,
                        })
                      }
                      className="min-h-24 w-full resize-y rounded-xl border border-[#405564] bg-[#152536] px-4 py-3 text-white placeholder:text-[#8da0aa] transition-all focus:border-[#e5a416] focus:outline-none focus:ring-2 focus:ring-[#e5a416]/30"
                      placeholder="Tell us what you need"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={contactSending}
                    className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#e5a416] via-[#f3c24b] to-[#24b6c7] px-4 py-3.5 font-bold text-[#10202b] shadow-lg shadow-[#e5a416]/25 transition-all hover:shadow-[#f3c24b]/40 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70 active:scale-[0.98]"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {contactSending ? "Sending..." : "Send message"}
                      {!contactSending && (
                        <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      )}
                    </span>
                  </button>
                </form>
                <p className="mt-4 text-center text-xs text-slate-500">
                  Our team typically replies within one business day.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#29414b] bg-[#0b171d] text-[#c5cfce]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
            <div>
              <div className="flex items-center gap-3">
                <BrandLogo imageClassName="h-16 w-44 rounded" />
              </div>
              <p className="mt-5 max-w-sm text-sm leading-6 text-[#9eafaf]">
                Practical tools for safer mines, clearer compliance, and better
                decisions across every site.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-[#83d2c5]">
                <span className="h-2 w-2 rounded-full bg-[#39c7b0]" />
                All systems operational
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#e5a416]">
                Explore
              </h3>
              <div className="mt-5 flex flex-col items-start gap-3 text-sm">
                <a
                  href="#overview"
                  className="transition-colors hover:text-white"
                >
                  Capabilities
                </a>
                <a
                  href="#solutions"
                  className="transition-colors hover:text-white"
                >
                  Solutions
                </a>
                <a
                  href="#features"
                  className="transition-colors hover:text-white"
                >
                  Audit readiness
                </a>
                <a
                  href="#contact"
                  className="transition-colors hover:text-white"
                >
                  Access platform
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#e5a416]">
                Platform
              </h3>
              <div className="mt-5 flex flex-col items-start gap-3 text-sm">
                <span>Risk and safety</span>
                <span>Compliance records</span>
                <span>Field inspections</span>
                <span>Site intelligence</span>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#e5a416]">
                Talk to the team
              </h3>
              <p className="mt-5 text-sm leading-6 text-[#9eafaf]">
                Need help setting up a mine site or reviewing access?
              </p>
              <a
                href="mailto:support@coalgovernance.in"
                className="mt-4 inline-block text-sm font-semibold text-white underline decoration-[#e5a416] decoration-2 underline-offset-4 transition-colors hover:text-[#f3b323]"
              >
                support@coalgovernance.in
              </a>
              <p className="mt-3 text-xs text-[#758b8e]">
                Mon-Fri, 09:00-18:00 IST
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-[#758b8e] sm:flex-row sm:items-center sm:justify-between">
            <p>
              © 2026 Coal Governance. Built for responsible mine operations.
            </p>
            <div className="flex gap-5">
              <span>Privacy</span>
              <span>Security</span>
              <span>Version 1.0</span>
            </div>
          </div>
        </div>
      </footer>

      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
        {!assistantOpen ? (
          <button
            type="button"
            onClick={() => setAssistantOpen(true)}
            className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#dfe6ee] bg-[#f7f4ef] shadow-[0_8px_22px_rgba(0,0,0,0.25)] transition-transform hover:scale-105"
            aria-label="Open AI assistant"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#fbe4bf] to-[#e7d7b8] text-xl text-[#1d2b36]">
              A
            </div>
          </button>
        ) : (
          <div
            className={`w-[300px] overflow-hidden rounded-2xl border border-[#6d5624] bg-[#101416] text-white shadow-[0_16px_35px_rgba(0,0,0,0.35)] transition-all duration-700 ease-out sm:w-[320px] ${assistantReady ? "translate-x-0 opacity-100" : "translate-x-[140%] opacity-0"}`}
          >
            {!assistantChatOpen ? (
              <div className="px-4 pb-4 pt-4">
                <h2 className="text-2xl font-semibold leading-tight text-white">
                  Can we help you?
                </h2>
                <p className="mt-2 text-sm text-[#c6c7c1]">
                  Ask about inspections, compliance, or mine safety.
                </p>

                <div className="mt-5 space-y-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (token) {
                        navigate("/app/chat");
                      } else {
                        navigate("/login?redirect=/app/chat");
                      }
                    }}
                    className="w-full rounded-lg border border-[#e5a416] bg-[#e5a416] px-4 py-2.5 text-sm font-bold text-[#151719] transition hover:bg-[#f5b82c]"
                  >
                    Chat now
                  </button>

                  <button
                    type="button"
                    onClick={() => setAssistantOpen(false)}
                    className="w-full rounded-lg border border-white/20 bg-transparent px-4 py-2.5 text-sm font-semibold text-[#dfe1dc] transition hover:border-[#e5a416] hover:bg-white/5"
                  >
                    No thanks
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex h-[390px] flex-col bg-[#101416]">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dfeaf7] text-xs font-bold text-[#17314a]">
                      AI
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Coal AI
                      </p>
                      <p className="text-[10px] text-slate-300">Online</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAssistantOpen(false)}
                    className="text-lg text-slate-300 hover:text-white"
                    aria-label="Close AI assistant"
                  >
                    ×
                  </button>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto bg-[#152227] px-3 py-3">
                  {assistantMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                          message.sender === "user"
                            ? "bg-[#cfeaf9] text-[#10263d]"
                            : "bg-white/10 text-white"
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 bg-[#101416] p-3">
                  <input
                    type="email"
                    value={assistantEmail}
                    onChange={(e) => setAssistantEmail(e.target.value)}
                    placeholder="Your email to receive a reply"
                    className="mb-2 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white outline-none placeholder:text-slate-500 focus:border-[#e5a416]"
                    required
                  />
                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                    <input
                      type="text"
                      value={assistantInput}
                      onChange={(e) => setAssistantInput(e.target.value)}
                      placeholder="Ask a question..."
                      className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-400 outline-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAssistantSend();
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAssistantSend}
                      disabled={assistantSending || !assistantEmail.trim()}
                      className="rounded-full bg-[#e5a416] px-3 py-1.5 text-sm font-semibold text-[#151719] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {assistantSending ? "..." : "Send"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-3 flex justify-end pr-1">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#f6f7f8] bg-gradient-to-br from-[#f7d9b7] to-[#d4b5a3] shadow-[0_8px_22px_rgba(0,0,0,0.25)]">
                <div className="h-10 w-10 rounded-full bg-[radial-gradient(circle_at_30%_30%,_#f9d5bc,_#d2a77d_62%,_#6d4738)]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-5 right-24 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-[#d7c7ab] bg-[#f7f4ef] text-[#17314a] shadow-[0_6px_18px_rgba(0,0,0,0.2)] transition-all duration-200 hover:-translate-y-1 hover:border-[#e5a416] hover:bg-[#fffaf0] focus:outline-none focus:ring-2 focus:ring-[#e5a416]/60 focus:ring-offset-2 focus:ring-offset-[#101416]"
          aria-label="Scroll to top"
          title="Scroll to top"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
