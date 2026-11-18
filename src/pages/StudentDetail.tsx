import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { showError } from "../utils/showError"
import useAuth from "../hooks/useAuth"
import { getStudentById, type Student } from "../service/students"
import { getClasses, type ClassItem } from "../service/classes"
import {getEnrollments,createEnrollment, updateEnrollment, type Enrollment } from "../service/enrollments"
import Ledger from "../components/Ledger"

function StudentDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const isTutor = user?.role === "tutor"

  const [student, setStudent] = useState<Student | null>(null)
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)

  const [classId, setClassId] = useState("")
  const [endingId, setEndingId] = useState<string | null>(null)
  const [endMonth, setEndMonth] = useState("")

  // Every time this number changes, the Ledger loads again
  const [ledgerVersion, setLedgerVersion] = useState(0)

  const loadAll = async () => {
    if (!id) {
      return
    }

    try {
      const [studentResponse, classesResponse, enrollmentsResponse] = await Promise.all([
        getStudentById(id),
        getClasses(),
        getEnrollments(id)
      ])
      setStudent(studentResponse.data)
      setClasses(classesResponse.data)
      setEnrollments(enrollmentsResponse.data)
      setLedgerVersion((currentVersion) => currentVersion + 1)
    } catch (error) {
      showError(error, "Could not load the student..!")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [id])

  const enrolledClassIds = enrollments.map((enrollment) => enrollment.classId)
  const availableClasses = classes.filter((classItem) => {
    return classItem.active && !enrolledClassIds.includes(classItem.id)
  })

  const handleEnroll = async () => {
    if (!id || !classId) {
      return alert("Please choose a class..!")
    }

    try {
      await createEnrollment(id, classId)
      alert("Student enrolled.")
      setClassId("")
      await loadAll()
    } catch (error) {
      showError(error, "Enroll failed..!")
    }
  }

  const handleEnd = async (enrollmentId: string) => {
    if (!endMonth) {
      return alert("Please choose the last month..!")
    }

    try {
      await updateEnrollment(enrollmentId, endMonth)
      alert("Enrollment ended.")
      setEndingId(null)
      setEndMonth("")
      await loadAll()
    } catch (error) {
      showError(error, "Could not end the enrollment..!")
    }
  }

  const handleReopen = async (enrollmentId: string) => {
    if (!window.confirm("Reopen this enrollment?")) {
      return
    }

    try {
      await updateEnrollment(enrollmentId, null)
      alert("Enrollment reopened.")
      await loadAll()
    } catch (error) {
      showError(error, "Could not reopen the enrollment..!")
    }
  }

  const getClassName = (classIdValue: string) => {
    const found = classes.find((classItem) => classItem.id === classIdValue)
    return found ? found.name : "Unknown class"
  }

  if (loading) {
    return <p className="text-slate-500">Loading...</p>
  }

  if (!student) {
    return <p className="text-slate-500">Student not found.</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-emerald-950">{student.name}</h1>
        <Link to="/students" className="text-emerald-700 hover:underline">
          Back to students
        </Link>
      </div>

      <div className="bg-white border border-emerald-100 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-slate-500">Guardian</p>
          <p className="text-slate-900">{student.guardianName}</p>
        </div>
        <div>
          <p className="text-slate-500">Phone</p>
          <p className="text-slate-900">{student.phone}</p>
        </div>
        <div>
          <p className="text-slate-500">Status</p>
          <span
            className={
              "inline-block rounded-full px-2.5 py-1 text-xs font-semibold " +
              (student.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-700")
            }
          >
            {student.status === "active" ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      <div className="bg-white border border-emerald-100 rounded-xl p-4 flex flex-col gap-3">
        <h2 className="font-semibold text-emerald-950">Enroll in a class</h2>
        {student.status !== "active" && (
          <p className="text-sm text-slate-500">Inactive students cannot be enrolled.</p>
        )}
        {student.status === "active" && (
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              className="w-full sm:flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
              value={classId}
              onChange={(event) => setClassId(event.target.value)}
            >
              <option value="">Choose a class</option>
              {availableClasses.map((classItem) => {
                return (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.name} (LKR {classItem.monthlyFeeLKR})
                  </option>
                )
              })}
            </select>
            <button
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
              onClick={handleEnroll}
            >
              Enroll
            </button>
          </div>
        )}
      </div>

      <div className="bg-white border border-emerald-100 rounded-xl p-4 flex flex-col gap-3">
        <h2 className="font-semibold text-emerald-950">Enrollments</h2>

        {enrollments.length === 0 && <p className="text-sm text-slate-500">Not enrolled in any class.</p>}

        {enrollments.map((enrollment) => {
          return (
            <div
              key={enrollment.id}
              className="border border-emerald-100 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
            >
              <div>
                <p className="font-semibold text-slate-900">{getClassName(enrollment.classId)}</p>
                <p className="text-sm text-slate-600">
                  From {enrollment.startMonth} &middot;{" "}
                  <span
                    className={
                      "rounded-full px-2 py-0.5 text-xs font-semibold " +
                      (enrollment.endMonth ? "bg-stone-200 text-stone-700" : "bg-emerald-100 text-emerald-800")
                    }
                  >
                    {enrollment.endMonth ? "Ended " + enrollment.endMonth : "Active"}
                  </span>
                </p>
              </div>

              <div>
                {isTutor && enrollment.endMonth === null && endingId !== enrollment.id && (
                  <button
                    className="text-rose-600 font-semibold hover:underline"
                    onClick={() => {
                      setEndingId(enrollment.id)
                      setEndMonth("")
                    }}
                  >
                    End
                  </button>
                )}
                {isTutor && enrollment.endMonth !== null && (
                  <button
                    className="text-emerald-700 font-semibold hover:underline"
                    onClick={() => handleReopen(enrollment.id)}
                  >
                    Reopen
                  </button>
                )}
                {isTutor && endingId === enrollment.id && (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="month"
                      className="px-2 py-1 border rounded-lg"
                      min={enrollment.startMonth}
                      value={endMonth}
                      onChange={(event) => setEndMonth(event.target.value)}
                    />
                    <button
                      className="px-3 py-1 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition"
                      onClick={() => handleEnd(enrollment.id)}
                    >
                      Confirm
                    </button>
                    <button
                      className="px-3 py-1 border rounded-lg hover:bg-emerald-50 transition"
                      onClick={() => setEndingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-emerald-950">Fees and payments</h2>
        <Ledger studentId={student.id} isTutor={isTutor} version={ledgerVersion} />
      </div>
    </div>
  )
}

export default StudentDetail