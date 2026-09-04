import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'
import useThemeStore from './store/themeStore'

function PublicHomeRoute() {
  const { token } = useAuthStore()
  return token ? <Navigate to="/app" replace /> : <HomePage />
}

// Keep each screen out of the initial bundle. This is especially important for
// the map and analytics screens, which bring in large third-party libraries.
const Layout = lazy(() => import('./components/layout/Layout'))
const HomePage = lazy(() => import('./pages/HomePage'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Inspections = lazy(() => import('./pages/Inspections'))
const CreateInspection = lazy(() => import('./pages/CreateInspection'))
const InspectionDetail = lazy(() => import('./pages/InspectionDetail'))
const Compliances = lazy(() => import('./pages/Compliances'))
const Mines = lazy(() => import('./pages/Mines'))
const Contractors = lazy(() => import('./pages/Contractors'))
const Alerts = lazy(() => import('./pages/Alerts'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Chat = lazy(() => import('./pages/Chat'))
const Profile = lazy(() => import('./pages/Profile'))

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
    <Suspense fallback={<main className="min-h-screen bg-slate-50 dark:bg-slate-950" aria-label="Loading page" />}>
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
    </Suspense>
  )
}

export default App
