import { ArrowLeft } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Brand } from '../components/layout/Brand'
import { Button, Field } from '../components/ui'
import { inputClass } from '../components/ui/styles'
import { authErrorMessage, useAuth } from '../contexts/AuthContext'

export function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const destination = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/dashboard'

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await signIn(email.trim(), password)
      navigate(destination, { replace: true })
    } catch (reason) {
      setError(authErrorMessage(reason))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthFrame title="Selamat datang kembali" subtitle="Masuk untuk melanjutkan aktivitas Anda.">
      <form className="space-y-4" onSubmit={submit}>
        <Field label="Alamat email"><input autoComplete="email" className={inputClass} onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></Field>
        <Field label="Kata sandi"><input autoComplete="current-password" className={inputClass} minLength={6} onChange={(event) => setPassword(event.target.value)} placeholder="Minimal 6 karakter" required type="password" value={password} /></Field>
        {error && <p role="alert" className="text-xs text-danger">{error}</p>}
        <div className="flex justify-end"><Link className="text-xs font-medium text-brand hover:text-accent" to="/forgot-password">Lupa kata sandi?</Link></div>
        <Button className="mt-2 w-full" disabled={submitting} type="submit">{submitting ? 'Sedang masuk…' : 'Masuk ke DAYFLOW'}</Button>
        <p className="text-center text-xs text-muted">Pengguna baru DAYFLOW? <Link className="font-semibold text-brand hover:text-accent" to="/register">Buat akun</Link></p>
      </form>
    </AuthFrame>
  )
}

export function RegisterPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setSubmitting(true)
    try {
      const hasSession = await signUp(name.trim(), email.trim(), password)
      if (hasSession) navigate('/dashboard', { replace: true })
      else setMessage('Periksa email Anda untuk mengonfirmasi akun, lalu masuk.')
    } catch (reason) {
      setError(authErrorMessage(reason))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthFrame title="Buat akun" subtitle="Mulai hari yang lebih teratur.">
      <form className="space-y-4" onSubmit={submit}>
        <Field label="Nama lengkap"><input autoComplete="name" className={inputClass} maxLength={80} onChange={(event) => setName(event.target.value)} required value={name} /></Field>
        <Field label="Alamat email"><input autoComplete="email" className={inputClass} onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></Field>
        <Field label="Kata sandi"><input autoComplete="new-password" className={inputClass} minLength={6} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} /></Field>
        {error && <p role="alert" className="text-xs text-danger">{error}</p>}
        {message && <p role="status" className="text-xs text-brand">{message}</p>}
        <Button className="mt-2 w-full" disabled={submitting} type="submit">{submitting ? 'Membuat akun…' : 'Daftar'}</Button>
        <p className="text-center text-xs text-muted">Sudah punya akun? <Link className="font-semibold text-brand hover:text-accent" to="/login">Masuk</Link></p>
      </form>
    </AuthFrame>
  )
}

export function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await sendPasswordReset(email.trim())
      setSent(true)
    } catch (reason) {
      setError(authErrorMessage(reason))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthFrame title="Atur ulang kata sandi" subtitle="Kami akan mengirim tautan untuk mengatur ulang kata sandi Anda.">
      <form className="space-y-4" onSubmit={submit}>
        <Field label="Alamat email"><input autoComplete="email" className={inputClass} onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></Field>
        {error && <p role="alert" className="text-xs text-danger">{error}</p>}
        {sent && <p role="status" className="text-xs text-brand">Jika akun dengan alamat ini terdaftar, tautan pengaturan ulang akan segera dikirim.</p>}
        <Button className="w-full" disabled={submitting} type="submit">{submitting ? 'Mengirim…' : 'Kirim tautan'}</Button>
        <p className="text-center text-xs text-muted">Ingat kata sandi Anda? <Link className="font-semibold text-brand hover:text-accent" to="/login">Masuk</Link></p>
      </form>
    </AuthFrame>
  )
}

export function ResetPasswordPage() {
  const { updatePassword, user } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    if (password !== confirmation) {
      setError('Kata sandi tidak cocok.')
      return
    }
    setSubmitting(true)
    try {
      await updatePassword(password)
      navigate('/dashboard', { replace: true })
    } catch (reason) {
      setError(authErrorMessage(reason))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthFrame title="Buat kata sandi baru" subtitle="Atur kata sandi baru untuk akun DAYFLOW Anda.">
      {user
        ? <form className="space-y-4" onSubmit={submit}>
          <Field label="Kata sandi baru"><input autoComplete="new-password" className={inputClass} minLength={6} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} /></Field>
          <Field label="Ulangi kata sandi baru"><input autoComplete="new-password" className={inputClass} minLength={6} onChange={(event) => setConfirmation(event.target.value)} required type="password" value={confirmation} /></Field>
          {error && <p role="alert" className="text-xs text-danger">{error}</p>}
          <Button className="w-full" disabled={submitting} type="submit">{submitting ? 'Memperbarui…' : 'Perbarui kata sandi'}</Button>
        </form>
        : <div className="space-y-4">
          <p className="text-xs text-muted">Buka tautan pengaturan ulang kata sandi yang dikirim ke email Anda.</p>
          <Link className="block text-center text-xs font-semibold text-brand hover:text-accent" to="/forgot-password">Minta tautan baru</Link>
        </div>}
    </AuthFrame>
  )
}

function AuthFrame({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <div className="w-full max-w-[410px]">
        <div className="mb-8 flex justify-center"><Brand /></div>
        <section className="rounded-2xl border border-line bg-white p-6 shadow-card sm:p-8">
          <h1 className="text-xl font-semibold tracking-tight text-ink">{title}</h1>
          <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </section>
        <Link className="mx-auto mt-5 flex w-fit items-center gap-1.5 text-xs text-muted hover:text-ink" to="/login"><ArrowLeft size={13} />Kembali ke halaman masuk</Link>
      </div>
    </main>
  )
}
