import { LogOut } from 'lucide-react'
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { authErrorMessage, useAuth } from '../../contexts/AuthContext'
import { useAppData } from '../../contexts/AppDataContext'
import { Brand } from './Brand'
import { navigation } from './navigation'

export function Sidebar() {
  const { profile } = useAppData()
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const logout = async () => {
    setError('')
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch (reason) {
      setError(authErrorMessage(reason))
    }
  }
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-line bg-white px-4 py-6 md:flex">
      <div className="px-2"><Brand /></div>
      <p className="mb-2 mt-10 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">Ruang kerja</p>
      <nav aria-label="Navigasi utama" className="space-y-1">
        {navigation.map(({ label, to, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `group flex min-h-10 items-center gap-3 rounded-xl px-3 text-[13px] font-medium transition-colors ${isActive ? 'bg-soft text-brand' : 'text-muted hover:bg-canvas hover:text-ink'}`}>
            <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto border-t border-line pt-4">
        {error && <p role="alert" className="mb-2 px-2 text-[10px] text-danger">{error}</p>}
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-[#e7d8c8] text-xs font-semibold text-[#755a42]">{profile.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-ink">{profile.name}</p>
            <p className="truncate text-[10px] text-muted">{profile.email}</p>
          </div>
          <button aria-label="Keluar" className="rounded-lg p-2 text-muted hover:bg-canvas hover:text-ink" onClick={() => void logout()} title="Keluar" type="button"><LogOut size={15} /></button>
        </div>
      </div>
    </aside>
  )
}
