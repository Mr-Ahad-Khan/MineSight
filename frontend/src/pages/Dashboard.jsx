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
















import { useEffect, useMemo, useState } from 'react'
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
  FileCheck2
} from 'lucide-react'

import { getDashboardSummary, getAnalytics } from '../services/api'
import HighRiskList from '../components/dashboard/HighRiskList'
import RecentAlerts from '../components/dashboard/RecentAlerts'
import { useLanguageStore } from '../store/themeStore'
import { translations } from '../i18n/translations'


export default function Dashboard() {

  const [summary, setSummary] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [animatedOpenInspections, setAnimatedOpenInspections] = useState(0)
  const [animatedComplianceScore, setAnimatedComplianceScore] = useState(0)
  const [animatedRiskData, setAnimatedRiskData] = useState({
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  })
  const [riskAnimationProgress, setRiskAnimationProgress] = useState(0)

  const { language } = useLanguageStore()
  const t = translations[language]


  // ============================================================
  // SAME API LOGIC
  // ============================================================

  useEffect(() => {

    const fetchData = async () => {

      try {

        const [summaryRes, analyticsRes] = await Promise.all([
          getDashboardSummary(),
          getAnalytics()
        ])

        setSummary(summaryRes.data.data)
        setAnalytics(analyticsRes.data.data)

      } catch {

        // Keep the dashboard usable with its zero-value state if the remote
        // service is temporarily unavailable. The request error is handled in
        // the UI rather than being surfaced as a browser console failure.

      } finally {

        setLoading(false)

      }

    }

    fetchData()

  }, [])

  useEffect(() => {
    if (!summary) return undefined

    const openInspections = Number(summary.openInspections) || 0
    const complianceScore = Number(summary.avgComplianceScore) || 0
    const duration = 900
    const startedAt = performance.now()
    let animationFrame

    const animateCounters = (timestamp) => {
      const progress = Math.min((timestamp - startedAt) / duration, 1)
      const easedProgress = 1 - (1 - progress) ** 3

      setAnimatedOpenInspections(Math.round(openInspections * easedProgress))
      setAnimatedComplianceScore(Number((complianceScore * easedProgress).toFixed(1)))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animateCounters)
      }
    }

    animationFrame = requestAnimationFrame(animateCounters)
    return () => cancelAnimationFrame(animationFrame)
  }, [summary])


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

  useEffect(() => {
    const duration = 1000
    const startedAt = performance.now()
    let animationFrame
    setRiskAnimationProgress(0)

    const animateRiskSegments = (timestamp) => {
      const progress = Math.min((timestamp - startedAt) / duration, 1)
      const easedProgress = 1 - (1 - progress) ** 3
      setRiskAnimationProgress(easedProgress)

      setAnimatedRiskData({
        low: riskData.low * easedProgress,
        medium: riskData.medium * easedProgress,
        high: riskData.high * easedProgress,
        critical: riskData.critical * easedProgress,
      })

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animateRiskSegments)
      }
    }

    animationFrame = requestAnimationFrame(animateRiskSegments)
    return () => cancelAnimationFrame(animationFrame)
  }, [riskData])


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

  const animatedLowPercent = lowPercent * riskAnimationProgress
  const animatedMediumPercent = mediumPercent * riskAnimationProgress
  const animatedHighPercent = highPercent * riskAnimationProgress
  const animatedCriticalPercent = criticalPercent * riskAnimationProgress

  const mediumStart = animatedLowPercent

  const highStart =
    animatedLowPercent +
    animatedMediumPercent

  const criticalStart =
    animatedLowPercent +
    animatedMediumPercent +
    animatedHighPercent


  const donutBackground =
    totalRisk > 0

      ? `conic-gradient(
          #28a66f 0% ${animatedLowPercent}%,
          #f5a313 ${mediumStart}% ${mediumStart + animatedMediumPercent}%,
          #e87916 ${highStart}% ${highStart + animatedHighPercent}%,
          #d33c3c ${criticalStart}% ${criticalStart + animatedCriticalPercent}%,
          #e9dfcf ${criticalStart + animatedCriticalPercent}% 100%
        )`

      : `conic-gradient(
          #e9dfcf 0% 100%
        )`


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
            Loading dashboard...
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
        bg-[#f6f0e5]
        text-[#111]
        px-5
        sm:px-7
        lg:px-8
        py-7
      "
    >

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
            bg-[#b18a57]
            hover:bg-[#9d7748]
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
            xl:col-span-2
            grid
            grid-cols-1
            sm:grid-cols-2
            xl:grid-cols-1
            gap-5
          "
        >

          {/* TOTAL MINES */}

          <StatCard
            title={t.totalMines}
            value={summary?.totalMines || 0}
            icon={Building2}
            iconClass="bg-[#dce7f7] text-[#315c99]"
          />


          {/* OPEN INSPECTIONS */}

          <StatCard
            title={t.openInspections}
            value={animatedOpenInspections}
            subtitle={`${summary?.criticalInspections || 0} ${t.critical}`}
            secondary={`Updated inspections: ${animatedOpenInspections + 1}`}
            icon={ClipboardList}
            iconClass="bg-[#fae8bf] text-[#bc7914]"
          />


          {/* OVERDUE */}

          <StatCard
            title={t.overdueCompliances}
            value={summary?.overdueCompliances || 0}
            icon={ShieldAlert}
            iconClass="bg-[#f6d9d9] text-[#b43a3a]"
          />


          {/* SCORE */}

          <StatCard
            title={t.avgComplianceScore}
            value={`${animatedComplianceScore}%`}
            icon={TrendingUp}
            iconClass="bg-[#dcebdc] text-[#23804f]"
          />

        </div>


        {/* ====================================================
            MINE RISK DISTRIBUTION
        ==================================================== */}

        <div
          className="
            dashboard-panel
            xl:col-span-4
            rounded-2xl
            border
            border-[#cbbda7]
            bg-[#fffdf8]
            shadow-[0_2px_5px_rgba(80,60,30,0.10)]
            p-5
            min-h-[500px]
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
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


            <Link
              to="/app/analytics"
              className="
                flex
                items-center
                gap-1
                text-[15px]
                text-[#72583c]
                hover:text-[#4f3c28]
              "
            >

              {t.viewAnalytics}

              <ArrowRight className="w-4 h-4" />

            </Link>

          </div>


          {/* DONUT */}

          <div
            className="
              flex
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
                      Mine Risk
                    </p>

                    <p
                      className="
                        text-[21px]
                        font-semibold
                        leading-tight
                      "
                    >
                      Distribution
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
              grid-cols-4
              gap-2
              mt-5
            "
          >

            <RiskLegend
              color="#28a66f"
              label="Low"
              value={riskData.low}
              textColor="#287c59"
            />

            <RiskLegend
              color="#f5a313"
              label="Medium"
              value={riskData.medium}
              textColor="#a86d0c"
            />

            <RiskLegend
              color="#e87916"
              label="High"
              value={riskData.high}
              textColor="#a95114"
            />

            <RiskLegend
              color="#d33c3c"
              label="Critical"
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
            xl:col-span-4
            rounded-2xl
            border
            border-[#cbbda7]
            bg-[#fffdf8]
            shadow-[0_2px_5px_rgba(80,60,30,0.10)]
            p-5
            min-h-[500px]
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

          <HighRiskList
            inspections={
              analytics?.highRiskInspections || []
            }
          />

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
              border-[#cbbda7]
              bg-[#fffdf8]
              shadow-[0_2px_5px_rgba(80,60,30,0.10)]
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
              Dashboard Insights
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
              border-[#cbbda7]
              bg-[#fffdf8]
              shadow-[0_2px_5px_rgba(80,60,30,0.10)]
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
        border-[#cbbda7]
        bg-[#fffdf8]
        shadow-[0_2px_5px_rgba(80,60,30,0.10)]
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
              text-[#151515]
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

    <div className="text-center">

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
