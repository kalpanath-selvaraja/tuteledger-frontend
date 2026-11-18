import api from "./api"

export type LedgerMonth = {
  month: string
  status: "paid" | "waived" | "unpaid"
  amountLKR: number
  paymentId: string | null
  receiptNo: string | null
  paidOn: string | null
  reason: string | null
}

export type LedgerClass = {
  enrollmentId: string
  classId: string
  className: string
  subject: string
  monthlyFeeLKR: number
  startMonth: string
  endMonth: string | null
  paidLKR: number
  outstandingLKR: number
  unpaidMonths: number
  months: LedgerMonth[]
}

export type Ledger = {
  student: { id: string; name: string }
  currentMonth: string
  totalPaidLKR: number
  totalOutstandingLKR: number
  totalUnpaidMonths: number
  classes: LedgerClass[]
}

export type Receipt = {
  receiptNo: string
  paidOn: string | null
  total: number
  lines: { label: string; amountLKR: number }[]
}

export const money = (value: number) => "Rs. " + value.toLocaleString()

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

// "2026-11" becomes "Nov 2026"
export const monthLabel = (month: string) => {
  return MONTH_NAMES[Number(month.slice(5, 7)) - 1] + " " + month.slice(0, 4)
}

export const dateLabel = (iso: string | null) => {
  return iso ? new Date(iso).toLocaleDateString("en-GB") : ""
}

export const getLedger = async (studentId: string) => {
  const res = await api.get(`/students/${studentId}/ledger`)
  return res.data
}