import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function RequireAuth() {
  const { user, loading, authError } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-canvas text-sm text-muted">Memeriksa sesi Anda…</div>
  }

  if (authError) {
    return <div role="alert" className="flex min-h-screen items-center justify-center bg-canvas p-6 text-center text-sm text-danger">Sesi Supabase tidak dapat dipulihkan: {authError}</div>
  }

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}

export function PublicOnly() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-canvas text-sm text-muted">Memeriksa sesi Anda…</div>
  }

  return user ? <Navigate to="/dashboard" replace /> : <Outlet />
}
