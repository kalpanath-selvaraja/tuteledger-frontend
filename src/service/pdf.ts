import { jsPDF } from "jspdf"
import { dateLabel, money, monthLabel, type Ledger, type Receipt } from "./ledger"

// Cuts long text so it stays inside its column on the page
const short = (text: string, max: number) => {
  return text.length > max ? text.slice(0, max - 3) + "..." : text
}

const STATUS_TEXT = {
  paid: "Paid",
  waived: "Waived",
  unpaid: "Unpaid"
}

// One receipt = every month paid in the same payment
export const downloadReceipt = (studentName: string, receipt: Receipt) => {
  const doc = new jsPDF()

  doc.setFont("helvetica", "bold")
  doc.setFontSize(20)
  doc.text("TuteLedger", 20, 25)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(12)
  doc.text("Payment receipt", 20, 33)

  doc.text("Receipt no: " + receipt.receiptNo, 20, 50)
  doc.text("Date: " + dateLabel(receipt.paidOn), 20, 58)
  doc.text("Student: " + studentName, 20, 66)

  doc.line(20, 74, 190, 74)

  let y = 84
  for (const line of receipt.lines) {
    doc.text(line.label, 20, y)
    doc.text(money(line.amountLKR), 190, y, { align: "right" })
    y = y + 8
  }

  doc.line(20, y, 190, y)
  y = y + 10

  doc.setFont("helvetica", "bold")
  doc.text("Total", 20, y)
  doc.text(money(receipt.total), 190, y, { align: "right" })

  doc.save(receipt.receiptNo + ".pdf")
}

// The whole ledger of one student: every class, every month
export const downloadStatement = (ledger: Ledger) => {
  const doc = new jsPDF()
  let y = 25

  // A4 is about 297 mm tall, so start a new page before the text runs off the bottom
  const checkPage = () => {
    if (y > 275) {
      doc.addPage()
      y = 20
    }
  }

  doc.setFont("helvetica", "bold")
  doc.setFontSize(20)
  doc.text("TuteLedger", 20, y)
  y = y + 8

  doc.setFont("helvetica", "normal")
  doc.setFontSize(12)
  doc.text("Fee statement", 20, y)
  y = y + 12

  doc.text("Student: " + ledger.student.name, 20, y)
  y = y + 7
  doc.text("Date: " + new Date().toLocaleDateString("en-GB"), 20, y)
  y = y + 7
  doc.text("Paid so far: " + money(ledger.totalPaidLKR), 20, y)
  y = y + 7
  doc.text("Outstanding: " + money(ledger.totalOutstandingLKR) + " (" + ledger.totalUnpaidMonths + " unpaid month(s))", 20, y)
  y = y + 12

  if (ledger.classes.length === 0) {
    doc.text("No enrollments.", 20, y)
  }

  for (const c of ledger.classes) {
    checkPage()

    doc.setFont("helvetica", "bold")
    doc.text(c.className + " - " + c.subject + " (" + money(c.monthlyFeeLKR) + " per month)", 20, y)
    y = y + 6

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.line(20, y - 2, 190, y - 2)
    y = y + 3

    for (const m of c.months) {
      checkPage()

      let detail = ""
      if (m.status === "paid") {
        detail = (m.receiptNo ?? "") + " " + dateLabel(m.paidOn)
      } else if (m.status === "waived") {
        detail = m.reason ?? ""
      }

      doc.text(monthLabel(m.month), 20, y)
      doc.text(STATUS_TEXT[m.status], 55, y)
      doc.text(short(detail, 42), 85, y)
      doc.text(m.status === "waived" ? "-" : money(m.amountLKR), 190, y, { align: "right" })
      y = y + 6
    }

    doc.setFontSize(12)
    y = y + 8
  }

  doc.save("statement-" + ledger.student.name.replace(/\s+/g, "-") + ".pdf")
}