import { jsPDF } from "jspdf"
import { dateLabel, money, monthLabel, type Ledger, type Receipt } from "./ledger"

// Cuts long text so it stays inside its column on the page
const short = (text: string, maxLength: number) => {
  return text.length > maxLength ? text.slice(0, maxLength - 3) + "..." : text
}

const STATUS_TEXT = {
  paid: "Paid",
  waived: "Waived",
  unpaid: "Unpaid"
}

// One receipt = every month paid in the same payment
export const downloadReceipt = (studentName: string, receipt: Receipt) => {
  const pdfDocument = new jsPDF()

  pdfDocument.setFont("helvetica", "bold")
  pdfDocument.setFontSize(20)
  pdfDocument.text("TuteLedger", 20, 25)

  pdfDocument.setFont("helvetica", "normal")
  pdfDocument.setFontSize(12)
  pdfDocument.text("Payment receipt", 20, 33)

  pdfDocument.text("Receipt no: " + receipt.receiptNo, 20, 50)
  pdfDocument.text("Date: " + dateLabel(receipt.paidOn), 20, 58)
  pdfDocument.text("Student: " + studentName, 20, 66)

  pdfDocument.line(20, 74, 190, 74)

  let verticalPosition = 84
  for (const line of receipt.lines) {
    pdfDocument.text(line.label, 20, verticalPosition)
    pdfDocument.text(money(line.amountLKR), 190, verticalPosition, { align: "right" })
    verticalPosition = verticalPosition + 8
  }

  pdfDocument.line(20, verticalPosition, 190, verticalPosition)
  verticalPosition = verticalPosition + 10

  pdfDocument.setFont("helvetica", "bold")
  pdfDocument.text("Total", 20, verticalPosition)
  pdfDocument.text(money(receipt.total), 190, verticalPosition, { align: "right" })

  pdfDocument.save(receipt.receiptNo + ".pdf")
}

// The whole ledger of one student: every class, every month
export const downloadStatement = (ledger: Ledger) => {
  const pdfDocument = new jsPDF()
  let verticalPosition = 25

  // A4 is about 297 mm tall, so start a new page before the text runs off the bottom
  const checkPage = () => {
    if (verticalPosition > 275) {
      pdfDocument.addPage()
      verticalPosition = 20
    }
  }

  pdfDocument.setFont("helvetica", "bold")
  pdfDocument.setFontSize(20)
  pdfDocument.text("TuteLedger", 20, verticalPosition)
  verticalPosition = verticalPosition + 8

  pdfDocument.setFont("helvetica", "normal")
  pdfDocument.setFontSize(12)
  pdfDocument.text("Fee statement", 20, verticalPosition)
  verticalPosition = verticalPosition + 12

  pdfDocument.text("Student: " + ledger.student.name, 20, verticalPosition)
  verticalPosition = verticalPosition + 7
  pdfDocument.text("Date: " + new Date().toLocaleDateString("en-GB"), 20, verticalPosition)
  verticalPosition = verticalPosition + 7
  pdfDocument.text("Paid so far: " + money(ledger.totalPaidLKR), 20, verticalPosition)
  verticalPosition = verticalPosition + 7
  pdfDocument.text("Outstanding: " + money(ledger.totalOutstandingLKR) + " (" + ledger.totalUnpaidMonths + " unpaid month(s))", 20, verticalPosition)
  verticalPosition = verticalPosition + 12

  if (ledger.classes.length === 0) {
    pdfDocument.text("No enrollments.", 20, verticalPosition)
  }

  for (const ledgerClass of ledger.classes) {
    checkPage()

    pdfDocument.setFont("helvetica", "bold")
    pdfDocument.text(ledgerClass.className + " - " + ledgerClass.subject + " (" + money(ledgerClass.monthlyFeeLKR) + " per month)", 20, verticalPosition)
    verticalPosition = verticalPosition + 6

    pdfDocument.setFont("helvetica", "normal")
    pdfDocument.setFontSize(10)
    pdfDocument.line(20, verticalPosition - 2, 190, verticalPosition - 2)
    verticalPosition = verticalPosition + 3

    for (const ledgerMonth of ledgerClass.months) {
      checkPage()

      let detail = ""
      if (ledgerMonth.status === "paid") {
        detail = (ledgerMonth.receiptNo ?? "") + " " + dateLabel(ledgerMonth.paidOn)
      } else if (ledgerMonth.status === "waived") {
        detail = ledgerMonth.reason ?? ""
      }

      pdfDocument.text(monthLabel(ledgerMonth.month), 20, verticalPosition)
      pdfDocument.text(STATUS_TEXT[ledgerMonth.status], 55, verticalPosition)
      pdfDocument.text(short(detail, 42), 85, verticalPosition)
      pdfDocument.text(ledgerMonth.status === "waived" ? "-" : money(ledgerMonth.amountLKR), 190, verticalPosition, { align: "right" })
      verticalPosition = verticalPosition + 6
    }

    pdfDocument.setFontSize(12)
    verticalPosition = verticalPosition + 8
  }

  pdfDocument.save("statement-" + ledger.student.name.replace(/\s+/g, "-") + ".pdf")
}