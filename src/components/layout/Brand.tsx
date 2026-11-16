import { Link } from 'react-router-dom'

export function Brand() {
  return (
    <Link aria-label="DAYFLOW dashboard" className="flex items-center gap-2.5" to="/dashboard">
      <span className="flex size-9 items-center justify-center rounded-xl bg-brand text-white">
        <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
          <path d="M5.5 18.5c5.8-.2 10.1-3.1 12.7-8.8M7.4 7.1c.2 4.1 2.2 6.4 5.8 7" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
          <path d="M17.9 5.3c-3.4.1-5.8 1.5-7.1 4.4 3.2.3 5.7-.8 7.1-4.4Z" fill="#8FD6A9" />
        </svg>
      </span>
      <span className="text-sm font-bold tracking-[0.16em] text-brand">DAYFLOW</span>
    </Link>
  )
}
