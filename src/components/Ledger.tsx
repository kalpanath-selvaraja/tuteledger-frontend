import { useEffect, useState } from "react"
import axios from "axios"
import { getLedger, type Ledger as LedgerData } from "../service/ledger"
import { createPayment, createWaiver, voidPayment } from "../service/payments"

type LedgerProps = {
  studentId: string
  isTutor: boolean
  version: number
}

const money = (value: number) => "Rs. " + value.toLocaleString()

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

// "2026-11" becomes "Nov 2026"
const monthLabel = (month: string) => {
  return MONTH_NAMES[Number(month.slice(5, 7)) - 1] + " " + month.slice(0, 4)
}

const dateLabel = (iso: string | null) => {
  return iso ? new Date(iso).toLocaleDateString("en-GB") : ""
}

const BADGE = {
  paid: "bg-emerald-100 text-emerald-800",
  waived: "bg-sky-100 text-sky-800",
  unpaid: "bg-amber-100 text-amber-800"
}

const BADGE_TEXT = {
  paid: "Paid",
  waived: "Waived",
  unpaid: "Unpaid"
}

function Ledger({ studentId, isTutor, version }: LedgerProps) {
  const [ledger, setLedger] = useState<LedgerData | null>(null)
  const [loading, setLoading] = useState(true)

  // every ticked month is stored as "enrollmentId|month"
  const [selected, setSelected] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const showError = (err: unknown, fallback: string) => {
    console.error(err)
    if (axios.isAxiosError(err) && err.response?.data?.errors) {
      return alert(err.response.data.errors.join("\n"))
    }
    if (axios.isAxiosError(err) && err.response?.data?.message) {
      return alert(err.response.data.message)
    }
    alert(fallback)
  }

  const loadLedger = async () => {
    try {
      const res = await getLedger(studentId)
      setLedger(res.data)
    } catch (err) {
      showError(err, "Could not load the ledger..!")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setSelected([])
    loadLedger()
  }, [studentId, version])

  const toggle = (key: string) => {
    if (selected.includes(key)) {
      setSelected(selected.filter((k) => k !== key))
    } else {
      setSelected([...selected, key])
    }
  }

  // The total shown here is only a preview. The server works out the real amount.
  let selectedTotal = 0
  if (ledger) {
    for (const c of ledger.classes) {
      for (const m of c.months) {
        if (selected.includes(c.enrollmentId + "|" + m.month)) {
          selectedTotal = selectedTotal + m.amountLKR
        }
      }
    }
  }

  const handleRecord = async () => {
    if (selected.length === 0) {
      return alert("Tick at least one unpaid month..!")
    }

    const items = selected.map((key) => {
      const [enrollmentId, month] = key.split("|")
      return { enrollmentId, month }
    })

    setSaving(true)
    try {
      const res = await createPayment(items)
      alert("Payment recorded. Receipt " + res.data.receiptNo + ", total " + money(res.data.totalLKR))
      setSelected([])
      await loadLedger()
    } catch (err) {
      showError(err, "Could not record the payment..!")
    } finally {
      setSaving(false)
    }
  }

  const handleVoid = async (paymentId: string, label: string) => {
    const reason = window.prompt("Reason for voiding " + label + "?")
    if (reason === null) {
      return
    }
    if (!reason.trim()) {
      return alert("A reason is required..!")
    }

    try {
      await voidPayment(paymentId, reason.trim())
      alert("Voided.")
      await loadLedger()
    } catch (err) {
      showError(err, "Could not void..!")
    }
  }

  const handleWaive = async (enrollmentId: string, month: string) => {
    const reason = window.prompt("Reason for waiving " + monthLabel(month) + "?")
    if (reason === null) {
      return
    }
    if (!reason.trim()) {
      return alert("A reason is required..!")
    }

    try {
      await createWaiver(enrollmentId, [month], reason.trim())
      alert("Month waived.")
      await loadLedger()
    } catch (err) {
      showError(err, "Could not waive..!")
    }
  }

  if (loading) {
    return <p className="text-slate-500">Loading ledger...</p>
  }

  if (!ledger) {
    return <p className="text-slate-500">Ledger not available.</p>
  }

  // One receipt = every paid month that shares a receipt number.
  const receipts: { receiptNo: string; paidOn: string | null; total: number; lines: string[] }[] = []
  for (const c of ledger.classes) {
    for (const m of c.months) {
      if (m.status !== "paid" || !m.receiptNo) {
        continue
      }
      let receipt = receipts.find((r) => r.receiptNo === m.receiptNo)
      if (!receipt) {
        receipt = { receiptNo: m.receiptNo, paidOn: m.paidOn, total: 0, lines: [] }
        receipts.push(receipt)
      }
      receipt.total = receipt.total + m.amountLKR
      receipt.lines.push(c.className + " - " + monthLabel(m.month))
    }
  }
  receipts.sort((a, b) => (b.paidOn ?? "").localeCompare(a.paidOn ?? ""))

  return (
    <div className="flex flex-col gap-4 pb-24 sm:pb-0">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl bg-emerald-600 text-white p-4">
          <p className="text-sm text-emerald-100">Paid so far</p>
          <p className="text-2xl font-bold">{money(ledger.totalPaidLKR)}</p>
        </div>
        <div className="rounded-xl bg-amber-500 text-white p-4">
          <p className="text-sm text-amber-50">Outstanding</p>
          <p className="text-2xl font-bold">{money(ledger.totalOutstandingLKR)}</p>
        </div>
        <div className="rounded-xl bg-sky-600 text-white p-4">
          <p className="text-sm text-sky-100">Unpaid months</p>
          <p className="text-2xl font-bold">{ledger.totalUnpaidMonths}</p>
        </div>
      </div>

      {ledger.classes.length === 0 && (
        <p className="bg-white border border-emerald-100 rounded-xl p-4 text-slate-500">
          No enrollments yet, so nothing is owed.
        </p>
      )}

      {ledger.classes.map((c) => {
        return (
          <div key={c.enrollmentId} className="bg-white border border-emerald-100 rounded-xl overflow-hidden">
            <div className="bg-emerald-50 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-emerald-950">{c.className}</p>
                <p className="text-xs text-slate-600">
                  {c.subject} &middot; {money(c.monthlyFeeLKR)} per month &middot; {monthLabel(c.startMonth)} to{" "}
                  {c.endMonth ? monthLabel(c.endMonth) : "now"}
                </p>
              </div>
              <p className="text-sm font-semibold text-amber-700">
                {c.outstandingLKR > 0 ? money(c.outstandingLKR) + " owed" : "All settled"}
              </p>
            </div>

            <ul>
              {[...c.months].reverse().map((m) => {
                const key = c.enrollmentId + "|" + m.month
                return (
                  <li
                    key={m.month}
                    className="border-t border-emerald-50 px-4 py-3 flex flex-wrap items-center gap-x-3 gap-y-2"
                  >
                    <div className="w-6">
                      {m.status === "unpaid" && (
                        <input
                          type="checkbox"
                          className="h-5 w-5 accent-emerald-600"
                          checked={selected.includes(key)}
                          onChange={() => toggle(key)}
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-[140px]">
                      <p className="font-medium text-slate-900">{monthLabel(m.month)}</p>
                      {m.status === "paid" && (
                        <p className="text-xs text-slate-500">
                          {m.receiptNo} &middot; {dateLabel(m.paidOn)}
                        </p>
                      )}
                      {m.status === "waived" && <p className="text-xs text-slate-500">{m.reason}</p>}
                    </div>

                    <span className={"rounded-full px-2.5 py-1 text-xs font-semibold " + BADGE[m.status]}>
                      {BADGE_TEXT[m.status]}
                    </span>

                    <p className="w-24 text-right text-sm tabular-nums text-slate-700">
                      {m.status === "waived" ? "-" : money(m.amountLKR)}
                    </p>

                    <div className="w-14 text-right">
                      {isTutor && m.paymentId && (
                        <button
                          className="text-sm font-semibold text-red-600 hover:underline"
                          onClick={() => handleVoid(m.paymentId as string, monthLabel(m.month))}
                        >
                          Void
                        </button>
                      )}
                      {isTutor && m.status === "unpaid" && (
                        <button
                          className="text-sm font-semibold text-sky-700 hover:underline"
                          onClick={() => handleWaive(c.enrollmentId, m.month)}
                        >
                          Waive
                        </button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}

      {/* Pay bar: fixed at the bottom on phones, a normal row on larger screens */}
      {ledger.totalUnpaidMonths > 0 && (
        <div className="fixed bottom-0 inset-x-0 sm:static bg-white sm:bg-transparent border-t sm:border-0 border-emerald-100 p-3 sm:p-0 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-700">
            {selected.length} month(s) ticked &middot; <span className="font-bold">{money(selectedTotal)}</span>
          </p>
          <button
            className="px-5 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
            disabled={saving || selected.length === 0}
            onClick={handleRecord}
          >
            {saving ? "Saving..." : "Record payment"}
          </button>
        </div>
      )}

      <div className="bg-white border border-emerald-100 rounded-xl p-4 flex flex-col gap-3">
        <h2 className="font-semibold text-emerald-950">Receipts</h2>
        {receipts.length === 0 && <p className="text-sm text-slate-500">No receipts yet.</p>}
        {receipts.map((r) => {
          return (
            <div key={r.receiptNo} className="border border-emerald-100 rounded-lg p-3">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <p className="font-semibold text-slate-900">{r.receiptNo}</p>
                <p className="font-semibold text-emerald-700">{money(r.total)}</p>
              </div>
              <p className="text-xs text-slate-500">{dateLabel(r.paidOn)}</p>
              <p className="text-sm text-slate-700 mt-1">{r.lines.join(", ")}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Ledger