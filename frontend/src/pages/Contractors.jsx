import { useEffect, useState } from 'react'
import { getContractors } from '../services/api'
import { Users } from 'lucide-react'
import { useLanguageStore } from '../store/themeStore'
import { translations } from '../i18n/translations'

export default function Contractors() {
  const [contractors, setContractors] = useState([])
  const [loading, setLoading] = useState(true)
  const { language } = useLanguageStore()
  const t = translations[language]

  useEffect(() => {
    getContractors()
      .then((res) => setContractors(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t.contractorTitle}</h1>
        <p className="text-sm text-slate-500 mt-1">{t.contractorSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <p className="text-slate-400">{t.loading}</p>
        ) : contractors.length === 0 ? (
          <p className="text-slate-400">{t.noContractors}</p>
        ) : (
          contractors.map((c) => (
            <div key={c._id} className="card p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{c.name}</h3>
                  <p className="text-sm text-slate-500">{c.registrationNo}</p>
                  <p className="text-sm mt-2">{c.contactPerson} • {c.phone}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className={`badge ${c.status === 'active' ? 'badge-low' : 'badge-critical'}`}>
                      {c.status}
                    </span>
                    <span className="text-sm font-medium">{t.score}: {c.complianceScore}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}