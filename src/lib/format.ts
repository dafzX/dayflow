import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

export const formatMoney = (value: number, currency = 'IDR') =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)

export const formatShortMoney = (value: number, currency = 'IDR') => {
  const symbol = new Intl.NumberFormat('id-ID', { style: 'currency', currency, maximumFractionDigits: 0 }).formatToParts(0).find((part) => part.type === 'currency')?.value ?? currency
  if (value >= 1_000_000) return `${symbol} ${(value / 1_000_000).toFixed(value % 1_000_000 ? 1 : 0)} jt`
  if (value >= 1_000) return `${symbol} ${(value / 1_000).toFixed(0)} rb`
  return formatMoney(value, currency)
}

export const formatDate = (date: string, pattern = 'MMM d, yyyy') =>
  format(parseISO(date), pattern, { locale: id })

export const formatLocalized = (date: Date | number, pattern: string) =>
  format(date, pattern, { locale: id })

export const todayString = () => format(new Date(), 'yyyy-MM-dd')
export const monthString = () => format(new Date(), 'yyyy-MM')

export const greeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Selamat pagi'
  if (hour < 18) return 'Selamat siang'
  return 'Selamat malam'
}
