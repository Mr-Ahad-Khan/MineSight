import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from '../common/Footer'
import CoalAiLauncher from '../common/CoalAiLauncher'

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f3eadb] text-slate-800 dark:bg-[#0f1720] dark:text-slate-100">
      <Navbar />

      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
      <Footer />
      <CoalAiLauncher />
    </div>
  )
}
