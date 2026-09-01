import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'
import useThemeStore from './store/themeStore'

import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Inspections from './pages/Inspections'
import CreateInspection from './pages/CreateInspection'
import InspectionDetail from './pages/InspectionDetail'
import Compliances from './pages/Compliances'
import Mines from './pages/Mines'
import Contractors from './pages/Contractors'
import Alerts from './pages/Alerts'
import Analytics from './pages/Analytics'

function PrivateRoute({ children }) {
  const { token } = useAuthStore()
  return token ? children : <Navigate to="/login" replace />
}

function App() {
  const { initTheme } = useThemeStore()

  useEffect(() => {
    initTheme()
  }, [])

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="inspections" element={<Inspections />} />
        <Route path="inspections/new" element={<CreateInspection />} />
        <Route path="inspections/:id" element={<InspectionDetail />} />
        <Route path="compliances" element={<Compliances />} />
        <Route path="mines" element={<Mines />} />
        <Route path="contractors" element={<Contractors />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App