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

export const getLedger = async (studentId: string) => {
  const res = await api.get(`/students/${studentId}/ledger`)
  return res.data
}