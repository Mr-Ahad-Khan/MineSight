import { Fragment, useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { getMineralResourceRecords, getMineralResourceSummary } from '../services/api'
import { useLanguageStore } from '../store/themeStore'
import { translations } from '../i18n/translations'
import TableScrollContainer from '../components/common/TableScrollContainer'

const CHART_COLORS = ['#0f766e', '#e05d2b', '#2563eb', '#ca8a04', '#be185d', '#4d7c0f', '#0891b2', '#7c3aed', '#64748b']
const CLUSTER_COLORS = ['#0f766e', '#e05d2b', '#2563eb', '#ca8a04', '#be185d']
const RECORDS_PER_PAGE = 25
const MAX_CLUSTER_POINTS = 750
const PREVIEW_FIELDS = ['NAME', 'CITY', 'STATE', 'COUNTY', 'NAICSDESCR', 'MINE_TYPE']

const buildIndustryChartData = (industryClasses) => {
  const topClasses = industryClasses.slice(0, 8)
  const otherCount = industryClasses
    .slice(8)
    .reduce((total, item) => total + item.count, 0)

  return otherCount > 0
    ? [...topClasses, { name: `Other (${industryClasses.length - 8} classes)`, count: otherCount }]
    : topClasses
}

export default function MineralResourcesDashboard() {
  const { language } = useLanguageStore()
  const t = translations[language] || translations.en
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [records, setRecords] = useState([])
  const [recordsLoading, setRecordsLoading] = useState(true)
  const [recordsError, setRecordsError] = useState('')
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState({ page: 1, totalRecords: 0, totalPages: 0 })
  const [expandedRecordId, setExpandedRecordId] = useState(null)

  useEffect(() => {
    getMineralResourceSummary()
      .then((response) => setSummary(response.data.data))
      .catch((requestError) => {
        setError(requestError.response?.data?.message || 'Unable to load mineral resource data.')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let isCurrentRequest = true
    setRecordsLoading(true)
    setRecordsError('')

    getMineralResourceRecords({ page, limit: RECORDS_PER_PAGE, search })
      .then((response) => {
        if (!isCurrentRequest) return
        setRecords(response.data.data.records || [])
        setPagination(response.data.data.pagination)
        setExpandedRecordId(null)
      })
      .catch((requestError) => {
        if (isCurrentRequest) {
          setRecordsError(requestError.response?.data?.message || 'Unable to load dataset records.')
        }
      })
      .finally(() => {
        if (isCurrentRequest) setRecordsLoading(false)
      })

    return () => {
      isCurrentRequest = false
    }
  }, [page, search])

  const spatialClusters = summary?.spatialClusters || []
  const chartClusters = useMemo(() => spatialClusters.map((cluster) => ({
    ...cluster,
    sites: cluster.sites.length <= MAX_CLUSTER_POINTS
      ? cluster.sites
      : cluster.sites.filter((_, index) => index % Math.ceil(cluster.sites.length / MAX_CLUSTER_POINTS) === 0),
  })), [spatialClusters])

  const totalPages = Math.max(
    1,
    Number(pagination.totalPages) || Math.ceil(pagination.totalRecords / RECORDS_PER_PAGE),
  )
  const goToPage = (nextPage) => {
    setPage(Math.min(Math.max(nextPage, 1), totalPages))
    setExpandedRecordId(null)
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center" role="status" aria-label="Loading mineral resource data">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10" role="alert">
        <h1 className="text-xl font-semibold">{t.mineralResources}</h1>
        <p className="mt-2 text-sm text-rose-600">{error}</p>
      </div>
    )
  }

  const industryChartData = buildIndustryChartData(summary?.industryClasses || [])
  const stateData = summary?.states || []
  const industryClasses = summary?.industryClasses || []

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6">
      <header className="flex flex-col items-center text-center sm:items-start sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{t.mineralResources}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.mineralResourcesSubtitle}</p>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="Dataset summary">
        <div className="border-l-4 border-teal-700 bg-white px-4 py-3 shadow-sm dark:bg-slate-900">
          <p className="text-sm text-slate-500">{t.datasetRecords}</p>
          <p className="mt-1 text-2xl font-semibold">{summary?.totalRecords?.toLocaleString()}</p>
        </div>
        <div className="border-l-4 border-orange-600 bg-white px-4 py-3 shadow-sm dark:bg-slate-900">
          <p className="text-sm text-slate-500">{t.statesTerritories}</p>
          <p className="mt-1 text-2xl font-semibold">{stateData.length}</p>
        </div>
        <div className="border-l-4 border-blue-700 bg-white px-4 py-3 shadow-sm dark:bg-slate-900">
          <p className="text-sm text-slate-500">{t.industryClassifications}</p>
          <p className="mt-1 text-2xl font-semibold">{industryClasses.length}</p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="min-w-0 border-t-2 border-teal-700 bg-white p-4 shadow-sm dark:bg-slate-900 sm:p-5">
          <div className="mb-4">
            <h2 className="font-semibold">{t.recordsByState}</h2>
            <p className="mt-1 text-sm text-slate-500">{t.allStateCodes}</p>
          </div>
          {stateData.length === 0 ? (
            <p className="text-sm text-slate-400">{t.noStateRecords}</p>
          ) : (
            <div className="max-h-[520px] overflow-y-auto pr-2" aria-label="Scrollable chart of records by state">
              <ResponsiveContainer width="100%" height={Math.max(stateData.length * 25, 280)}>
                <BarChart data={stateData} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="state" width={42} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => [value, 'Records']} />
                  <Bar dataKey="count" fill="#0f766e" radius={[0, 3, 3, 0]} name="Records" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="min-w-0 border-t-2 border-orange-600 bg-white p-4 shadow-sm dark:bg-slate-900 sm:p-5">
          <div className="mb-2">
            <h2 className="font-semibold">{t.mineralWiseDistribution}</h2>
            <p className="mt-1 text-sm text-slate-500">{t.industryDescription}</p>
          </div>
          {industryChartData.length === 0 ? (
            <p className="text-sm text-slate-400">{t.noIndustryClassifications}</p>
          ) : (
            <ResponsiveContainer width="100%" height={390}>
              <PieChart>
                <Pie
                  data={industryChartData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="46%"
                  innerRadius={66}
                  outerRadius={118}
                  paddingAngle={2}
                >
                  {industryChartData.map((item, index) => (
                    <Cell key={item.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Records']} />
                <Legend
                  verticalAlign="bottom"
                  formatter={(value) => (value.length > 38 ? `${value.slice(0, 35)}...` : value)}
                  wrapperStyle={{ fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </section>
      </div>

      <section className="border-t-2 border-blue-700 bg-white p-4 shadow-sm dark:bg-slate-900 sm:p-5">
        <div className="mb-4 space-y-1">
          <h2 className="font-semibold">Machine learning: geographic site clusters</h2>
          <p className="text-sm text-slate-500">
            K-means groups facilities by longitude and latitude into five geographic clusters. This shows location patterns, not mine safety or risk.
          </p>
        </div>
        {spatialClusters.length === 0 ? (
          <p className="text-sm text-slate-400">{t.noCoordinateClusters}</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={350}>
              <ScatterChart margin={{ top: 12, right: 20, bottom: 30, left: 28 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#64748b" opacity={0.65} />
                <XAxis
                  type="number"
                  dataKey="longitude"
                  name="Longitude"
                  domain={['dataMin', 'dataMax']}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={{ stroke: '#64748b' }}
                  tickLine={{ stroke: '#64748b' }}
                  label={{ value: 'Longitude', position: 'insideBottom', offset: -16, fill: '#94a3b8', fontSize: 12 }}
                />
                <YAxis
                  type="number"
                  dataKey="latitude"
                  name="Latitude"
                  domain={['dataMin', 'dataMax']}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  width={48}
                  axisLine={{ stroke: '#64748b' }}
                  tickLine={{ stroke: '#64748b' }}
                  label={{ value: 'Latitude', angle: -90, position: 'insideLeft', offset: 8, fill: '#94a3b8', fontSize: 12 }}
                />
                <ZAxis range={[24, 24]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(value, name) => [Number(value).toFixed(2), name]}
                  labelFormatter={(_, payload) => {
                    const site = payload?.[0]?.payload
                    return site ? `${site.state} · ${site.industry}` : 'Facility location'
                  }}
                />
                {chartClusters.map((cluster, index) => (
                  <Scatter
                    key={cluster.id}
                    name={`Cluster ${cluster.id}`}
                    data={cluster.sites}
                    fill={CLUSTER_COLORS[index % CLUSTER_COLORS.length]}
                    fillOpacity={0.56}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
            <div className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-2 border-b border-slate-200 pb-4 text-sm dark:border-slate-700">
              {spatialClusters.map((cluster, index) => (
                <span key={cluster.id} className="inline-flex items-center gap-2 whitespace-nowrap text-slate-700 dark:text-slate-200">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: CLUSTER_COLORS[index % CLUSTER_COLORS.length] }} />
                  Cluster {cluster.id} ({cluster.siteCount.toLocaleString()})
                </span>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-3 border-t border-slate-200 pt-4 dark:border-slate-700 sm:grid-cols-2 xl:grid-cols-5">
              {spatialClusters.map((cluster, index) => (
                <div key={cluster.id} className="border-l-4 p-3" style={{ borderColor: CLUSTER_COLORS[index % CLUSTER_COLORS.length] }}>
                  <p className="font-semibold">Cluster {cluster.id} · {cluster.siteCount.toLocaleString()} sites</p>
                  <p className="mt-1 text-xs text-slate-500">Center: {cluster.center.latitude.toFixed(2)}, {cluster.center.longitude.toFixed(2)}</p>
                  <p className="mt-1 text-xs text-slate-500">Most common state: {cluster.dominantState}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <details className="border-t border-slate-300 py-3 dark:border-slate-700">
        <summary className="cursor-pointer text-sm font-medium">{t.csvColumns} ({summary?.columns?.length || 0})</summary>
        <p className="mt-3 break-words text-xs leading-6 text-slate-500">{(summary?.columns || []).join(', ')}</p>
      </details>

      <section className="border-t-2 border-teal-700 bg-white p-4 shadow-sm dark:bg-slate-900 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-semibold">{t.datasetRecordsTitle}</h2>
            <p className="mt-1 text-sm text-slate-500">{t.datasetRecordsDescription}</p>
          </div>
          <form
            className="flex w-full gap-2 sm:max-w-md"
            onSubmit={(event) => {
              event.preventDefault()
              setPage(1)
              setSearch(searchInput.trim())
            }}
          >
            <label className="sr-only" htmlFor="mineral-resource-search">{t.searchDatasetRecords}</label>
            <input
              id="mineral-resource-search"
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder={t.searchAnyField}
              className="input-field min-w-0 flex-1"
            />
            <button type="submit" className="btn-primary inline-flex shrink-0 items-center gap-2">
              <Search className="h-4 w-4" />
              {t.search}
            </button>
          </form>
        </div>

        {recordsError && <p role="alert" className="mt-4 text-sm text-rose-600">{recordsError}</p>}

        <TableScrollContainer className="mt-4">
          <table className="mobile-readable-table text-sm">
            <thead className="border-y border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-700">
              <tr>
                {PREVIEW_FIELDS.map((field) => <th key={field} className="px-3 py-3 font-semibold">{field}</th>)}
                <th className="px-3 py-3 font-semibold">{t.details}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recordsLoading ? (
                <tr><td colSpan={PREVIEW_FIELDS.length + 1} className="px-3 py-8 text-center text-slate-500">{t.loadingRecords}</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={PREVIEW_FIELDS.length + 1} className="px-3 py-8 text-center text-slate-500">{t.noMatchingRecords}</td></tr>
              ) : records.map((record) => {
                const recordId = String(record.FID || record.index)
                const isExpanded = expandedRecordId === recordId

                return (
                  <Fragment key={recordId}>
                    <tr key={recordId}>
                      {PREVIEW_FIELDS.map((field) => (
                        <td key={field} className="max-w-64 break-words px-3 py-3" title={record[field] || ''}>
                          {record[field] || '—'}
                        </td>
                      ))}
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          className="font-medium text-teal-800 underline underline-offset-2 dark:text-teal-300"
                          aria-expanded={isExpanded}
                          onClick={() => setExpandedRecordId(isExpanded ? null : recordId)}
                        >
                          {isExpanded ? t.hideFields : t.viewAllFields}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${recordId}-details`}>
                        <td colSpan={PREVIEW_FIELDS.length + 1} className="bg-slate-50 px-3 py-4 dark:bg-slate-800/60">
                          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                            {(summary?.columns || []).map((field) => (
                              <div key={field} className="min-w-0">
                                <dt className="text-xs font-semibold text-slate-500">{field}</dt>
                                <dd className="break-words text-sm text-slate-900 dark:text-slate-100">{record[field] || '—'}</dd>
                              </div>
                            ))}
                          </dl>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </TableScrollContainer>

        <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            {pagination.totalRecords === 0
              ? t.noRecords
              : `${t.showingRecords} ${(page - 1) * RECORDS_PER_PAGE + 1}-${Math.min(page * RECORDS_PER_PAGE, pagination.totalRecords)} ${t.of} ${pagination.totalRecords.toLocaleString()} ${t.records}`}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1 || recordsLoading}
              className="inline-flex h-9 items-center gap-1 border border-slate-300 px-3 text-sm disabled:opacity-40 dark:border-slate-600"
            >
              <ChevronLeft className="h-4 w-4" /> {t.previous}
            </button>
            <span className="min-w-20 text-center text-sm text-slate-500">{t.page} {page} {t.of} {totalPages}</span>
            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages || recordsLoading}
              className="inline-flex h-9 items-center gap-1 border border-slate-300 px-3 text-sm disabled:opacity-40 dark:border-slate-600"
            >
              {t.next} <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}