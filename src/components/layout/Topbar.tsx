import { Bell, ChevronDown, Search } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authErrorMessage, useAuth } from '../../contexts/AuthContext'
import { useAppData } from '../../contexts/AppDataContext'
import { Brand } from './Brand'

export function Topbar() {
  const { profile } = useAppData()
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const logout = async () => {
    setLogoutError('')
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch (reason) {
      setLogoutError(authErrorMessage(reason))
    }
  }
  return (
    <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-line bg-canvas/95 px-4 backdrop-blur sm:px-7 lg:px-9">
      <div className="md:hidden"><Brand /></div>
      <form className="hidden h-10 w-full max-w-[340px] items-center gap-2.5 rounded-xl border border-line bg-white px-3 text-muted focus-within:border-accent md:flex" onSubmit={(event) => {
        event.preventDefault()
        if (query.trim()) navigate(`/tasks?q=${encodeURIComponent(query.trim())}`)
      }}>
        <Search size={16} />
        <input aria-label="Cari" className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted" onChange={(event) => setQuery(event.target.value)} placeholder="Cari tugas..." value={query} />
        <kbd className="rounded border border-line bg-canvas px-1.5 py-0.5 text-[10px]">⌘ K</kbd>
      </form>
      <div className="flex items-center gap-2">
        <div className="relative">
          <button aria-label="Notifikasi" aria-expanded={showNotifications} className="relative rounded-xl p-2.5 text-muted transition hover:bg-white hover:text-ink" onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false) }} type="button">
            <Bell size={18} />
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-accent" />
          </button>
          {showNotifications && <div className="absolute right-0 top-12 w-64 rounded-xl border border-line bg-white p-4 shadow-card"><p className="text-sm font-semibold text-ink">Semua sudah diperbarui</p><p className="mt-1 text-xs text-muted">Pengingat dan informasi baru akan muncul di sini.</p></div>}
        </div>
        <div className="relative">
          <button aria-expanded={showProfile} className="flex items-center gap-2 rounded-xl p-1.5 pl-2 hover:bg-white" onClick={() => { setShowProfile(!showProfile); setShowNotifications(false) }} type="button">
            <span className="flex size-8 items-center justify-center rounded-full bg-[#e7d8c8] text-[10px] font-semibold text-[#755a42]">{profile.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span>
            <ChevronDown className="hidden text-muted sm:block" size={14} />
          </button>
          {showProfile && <div className="absolute right-0 top-12 w-48 rounded-xl border border-line bg-white p-1.5 shadow-card"><p className="px-3 py-2 text-xs font-semibold text-ink">{profile.name}</p>{logoutError && <p role="alert" className="px-3 py-1 text-[10px] text-danger">{logoutError}</p>}<Link className="block rounded-lg px-3 py-2 text-sm text-muted hover:bg-canvas hover:text-ink" onClick={() => setShowProfile(false)} to="/settings">Pengaturan</Link><button className="block w-full rounded-lg px-3 py-2 text-left text-sm text-muted hover:bg-canvas hover:text-ink" onClick={() => void logout()} type="button">Keluar</button></div>}
        </div>
      </div>
    </header>
  )
}
