import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import axios from "axios"
import useAuth from "../hooks/useAuth"
import { getStudentById, type Student } from "../service/students"
import { getClasses, type ClassItem } from "../service/classes"
import {getEnrollments,createEnrollment, updateEnrollment, type Enrollment } from "../service/enrollments"

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

  const loadAll = async () => {
    if (!id) {
      return
    }

    try {
      const [studentRes, classesRes, enrollmentsRes] = await Promise.all([
        getStudentById(id),
        getClasses(),
        getEnrollments(id)
      ])
      setStudent(studentRes.data)
      setClasses(classesRes.data)
      setEnrollments(enrollmentsRes.data)
    } catch (err) {
      showError(err, "Could not load the student..!")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [id])

  const enrolledClassIds = enrollments.map((e) => e.classId)
  const availableClasses = classes.filter((c) => {
    return c.active && !enrolledClassIds.includes(c.id)
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
    } catch (err) {
      showError(err, "Enroll failed..!")
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
    } catch (err) {
      showError(err, "Could not end the enrollment..!")
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
    } catch (err) {
      showError(err, "Could not reopen the enrollment..!")
    }
  }

  const getClassName = (classIdValue: string) => {
    const found = classes.find((c) => c.id === classIdValue)
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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">{student.name}</h1>
        <Link to="/students" className="text-blue-600 hover:underline">
          Back to students
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
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
          <p className="text-slate-900">
            {student.status === "active" ? "Active" : "Inactive"}
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col gap-3">
        <h2 className="font-semibold text-slate-900">Enroll in a class</h2>
        {student.status !== "active" && (
          <p className="text-sm text-slate-500">
            Inactive students cannot be enrolled.
          </p>
        )}
        {student.status === "active" && (
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
            >
              <option value="">Choose a class</option>
              {availableClasses.map((c) => {
                return (
                  <option key={c.id} value={c.id}>
                    {c.name} (LKR {c.monthlyFeeLKR})
                  </option>
                )
              })}
            </select>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              onClick={handleEnroll}
            >
              Enroll
            </button>
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-2">Class</th>
              <th className="px-4 py-2">Start month</th>
              <th className="px-4 py-2">End month</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {enrollments.length === 0 && (
              <tr>
                <td className="px-4 py-3 text-slate-500" colSpan={4}>
                  Not enrolled in any class.
                </td>
              </tr>
            )}
            {enrollments.map((e) => {
              return (
                <tr key={e.id} className="border-t border-slate-100">
                  <td className="px-4 py-2">{getClassName(e.classId)}</td>
                  <td className="px-4 py-2">{e.startMonth}</td>
                  <td className="px-4 py-2">{e.endMonth ? e.endMonth : "Active"}</td>
                  <td className="px-4 py-2">
                    {isTutor && e.endMonth === null && endingId !== e.id && (
                      <button
                        className="text-red-600 hover:underline"
                        onClick={() => {
                          setEndingId(e.id)
                          setEndMonth("")
                        }}
                      >
                        End
                      </button>
                    )}
                    {isTutor && e.endMonth !== null && (
                      <button
                        className="text-blue-600 hover:underline"
                        onClick={() => handleReopen(e.id)}
                      >
                        Reopen
                      </button>
                    )}
                    {isTutor && endingId === e.id && (
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="month"
                          className="px-2 py-1 border rounded-lg"
                          min={e.startMonth}
                          value={endMonth}
                          onChange={(ev) => setEndMonth(ev.target.value)}
                        />
                        <button
                          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                          onClick={() => handleEnd(e.id)}
                        >
                          Confirm
                        </button>
                        <button
                          className="px-3 py-1 border rounded-lg hover:bg-slate-50 transition"
                          onClick={() => setEndingId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default StudentDetail