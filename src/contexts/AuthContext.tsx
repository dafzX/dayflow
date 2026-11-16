/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Database } from '../types/database'

type UserProfile = Database['public']['Tables']['profiles']['Row']

interface AuthContextValue {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  authError: string | null
  profileError: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<boolean>
  signOut: () => Promise<void>
  sendPasswordReset: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  updateProfile: (fullName: string, currency: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const user = session?.user ?? null
  const userId = user?.id ?? null
  const [profileState, setProfileState] = useState<{
    userId: string
    profile: UserProfile | null
    error: string | null
  } | null>(null)
  const profile = userId && profileState?.userId === userId ? profileState.profile : null
  const profileError = userId && profileState?.userId === userId ? profileState.error : null

  useEffect(() => {
    let active = true
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return
      setAuthError(null)
      setSession(nextSession)
      setLoading(false)
    })

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return
      if (error) setAuthError(error.message)
      setSession(data.session)
      setLoading(false)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    let active = true
    if (!userId) return () => { active = false }
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return
        if (error) {
          setProfileState({ userId, profile: null, error: error.message })
          return
        }
        if (!data) {
          setProfileState({
            userId,
            profile: null,
            error: 'Profil tidak ditemukan. Pastikan skema Supabase DAYFLOW sudah diterapkan.',
          })
          return
        }
        setProfileState({ userId, profile: data, error: null })
      })

    return () => { active = false }
  }, [userId])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [])

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    if (error) throw error
    return Boolean(data.session)
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }, [])

  const sendPasswordReset = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  }, [])

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
  }, [])

  const updateProfile = useCallback(async (fullName: string, currency: string) => {
    if (!userId) throw new Error('Anda harus masuk untuk mengubah profil.')
    const { data, error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, currency, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select('*')
      .single()
    if (error) throw error
    setProfileState({ userId, profile: data, error: null })
  }, [userId])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    session,
    profile,
    loading,
    authError,
    profileError,
    signIn,
    signUp,
    signOut,
    sendPasswordReset,
    updatePassword,
    updateProfile,
  }), [user, session, profile, loading, authError, profileError, signIn, signUp, signOut, sendPasswordReset, updatePassword, updateProfile])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider.')
  return context
}

export function authErrorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    const message = error.message
    const normalized = message.toLowerCase()
    if (normalized.includes('invalid login credentials')) return 'Email atau kata sandi salah.'
    if (normalized.includes('email not confirmed')) return 'Email Anda belum dikonfirmasi. Periksa kotak masuk email.'
    if (normalized.includes('user already registered')) return 'Email ini sudah terdaftar. Silakan masuk.'
    if (normalized.includes('password should be at least')) return 'Kata sandi belum memenuhi panjang minimum.'
    if (normalized.includes('too many requests')) return 'Terlalu banyak percobaan. Coba lagi beberapa saat.'
    if (normalized.includes('network') || normalized.includes('fetch')) return 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'
    return 'Terjadi masalah saat memproses autentikasi. Silakan coba lagi.'
  }
  return 'Autentikasi gagal. Silakan coba lagi.'
}
