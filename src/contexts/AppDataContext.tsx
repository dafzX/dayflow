/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext'
import { loadUserData } from '../services/appData'
import type { AppData, Profile } from '../types'

interface AppDataContextValue extends AppData {
  dataLoading: boolean
  dataError: string | null
  refreshData: () => Promise<void>
  updateProfile: (profile: Profile) => Promise<void>
}

const AppDataContext = createContext<AppDataContextValue | null>(null)

function errorText(error: unknown) {
  return error instanceof Error ? error.message : 'Data DAYFLOW tidak dapat dimuat.'
}

function getSavedTheme(userId: string) {
  try {
    return localStorage.getItem(`dayflow-theme:${userId}`) === 'System' ? 'System' : 'Light'
  } catch (error) {
    console.error('Unable to read DAYFLOW theme preference.', error)
    return 'Light'
  }
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const { user, profile: accountProfile, updateProfile: updateAccountProfile } = useAuth()
  const userId = user?.id ?? null
  const [dataByUser, setDataByUser] = useState<Record<string, AppData>>({})
  const [loadingByUser, setLoadingByUser] = useState<Record<string, boolean>>({})
  const [errorByUser, setErrorByUser] = useState<Record<string, string | null>>({})
  const theme = userId ? dataByUser[userId]?.profile.theme ?? getSavedTheme(userId) : 'Light'

  const profile = useMemo<Profile>(() => ({
    name: accountProfile?.full_name ?? user?.user_metadata.full_name ?? '',
    email: accountProfile?.email ?? user?.email ?? '',
    currency: accountProfile?.currency ?? 'IDR',
    theme,
  }), [accountProfile, user?.email, user?.user_metadata.full_name, theme])

  const refreshData = useCallback(async () => {
    if (!userId) return
    setLoadingByUser((current) => ({ ...current, [userId]: true }))
    try {
      const loaded = await loadUserData(userId, profile)
      setDataByUser((current) => ({ ...current, [userId]: loaded }))
      setErrorByUser((current) => ({ ...current, [userId]: null }))
    } catch (error) {
      setErrorByUser((current) => ({ ...current, [userId]: errorText(error) }))
    } finally {
      setLoadingByUser((current) => ({ ...current, [userId]: false }))
    }
  }, [userId, profile])

  useEffect(() => {
    if (userId) void refreshData()
  }, [userId, refreshData])

  const updateProfile = useCallback(async (nextProfile: Profile) => {
    if (!userId) throw new Error('You must be signed in to update your profile.')
    await updateAccountProfile(nextProfile.name.trim(), nextProfile.currency)
    try {
      localStorage.setItem(`dayflow-theme:${userId}`, nextProfile.theme)
    } catch (error) {
      console.error('Unable to save DAYFLOW theme preference.', error)
      throw new Error('Profil tersimpan, tetapi preferensi tema tidak dapat disimpan di browser ini.', { cause: error })
    }
    setDataByUser((current) => ({
      ...current,
      [userId]: {
        ...(current[userId] ?? { tasks: [], transactions: [], budgets: [], goals: [], profile: nextProfile }),
        profile: nextProfile,
      },
    }))
  }, [userId, updateAccountProfile])

  const data = useMemo<AppData>(() => {
    const stored = userId ? dataByUser[userId] : undefined
    return {
      tasks: stored?.tasks ?? [],
      transactions: stored?.transactions ?? [],
      budgets: stored?.budgets ?? [],
      goals: stored?.goals ?? [],
      profile,
    }
  }, [userId, dataByUser, profile])

  const value = useMemo<AppDataContextValue>(() => ({
    ...data,
    dataLoading: userId ? loadingByUser[userId] ?? true : false,
    dataError: userId ? errorByUser[userId] ?? null : null,
    refreshData,
    updateProfile,
  }), [data, userId, loadingByUser, errorByUser, refreshData, updateProfile])

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const context = useContext(AppDataContext)
  if (!context) throw new Error('useAppData must be used inside AppDataProvider.')
  return context
}
