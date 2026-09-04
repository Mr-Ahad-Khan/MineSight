import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'
import useThemeStore from './store/themeStore'

function PublicHomeRoute() {
  const { token } = useAuthStore()
  return token ? <Navigate to="/app" replace /> : <HomePage />
}

import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Inspections from './pages/Inspections'
import CreateInspection from './pages/CreateInspection'
import InspectionDetail from './pages/InspectionDetail'
import Compliances from './pages/Compliances'
import Mines from './pages/Mines'
import Contractors from './pages/Contractors'
import Alerts from './pages/Alerts'
import Analytics from './pages/Analytics'
import Chat from './pages/Chat'
import Profile from './pages/Profile'

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
      <Route path="/" element={<PublicHomeRoute />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/app" element={
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
        <Route path="chat" element={<Chat />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App