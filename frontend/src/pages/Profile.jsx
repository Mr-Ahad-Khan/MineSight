import { useState } from 'react'
import { ArrowLeft, Save, UserCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'

export default function Profile() {
  const { user, updateProfile, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
  })

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const payload = { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() }
    if (form.password) payload.password = form.password

    const result = await updateProfile(payload)
    if (result.success) {
      toast.success('Profile updated successfully')
      setForm((current) => ({ ...current, password: '' }))
    } else {
      toast.error(result.message)
    }
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <button type="button" onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#0d3f6b] dark:text-sky-300">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="card overflow-hidden">
        <div className="border-b border-slate-200 bg-[#0c3f6d] px-6 py-7 text-white dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
              <UserCircle className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Profile settings</h1>
              <p className="mt-1 text-sm text-slate-200">Manage your account details and sign-in password.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="label" htmlFor="name">Full name</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="label" htmlFor="email">Email address</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="label" htmlFor="phone">Phone</label>
              <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="label" htmlFor="role">Account type</label>
              <input id="role" value={user?.role?.replace('_', ' ') || ''} className="input-field capitalize" disabled />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-5 dark:border-slate-700">
            <label className="label" htmlFor="password">New password</label>
            <input id="password" name="password" type="password" value={form.password} onChange={handleChange} className="input-field" minLength={6} placeholder="Leave blank to keep your current password" />
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={isLoading} className="btn-primary inline-flex items-center gap-2">
              <Save className="h-4 w-4" /> {isLoading ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}