import { MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { navigation } from './navigation'

const primary = navigation.slice(0, 4)
const secondary = navigation.slice(4)

export function MobileNavigation() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  return (
    <nav aria-label="Navigasi seluler" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {primary.map(({ label, to, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `flex min-w-[58px] flex-col items-center gap-1 rounded-lg px-2 py-1 text-[9px] font-medium ${isActive ? 'text-brand' : 'text-muted'}`}><Icon size={18} strokeWidth={1.8} /><span>{label === 'Ringkasan' ? 'Beranda' : label}</span></NavLink>
        ))}
        <div className="relative">
          <button aria-expanded={open} className={`flex min-w-[58px] flex-col items-center gap-1 rounded-lg px-2 py-1 text-[9px] font-medium ${open || secondary.some((item) => item.to === location.pathname) ? 'text-brand' : 'text-muted'}`} onClick={() => setOpen(!open)} type="button"><MoreHorizontal size={18} /><span>Lainnya</span></button>
          {open && <div className="absolute bottom-14 right-0 w-48 rounded-xl border border-line bg-white p-1.5 shadow-card">{secondary.map(({ label, to, icon: Icon }) => <NavLink key={to} onClick={() => setOpen(false)} to={to} className={({ isActive }) => `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs ${isActive ? 'bg-soft text-brand' : 'text-muted hover:bg-canvas'}`}><Icon size={15} />{label}</NavLink>)}</div>}
        </div>
      </div>
    </nav>
  )
}
