import { useState, type FormEvent } from 'react'
import type { Transaction, TransactionType } from '../../types'
import { Field, FormActions, Modal } from '../ui'
import { inputClass } from '../ui/styles'
import { categoryLabel, transactionTypeLabel } from '../../lib/locale'

const newTransaction: Omit<Transaction, 'id'> = {
  title: '',
  type: 'Expense',
  amount: 0,
  date: new Date().toISOString().slice(0, 10),
  category: 'Groceries',
  paymentMethod: 'Debit card',
  notes: '',
}

export function TransactionDialog({ transaction, onClose, onSave, submitting = false, error }: {
  transaction?: Transaction
  onClose: () => void
  onSave: (transaction: Omit<Transaction, 'id'>) => void | Promise<void>
  submitting?: boolean
  error?: string
}) {
  const [values, setValues] = useState<Omit<Transaction, 'id'>>(transaction ? {
    title: transaction.title,
    type: transaction.type,
    amount: transaction.amount,
    date: transaction.date,
    category: transaction.category,
    paymentMethod: transaction.paymentMethod,
    notes: transaction.notes,
  } : newTransaction)
  const update = (key: keyof typeof values, value: string | number) => setValues((current) => ({ ...current, [key]: value }))
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!values.title.trim() || values.amount <= 0) return
    onSave({ ...values, title: values.title.trim() })
  }
  return (
    <Modal title={transaction ? 'Ubah transaksi' : 'Tambah transaksi'} description="Catat uang yang masuk dan keluar." onClose={onClose}>
      <form onSubmit={submit}>
        <div className="space-y-4">
          <Field label="Nama transaksi"><input autoFocus className={inputClass} maxLength={80} onChange={(event) => update('title', event.target.value)} placeholder="Contoh: Belanja bulanan" required value={values.title} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Jenis"><select className={inputClass} onChange={(event) => update('type', event.target.value)} value={values.type}>{(['Expense', 'Income'] as TransactionType[]).map((item) => <option key={item} value={item}>{transactionTypeLabel(item)}</option>)}</select></Field>
            <Field label="Jumlah (IDR)"><input className={inputClass} min="1" onChange={(event) => update('amount', Number(event.target.value))} required type="number" value={values.amount || ''} /></Field>
            <Field label="Kategori"><select className={inputClass} onChange={(event) => update('category', event.target.value)} value={values.category}>{['Housing', 'Groceries', 'Dining', 'Transport', 'Utilities', 'Health', 'Education', 'Salary', 'Freelance', 'Other'].map((item) => <option key={item} value={item}>{categoryLabel(item)}</option>)}</select></Field>
            <Field label="Tanggal"><input className={inputClass} onChange={(event) => update('date', event.target.value)} required type="date" value={values.date} /></Field>
            <Field label="Metode pembayaran"><select className={inputClass} onChange={(event) => update('paymentMethod', event.target.value)} value={values.paymentMethod}>{[['Bank transfer', 'Transfer bank'], ['Debit card', 'Kartu debit'], ['Credit card', 'Kartu kredit'], ['Cash', 'Tunai'], ['E-wallet', 'Dompet digital']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
            <Field label="Catatan"><input className={inputClass} onChange={(event) => update('notes', event.target.value)} placeholder="Opsional" value={values.notes} /></Field>
          </div>
        </div>
        {error && <p role="alert" className="mt-4 text-xs text-danger">{error}</p>}
        <FormActions disabled={submitting} onCancel={onClose} submitLabel={submitting ? 'Menyimpan…' : transaction ? 'Simpan transaksi' : 'Tambah transaksi'} />
      </form>
    </Modal>
  )
}
