import type { AppData } from '../types'
import { format, subDays } from 'date-fns'

const today = new Date()
const day = (offset: number) => format(subDays(today, -offset), 'yyyy-MM-dd')

export const initialData: AppData = {
  profile: {
    name: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    currency: 'IDR',
    theme: 'Light',
  },
  tasks: [
    { id: 't1', title: 'Tinjau rencana produk kuartal 3', description: 'Selaraskan prioritas dengan tim produk.', dueDate: day(0), priority: 'High', status: 'In Progress', category: 'Work' },
    { id: 't2', title: 'Bayar tagihan listrik', description: 'Lunasi tagihan utilitas bulanan.', dueDate: day(0), priority: 'Medium', status: 'To Do', category: 'Personal' },
    { id: 't3', title: 'Siapkan pembaruan tim mingguan', description: 'Rangkum progres dan kendala.', dueDate: day(1), priority: 'Medium', status: 'To Do', category: 'Work' },
    { id: 't4', title: 'Buat janji dengan dokter gigi', description: 'Cari jadwal kosong untuk minggu depan.', dueDate: day(2), priority: 'Low', status: 'To Do', category: 'Health' },
    { id: 't5', title: 'Kirim proposal proyek', description: 'Tinjau kembali sebelum dikirim ke klien.', dueDate: day(-1), priority: 'High', status: 'Completed', category: 'Work' },
    { id: 't6', title: 'Rencanakan belanja akhir pekan', description: 'Buat daftar belanja sebelum hari Sabtu.', dueDate: day(3), priority: 'Low', status: 'Completed', category: 'Personal' },
    { id: 't7', title: 'Perbarui situs portofolio', description: 'Tambahkan dua studi kasus terbaru.', dueDate: day(4), priority: 'Medium', status: 'In Progress', category: 'Personal' },
  ],
  transactions: [
    { id: 'x1', title: 'Gaji bulanan', type: 'Income', amount: 12500000, date: day(0), category: 'Salary', paymentMethod: 'Bank transfer', notes: '' },
    { id: 'x2', title: 'Sewa apartemen', type: 'Expense', amount: 4200000, date: day(-1), category: 'Housing', paymentMethod: 'Bank transfer', notes: '' },
    { id: 'x3', title: 'Belanja kebutuhan', type: 'Expense', amount: 685000, date: day(-2), category: 'Groceries', paymentMethod: 'Debit card', notes: 'Belanja mingguan' },
    { id: 'x4', title: 'Proyek lepas', type: 'Income', amount: 2750000, date: day(-3), category: 'Freelance', paymentMethod: 'Bank transfer', notes: '' },
    { id: 'x5', title: 'Ngopi bersama Maya', type: 'Expense', amount: 96000, date: day(-3), category: 'Dining', paymentMethod: 'E-wallet', notes: '' },
    { id: 'x6', title: 'Tagihan internet', type: 'Expense', amount: 425000, date: day(-5), category: 'Utilities', paymentMethod: 'Debit card', notes: '' },
    { id: 'x7', title: 'Kursus daring', type: 'Expense', amount: 350000, date: day(-7), category: 'Education', paymentMethod: 'Credit card', notes: '' },
    { id: 'x8', title: 'Konsultasi desain', type: 'Income', amount: 950000, date: day(-9), category: 'Freelance', paymentMethod: 'Bank transfer', notes: '' },
  ],
  budgets: [
    { id: 'b1', category: 'Housing', limit: 5000000, month: format(today, 'yyyy-MM') },
    { id: 'b2', category: 'Groceries', limit: 1500000, month: format(today, 'yyyy-MM') },
    { id: 'b3', category: 'Dining', limit: 900000, month: format(today, 'yyyy-MM') },
    { id: 'b4', category: 'Transport', limit: 650000, month: format(today, 'yyyy-MM') },
  ],
  goals: [
    { id: 'g1', name: 'Liburan ke Jepang', target: 30000000, current: 18400000, deadline: day(150) },
    { id: 'g2', name: 'Dana darurat', target: 50000000, current: 32750000, deadline: day(240) },
    { id: 'g3', name: 'Laptop baru', target: 18000000, current: 11200000, deadline: day(90) },
  ],
}
