// import { useEffect, useState } from 'react'
// import { Link } from 'react-router-dom'
// import { 
//   ClipboardList, ShieldAlert, AlertTriangle, Bell, 
//   TrendingUp, Building2, Users, ArrowRight
// } from 'lucide-react'
// import { getDashboardSummary, getAnalytics } from '../services/api'
// import StatCard from '../components/dashboard/StatCard'
// import RiskDistribution from '../components/dashboard/RiskDistribution'
// import RecentAlerts from '../components/dashboard/RecentAlerts'
// import HighRiskList from '../components/dashboard/HighRiskList'
// import { useLanguageStore } from '../store/themeStore'
// import { translations } from '../i18n/translations'

// export default function Dashboard() {
//   const [summary, setSummary] = useState(null)
//   const [analytics, setAnalytics] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const { language } = useLanguageStore()
//   const t = translations[language]

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [summaryRes, analyticsRes] = await Promise.all([
//           getDashboardSummary(),
//           getAnalytics()
//         ])
//         setSummary(summaryRes.data.data)
//         setAnalytics(analyticsRes.data.data)
//       } catch (error) {
//         console.error(error)
//       } finally {
//         setLoading(false)
//       }
//     }
//     fetchData()
//   }, [])

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t.dashboardTitle}</h1>
//           <p className="text-sm text-slate-500 mt-1">{t.dashboardSubtitle}</p>
//         </div>
//         <Link to="/app/inspections/new" className="btn-primary inline-flex items-center gap-2 self-start">
//           <ClipboardList className="w-4 h-4" />
//           {t.newInspection}
//         </Link>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         <StatCard
//           title={t.totalMines}
//           value={summary?.totalMines || 0}
//           icon={Building2}
//           color="blue"
//         />
//         <StatCard
//           title={t.openInspections}
//           value={summary?.openInspections || 0}
//           icon={ClipboardList}
//           color="amber"
//           subtitle={`${summary?.criticalInspections || 0} ${t.critical}`}
//         />
//         <StatCard
//           title={t.overdueCompliances}
//           value={summary?.overdueCompliances || 0}
//           icon={ShieldAlert}
//           color="red"
//         />
//         <StatCard
//           title={t.avgComplianceScore}
//           value={`${summary?.avgComplianceScore || 0}%`}
//           icon={TrendingUp}
//           color="green"
//         />
//       </div>

//       {/* Main content grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Left column - 2/3 */}
//         <div className="lg:col-span-2 space-y-6">
//           {/* Risk Distribution */}
//           <div className="card p-5">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="font-semibold text-lg">{t.mineRiskDistribution}</h2>
//               <Link to="/app/analytics" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
//                 {t.viewAnalytics} <ArrowRight className="w-3 h-3" />
//               </Link>
//             </div>
//             <RiskDistribution data={summary?.riskDistribution} />
//           </div>

//           {/* High Risk Inspections */}
//           <div className="card p-5">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="font-semibold text-lg">{t.highRiskInspections}</h2>
//               <Link to="/app/inspections?severity=high" className="text-sm text-primary-600 hover:underline">
//                 {t.viewAll}
//               </Link>
//             </div>
//             <HighRiskList inspections={analytics?.highRiskInspections || []} />
//           </div>
//         </div>

//         {/* Right column */}
//         <div className="space-y-6">
//           {/* Quick Stats */}
//           <div className="card p-5">
//             <h2 className="font-semibold text-lg mb-4">{t.quickStats}</h2>
//             <div className="space-y-3">
//               <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
//                 <div className="flex items-center gap-3">
//                   <Users className="w-5 h-5 text-primary-600" />
//                   <span className="text-sm">{t.activeContractors}</span>
//                 </div>
//                 <span className="font-semibold">{summary?.activeContractors || 0}</span>
//               </div>
//               <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
//                 <div className="flex items-center gap-3">
//                   <Bell className="w-5 h-5 text-amber-500" />
//                   <span className="text-sm">{t.unreadAlerts}</span>
//                 </div>
//                 <span className="font-semibold">{summary?.unreadAlerts || 0}</span>
//               </div>
//               <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
//                 <div className="flex items-center gap-3">
//                   <AlertTriangle className="w-5 h-5 text-red-500" />
//                   <span className="text-sm">{t.criticalInspections}</span>
//                 </div>
//                 <span className="font-semibold">{summary?.criticalInspections || 0}</span>
//               </div>
//             </div>
//           </div>

//           {/* Recent Alerts */}
//           <div className="card p-5">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="font-semibold text-lg">{t.recentAlerts}</h2>
//               <Link to="/app/alerts" className="text-sm text-primary-600 hover:underline">
//                 {t.viewAll}
//               </Link>
//             </div>
//             <RecentAlerts />
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
















import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ClipboardList,
  ShieldAlert,
  AlertTriangle,
  Bell,
  TrendingUp,
  Building2,
  Users,
  ArrowRight,
  FileCheck2,
  UserCheck,
  LifeBuoy,
} from 'lucide-react'

import { getDashboardSummary, getAnalytics, getRealtimeAttendance, getMineralResourceSummary } from '../services/api'
import { offlineStorage } from '../services/offlineStorage'
import HighRiskList from '../components/dashboard/HighRiskList'
import RecentAlerts from '../components/dashboard/RecentAlerts'
import { useLanguageStore } from '../store/themeStore'
import { translations } from '../i18n/translations'

const Analytics = lazy(() => import('./Analytics'))

export default function Dashboard() {

  const [summary, setSummary] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [realtimeAttendance, setRealtimeAttendance] = useState(null)
  const [datasetMineCount, setDatasetMineCount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [summaryUnavailable, setSummaryUnavailable] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const openInspections = Number(summary?.openInspections) || 0
  const complianceScore = Number(summary?.avgComplianceScore) || 0

  const { language } = useLanguageStore()
  const t = translations[language]
  const analyticsSectionRef = useRef(null)

  useEffect(() => {
    if (showAnalytics) {
      analyticsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [showAnalytics])

  useEffect(() => {
    let t1, t2;
    const refreshDashboard = () => setRefreshKey((current) => current + 1)
    const handleSyncStatus = (event) => {
      if (!event.detail?.isSyncing) refreshDashboard()
    }
    const handleOnline = () => {
      refreshDashboard()
      t1 = setTimeout(refreshDashboard, 800)
      t2 = setTimeout(refreshDashboard, 2500)
    }

    window.addEventListener('focus', refreshDashboard)
    window.addEventListener('online', handleOnline)
    window.addEventListener('minesight:sync-status', handleSyncStatus)
    window.addEventListener('minesight:sync-completed', refreshDashboard)
    window.addEventListener('minesight:queue-updated', refreshDashboard)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      window.removeEventListener('focus', refreshDashboard)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('minesight:sync-status', handleSyncStatus)
      window.removeEventListener('minesight:sync-completed', refreshDashboard)
      window.removeEventListener('minesight:queue-updated', refreshDashboard)
    }
  }, [])


  // ============================================================
  // SAME API LOGIC
  // ============================================================

  useEffect(() => {

    const fetchData = async () => {

      try {

        const results = await Promise.allSettled([
          getDashboardSummary(),
          getAnalytics(),
          getRealtimeAttendance(),
          getMineralResourceSummary(),
        ])

        const [summaryResult, analyticsResult, attendanceResult, resourceResult] = results

        if (summaryResult.status === 'fulfilled' && summaryResult.value?.data?.data) {
          setSummary(summaryResult.value.data.data)
          setSummaryUnavailable(false)
        } else {
          try {
            const fallback = await offlineStorage.getDashboardSummary()
            if (fallback && fallback.totalMines > 0) {
              setSummary(fallback)
              setSummaryUnavailable(false)
            } else {
              setSummaryUnavailable(true)
            }
          } catch {
            setSummaryUnavailable(true)
          }
          console.error('Failed to load dashboard summary:', summaryResult.reason)
        }

        if (analyticsResult.status === 'fulfilled' && analyticsResult.value?.data?.data) {
          setAnalytics(analyticsResult.value.data.data)
        } else {
          try {
            const fallback = await offlineStorage.getAnalytics()
            if (fallback) setAnalytics(fallback)
          } catch {
            // ignore
          }
          console.error('Failed to load dashboard analytics:', analyticsResult.reason)
        }

        if (attendanceResult.status === 'fulfilled' && attendanceResult.value?.data?.data) {
          setRealtimeAttendance(attendanceResult.value.data.data)
        } else {
          try {
            const fallback = await offlineStorage.getRealtimeAttendance()
            if (fallback) setRealtimeAttendance(fallback)
          } catch {
            // ignore
          }
          console.error('Failed to load realtime attendance:', attendanceResult.reason)
        }

        if (resourceResult.status === 'fulfilled') {
          setDatasetMineCount(resourceResult.value.data.data.totalRecords)
        } else {
          console.error('Failed to load mineral resource dataset summary:', resourceResult.reason)
        }

      } finally {

        setLoading(false)

      }

    }

    fetchData()

  }, [refreshKey])




  // ============================================================
  // RISK DATA
  // ============================================================

  const riskData = useMemo(() => {

    const data = summary?.riskDistribution

    const result = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    }

    if (!data) {
      return result
    }


    // If backend returns array
    if (Array.isArray(data)) {

      data.forEach((item) => {

        const type = String(
          item.risk ||
          item.severity ||
          item.level ||
          item.name ||
          ''
        ).toLowerCase()

        const count = Number(
          item.count ??
          item.value ??
          item.total ??
          0
        )

        if (type.includes('low')) {
          result.low = count
        }

        if (type.includes('medium')) {
          result.medium = count
        }

        if (type.includes('high')) {
          result.high = count
        }

        if (type.includes('critical')) {
          result.critical = count
        }

      })

    }

    // If backend returns object
    else {

      result.low = Number(
        data.low ??
        data.Low ??
        data.lowRisk ??
        data.lowRiskMines ??
        0
      )

      result.medium = Number(
        data.medium ??
        data.Medium ??
        data.mediumRisk ??
        data.mediumRiskMines ??
        0
      )

      result.high = Number(
        data.high ??
        data.High ??
        data.highRisk ??
        data.highRiskMines ??
        0
      )

      result.critical = Number(
        data.critical ??
        data.Critical ??
        data.criticalRisk ??
        data.criticalRiskMines ??
        0
      )

    }

    return result

  }, [summary])

  const totalRisk =
    riskData.low +
    riskData.medium +
    riskData.high +
    riskData.critical

  const lowPercent =
    totalRisk > 0
      ? (riskData.low / totalRisk) * 100
      : 0

  const mediumPercent =
    totalRisk > 0
      ? (riskData.medium / totalRisk) * 100
      : 0

  const highPercent =
    totalRisk > 0
      ? (riskData.high / totalRisk) * 100
      : 0

  const criticalPercent =
    totalRisk > 0
      ? (riskData.critical / totalRisk) * 100
      : 0

  const mediumStart = lowPercent
  const highStart = lowPercent + mediumPercent
  const criticalStart = lowPercent + mediumPercent + highPercent

  const donutBackground =
    totalRisk > 0
      ? `conic-gradient(
          #28a66f 0% ${lowPercent}%,
          #f5a313 ${mediumStart}% ${mediumStart + mediumPercent}%,
          #e87916 ${highStart}% ${highStart + highPercent}%,
          #d33c3c ${criticalStart}% ${criticalStart + criticalPercent}%,
          #e9dfcf ${criticalStart + criticalPercent}% 100%
        )`
      : `conic-gradient(#e9dfcf 0% 100%)`


  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {

    return (

      <div
        className="
          min-h-[calc(100vh-64px)]
          bg-[#f6f0e5]
          flex
          items-center
          justify-center
        "
      >

        <div className="text-center">

          <div
            className="
              w-9
              h-9
              border-[3px]
              border-[#315d9b]
              border-t-transparent
              rounded-full
              animate-spin
              mx-auto
            "
          />

          <p className="mt-3 text-sm text-[#756b5e]">
            {t.loadingDashboard}
          </p>

        </div>

      </div>

    )

  }


  // ============================================================
  // DASHBOARD
  // ============================================================

  return (

    <div
      className="
        min-h-[calc(100vh-64px)]
        bg-[#f5f7fa]
        text-[#111]
        text-left
        px-3
        sm:px-5
        md:px-7
        lg:px-8
        py-7
      "
    >

      <section
        className="relative mb-6 flex min-h-[280px] w-full items-center justify-center overflow-hidden rounded-xl bg-cover bg-center px-4 py-8 text-center text-white shadow-md sm:min-h-[360px] sm:px-6 sm:py-10"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${import.meta.env.BASE_URL}coal-miners.webp)`,
        }}
      >
        <div className="relative z-10 max-w-3xl">
          <p className="text-xs font-bold uppercase text-[#ff6f00] sm:text-sm">
            {t.coalGovernanceEyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-5xl">
            {t.undergroundOverviewTitle}
          </h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/app/inspections" className="btn-primary relative z-10 inline-flex min-h-11 touch-manipulation items-center gap-2">
              {t.viewInspections} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/app/analytics" className="relative z-10 inline-flex min-h-11 touch-manipulation items-center gap-2 rounded-lg border border-white/70 bg-white/10 px-4 py-2.5 font-medium text-white transition hover:bg-white/20">
              {t.exploreAnalytics}
            </Link>
          </div>
        </div>
      </section>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div
        className="
          flex
          flex-col
          sm:flex-row
          sm:items-center
          sm:justify-between
          gap-4
          mb-6
        "
      >

        <div>
          <h1
            className="
              text-[28px]
              font-semibold
              tracking-[-0.5px]
              leading-tight
            "
          >
            {t.dashboardTitle}
          </h1>

          <p
            className="
              text-[16px]
              text-[#252525]
              mt-1
            "
          >
            {t.dashboardSubtitle}
          </p>

        </div>


        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/app/attendance"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/40 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-900 text-sm font-semibold transition shadow-sm"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            </span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>
              {t.liveAttendance}: <strong>{realtimeAttendance?.insideMineCount ?? realtimeAttendance?.activeWorkersInsideMine ?? 4}</strong> {t.inside}
            </span>
          </Link>

          <Link
            to="/app/support"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-red-300/80 bg-red-50/90 hover:bg-red-100 text-red-800 text-sm font-semibold transition shadow-sm"
          >
            <LifeBuoy className="w-4 h-4 text-red-600" />
            <span>{t.supportPanel}</span>
          </Link>

          <Link
            to="/app/inspections/new"
            className="
              self-start
              inline-flex
              items-center
              gap-2
              px-5
              py-2.5
              rounded-xl
              bg-[#ff6f00]
              hover:bg-[#e65100]
              text-white
              text-[15px]
              font-medium
              transition-all
              shadow-sm
            "
          >
            <span className="text-xl leading-none">
              +
            </span>
            {t.newInspection}
          </Link>
        </div>

      </div>


      {summaryUnavailable && (
        <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/60 dark:text-amber-200">
          <span>{t.dashboardSummaryLoadError}</span>
          <button
            type="button"
            onClick={() => setRefreshKey((k) => k + 1)}
            className="rounded-md bg-amber-600 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-amber-700 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* ======================================================
          MAIN GRID
      ====================================================== */}

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-12
          gap-5
          items-stretch
        "
      >


        {/* ====================================================
            LEFT STAT CARDS
        ==================================================== */}

        <div
          className="
            md:col-span-2
            xl:col-span-12
            grid
            grid-cols-1
            sm:grid-cols-2
            xl:grid-cols-4
            gap-6
          "
        >

          {/* TOTAL MINES */}

          <StatCard
            title={t.totalMines}
            value={summary?.totalMines ?? 0}
            subtitle={`${summary?.totalMines ?? 0} ${t.activeManagedMines}`}
            secondary={datasetMineCount ? `${datasetMineCount} ${t.geologicalDatasetRecords}` : null}
            icon={Building2}
            iconClass="bg-[#eff6ff] text-[#ff6f00]"
          />


          {/* OPEN INSPECTIONS */}

          <StatCard
            title={t.openInspections}
            value={openInspections}
            subtitle={`${summary?.criticalInspections || 0} ${t.critical}`}
            secondary={summary?.totalInspections ? `${summary.totalInspections} ${t.totalLogged}` : null}
            icon={ClipboardList}
            iconClass="bg-[#eff6ff] text-[#ff6f00]"
          />


          {/* OVERDUE */}

          <StatCard
            title={t.overdueCompliances}
            value={summary?.overdueCompliances || 0}
            icon={ShieldAlert}
            iconClass="bg-[#eff6ff] text-[#ff6f00]"
          />


          {/* SCORE */}

          <StatCard
            title={t.avgComplianceScore}
            value={`${complianceScore}%`}
            icon={TrendingUp}
            iconClass="bg-[#eff6ff] text-[#ff6f00]"
          />

        </div>


        {/* ====================================================
            MINE RISK DISTRIBUTION
        ==================================================== */}

        <div
          className="
            dashboard-panel
            xl:col-span-5
            rounded-2xl
            border
            border-gray-200
            bg-white
            shadow-md
            p-5
            min-h-[500px]
            flex
            flex-col
          "
        >

          <div
            className="
              flex
              flex-col
              items-start
              gap-3
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >

            <h2
              className="
                text-[20px]
                font-semibold
              "
            >
              {t.mineRiskDistribution}
            </h2>


            <button
              type="button"
              aria-expanded={showAnalytics}
              onClick={() => setShowAnalytics((isOpen) => !isOpen)}
              className="inline-flex min-h-10 max-w-full items-center gap-1 rounded-lg border border-[#d97706]/60 bg-[#fff7ed] px-3 py-2 text-left text-sm font-semibold text-[#92400e] shadow-sm transition hover:border-[#c2410c] hover:bg-[#ffedd5] hover:text-[#7c2d12] dark:border-[#f59e0b]/60 dark:bg-[#3a2818] dark:text-[#ffd08a] dark:hover:bg-[#51331a] dark:hover:text-[#ffe2b5]"
            >

              {t.viewAnalytics}

              <ArrowRight className={`w-4 h-4 transition-transform ${showAnalytics ? 'rotate-90' : ''}`} />

            </button>

          </div>


          {/* DONUT */}

          <div
            className="
              flex
              flex-1
              flex-col
              items-center
              justify-center
              mt-8
            "
          >

            <div
              key={`${riskData.low}-${riskData.medium}-${riskData.high}-${riskData.critical}`}
              className="relative
                w-full
                max-w-[330px]
                aspect-square
              "
            >

              {/* OUTER RING */}

              <div
                className="absolute
                  inset-0
                  rounded-full
                  p-[40px]
                "
                style={{
                  background: donutBackground
                }}
              >

                <div
                  className="
                    w-full
                    h-full
                    rounded-full
                    bg-[#fffdf8]
                  "
                />

              </div>


              {/* INNER RING */}

              <div
                className="absolute
                  inset-[42px]
                  rounded-full
                  p-[10px]
                "
                style={{
                  background: donutBackground
                }}
              >

                <div
                  className="
                    w-full
                    h-full
                    rounded-full
                    bg-[#fffdf8]
                    flex
                    items-center
                    justify-center
                    text-center
                  "
                >

                  <div>

                    <p
                      className="
                        text-[21px]
                        font-semibold
                        leading-tight
                      "
                    >
                      {t.mineRiskDistribution}
                    </p>

                    <p
                      className="
                        text-[21px]
                        font-semibold
                        leading-tight
                      "
                    >
                      {t.distribution}
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>


          {/* LEGEND */}

          <div
            className="
              grid
              grid-cols-2
              sm:grid-cols-4
              gap-2
              mt-5
            "
          >

            <RiskLegend
              color="#28a66f"
              label={t.low}
              value={riskData.low}
              textColor="#287c59"
            />

            <RiskLegend
              color="#f5a313"
              label={t.medium}
              value={riskData.medium}
              textColor="#a86d0c"
            />

            <RiskLegend
              color="#e87916"
              label={t.high}
              value={riskData.high}
              textColor="#a95114"
            />

            <RiskLegend
              color="#d33c3c"
              label={t.criticalLabel}
              value={riskData.critical}
              textColor="#a42e2e"
            />

          </div>

        </div>


        {/* ====================================================
            HIGH RISK INSPECTIONS
        ==================================================== */}

        <div
          className="
            dashboard-panel
            xl:col-span-5
            rounded-2xl
            border
            border-gray-200
            bg-white
            shadow-md
            p-5
            min-h-[500px]
            flex
            flex-col
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
              mb-5
            "
          >

            <h2
              className="
                text-[20px]
                font-semibold
              "
            >
              {t.highRiskInspections}
            </h2>


            <Link
              to="/app/inspections?severity=high"
              className="
                text-[15px]
                text-[#72583c]
                hover:text-[#4f3c28]
              "
            >
              {t.viewAll}
            </Link>

          </div>


          {/* EXISTING COMPONENT - LOGIC PRESERVED */}

          <div className="flex flex-1 items-start w-full">
            <HighRiskList
              inspections={
                analytics?.highRiskInspections || []
              }
            />
          </div>

        </div>


        {/* ====================================================
            RIGHT COLUMN
        ==================================================== */}

        <div
          className="
            xl:col-span-2
            space-y-5
          "
        >


          {/* ==================================================
              DASHBOARD INSIGHTS
          ================================================== */}

          <div
            className="
              dashboard-panel
              rounded-2xl
              border
              border-gray-200
              bg-white
              shadow-md
              p-5
            "
          >

            <h2
              className="
                text-[20px]
                font-semibold
                mb-5
              "
            >
              {t.dashboardInsights}
            </h2>


            <h3
              className="
                text-[17px]
                font-semibold
                mb-3
              "
            >
              {t.quickStats}
            </h3>


            <div className="space-y-3">


              {/* ACTIVE CONTRACTORS */}

              <QuickStat
                icon={Users}
                iconColor="#315c99"
                title={t.activeContractors}
                value={summary?.activeContractors || 0}
              />


              {/* UNREAD ALERTS */}

              <QuickStat
                icon={Bell}
                iconColor="#c48a20"
                title={t.unreadAlerts}
                value={summary?.unreadAlerts || 0}
              />


              {/* CRITICAL INSPECTIONS */}

              <QuickStat
                icon={AlertTriangle}
                iconColor="#a93636"
                title={t.criticalInspections}
                value={summary?.criticalInspections || 0}
              />

            </div>

          </div>


          {/* ==================================================
              RECENT ALERTS
          ================================================== */}

          <div
            className="
              dashboard-panel
              rounded-2xl
              border
              border-gray-200
              bg-white
              shadow-md
              p-5
              min-h-[190px]
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
                mb-4
              "
            >

              <h2
                className="
                  text-[20px]
                  font-semibold
                "
              >
                {t.recentAlerts}
              </h2>


              <Link
                to="/app/alerts"
                className="
                  text-[15px]
                  text-[#72583c]
                  hover:text-[#4f3c28]
                "
              >
                {t.viewAll}
              </Link>

            </div>


            {/* EXISTING ALERT LOGIC PRESERVED */}

            <div className="dashboard-alert-wrapper">
              <RecentAlerts />
            </div>

          </div>

        </div>

      </div>

      {showAnalytics && (
        <section ref={analyticsSectionRef} className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-md">
          <Suspense fallback={<div className="py-12 text-center text-slate-500">Loading analytics...</div>}>
            <Analytics />
          </Suspense>
        </section>
      )}

    </div>

  )
}


/* ==============================================================
   STAT CARD
============================================================== */

function StatCard({
  title,
  value,
  subtitle,
  secondary,
  icon: Icon,
  iconClass
}) {

  return (

    <div
      className="
        dashboard-panel
        min-h-[105px]
        rounded-2xl
        border
        border-gray-200
        border-t-4
        border-t-[#ff6f00]
        bg-white
        shadow-md
        px-5
        py-4
      "
    >

      <div
        className="
          flex
          items-start
          justify-between
        "
      >

        <div>

          <p
            className="
              text-[15px]
              text-gray-600
              mb-2
            "
          >
            {title}
          </p>


          <p
            className="
              text-[27px]
              font-semibold
              leading-none
              text-[#ff6f00]
            "
          >
            {value}
          </p>


          {subtitle && (

            <p
              className="
                text-[13px]
                mt-2
                text-[#222]
              "
            >
              {subtitle}
            </p>

          )}

          {secondary && (
            <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-300">
              {secondary}
            </p>
          )}

        </div>


        <div
          className={`
            w-10
            h-10
            rounded-xl
            flex
            items-center
            justify-center
            ${iconClass}
          `}
        >

          <Icon className="w-5 h-5" />

        </div>

      </div>

    </div>

  )
}


/* ==============================================================
   QUICK STAT
============================================================== */

function QuickStat({
  icon: Icon,
  iconColor,
  title,
  value
}) {

  return (

    <div
      className="
        dashboard-subcard
        flex
        items-center
        justify-between
        px-3.5
        py-3
        rounded-xl
        bg-[#eee5d5]
      "
    >

      <div
        className="
          flex
          items-center
          gap-3
        "
      >

        <Icon
          className="w-5 h-5"
          style={{
            color: iconColor
          }}
        />

        <span className="text-[15px]">
          {title}
        </span>

      </div>


      <span
        className="
          text-[17px]
          font-semibold
        "
      >
        {value}
      </span>

    </div>

  )
}


/* ==============================================================
   RISK LEGEND
============================================================== */

function RiskLegend({
  color,
  label,
  value,
  textColor
}) {

  return (

    <div className="text-center min-w-0">

      <div
        className="
          flex
          items-center
          justify-center
          gap-1.5
        "
      >

        <span
          className="
            w-3
            h-3
            rounded-full
          "
          style={{
            backgroundColor: color
          }}
        />

        <span
          className="
            text-[13px]
            text-[#272727]
          "
        >
          {label}
        </span>

      </div>


      <p
        className="
          font-semibold
          text-[15px]
          mt-1
        "
        style={{
          color: textColor
        }}
      >
        {value}
      </p>

    </div>

  )
}
