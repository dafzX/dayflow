import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { MobileNavigation } from './MobileNavigation'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useAppData } from '../../contexts/AppDataContext'

export function AppLayout() {
  const location = useLocation()
  const { profileError } = useAuth()
  const { dataLoading, dataError, refreshData } = useAppData()
  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar />
      <div className="min-h-screen md:pl-[248px]">
        <Topbar />
        <main className="mx-auto max-w-[1440px] px-4 pb-24 pt-6 sm:px-7 sm:pt-8 md:px-9 md:pb-10">
          {profileError && <div role="alert" className="mb-5 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">Profil Anda tidak dapat dimuat: {profileError}</div>}
          {dataLoading
            ? <div className="rounded-2xl border border-line bg-white p-8 text-center text-sm text-muted">Memuat data DAYFLOW Anda…</div>
            : dataError
              ? <div role="alert" className="rounded-2xl border border-danger/20 bg-white p-8 text-center"><p className="text-sm font-medium text-danger">Data Anda tidak dapat dimuat</p><p className="mt-2 text-xs text-muted">{dataError}</p><button className="mt-4 rounded-lg bg-brand px-4 py-2 text-xs font-medium text-white hover:bg-accent" onClick={() => void refreshData()} type="button">Coba lagi</button></div>
              : <Outlet key={location.pathname} />}
        </main>
      </div>
      <MobileNavigation />
    </div>
  )
}
