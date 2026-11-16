import { Check, LogOut, Save, UserRound } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Field, PageHeader } from '../components/ui'
import { inputClass } from '../components/ui/styles'
import { authErrorMessage, useAuth } from '../contexts/AuthContext'
import { useAppData } from '../contexts/AppDataContext'

export function SettingsPage() {
  const { profile, updateProfile } = useAppData()
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState(profile.name)
  const [currency, setCurrency] = useState(profile.currency)
  const [theme, setTheme] = useState(profile.theme)
  const [saved, setSaved] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  useEffect(() => {
    if (!saved) return
    const timer = window.setTimeout(() => setSaved(false), 2500)
    return () => window.clearTimeout(timer)
  }, [saved])
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      await updateProfile({ name: name.trim(), email: user?.email ?? profile.email, currency, theme })
      setSaved(true)
    } catch (reason) {
      setError(authErrorMessage(reason))
    } finally {
      setSaving(false)
    }
  }
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
    <div>
      <PageHeader title="Pengaturan" description="Sesuaikan DAYFLOW dengan kebutuhan Anda." />
      <form className="max-w-3xl space-y-5" onSubmit={submit}>
        <Card className="p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3 border-b border-line pb-4"><span className="flex size-9 items-center justify-center rounded-xl bg-soft text-brand"><UserRound size={17} /></span><div><h2 className="text-sm font-semibold text-ink">Informasi profil</h2><p className="mt-0.5 text-xs text-muted">Data pribadi dan identitas akun Anda</p></div></div>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Nama lengkap"><input className={inputClass} maxLength={80} onChange={(event) => setName(event.target.value)} required value={name} /></Field><Field label="Alamat email"><input className={`${inputClass} cursor-not-allowed bg-canvas text-muted`} readOnly type="email" value={user?.email ?? profile.email} /></Field></div>
          <p className="mt-3 text-xs text-muted">Perubahan email dikelola melalui verifikasi akun Supabase.</p>
        </Card>
        <Card className="p-5 sm:p-6">
          <div className="mb-5 border-b border-line pb-4"><h2 className="text-sm font-semibold text-ink">Preferensi</h2><p className="mt-0.5 text-xs text-muted">Atur cara DAYFLOW menampilkan informasi</p></div>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Mata uang"><select className={inputClass} onChange={(event) => setCurrency(event.target.value)} value={currency}><option value="IDR">Rupiah Indonesia (IDR)</option><option value="USD">Dolar AS (USD)</option><option value="SGD">Dolar Singapura (SGD)</option></select></Field><Field label="Tema"><select className={inputClass} onChange={(event) => setTheme(event.target.value as 'Light' | 'System')} value={theme}><option value="Light">Terang</option><option value="System">Sesuai sistem</option></select></Field></div>
        </Card>
        {error && <p role="alert" className="text-xs text-danger">{error}</p>}
        <div className="flex flex-col-reverse items-start justify-between gap-3 sm:flex-row sm:items-center"><button className="inline-flex items-center gap-2 rounded-xl px-2 py-2 text-xs font-medium text-danger hover:bg-[#fbefed]" onClick={() => void logout()} type="button"><LogOut size={15} />Keluar dari akun ini</button><Button disabled={saving} type="submit">{saving ? 'Menyimpan…' : saved ? <Check size={15} /> : <Save size={15} />}{saving ? '' : saved ? 'Perubahan tersimpan' : 'Simpan preferensi'}</Button></div>
        {logoutError && <p role="alert" className="text-xs text-danger">{logoutError}</p>}
      </form>
    </div>
  )
}
