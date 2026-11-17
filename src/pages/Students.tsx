import { useEffect, useState } from "react"
import axios from "axios"
import useAuth from "../hooks/useAuth"

import {
  getStudents,
  createStudent,
  updateStudent,
  type Student,
  type StudentInput,
  type StudentPage
} from "../service/students"
import { Link } from "react-router-dom"

const PAGE_SIZE = 10

function Students() {
  const { user } = useAuth()
  const isTutor = user?.role === "tutor"

  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const [searchText, setSearchText] = useState("")
  const [appliedSearch, setAppliedSearch] = useState("")

  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [guardianName, setGuardianName] = useState("")
  const [phone, setPhone] = useState("")
  const [status, setStatus] = useState<"active" | "inactive">("active")

  const loadStudents = async (p: number, s: string) => {
    try {
      const res = await getStudents(s, p, PAGE_SIZE)
      const data: StudentPage = res.data
      setStudents(data.students)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch (err) {
      console.error(err)
      alert("Could not load students..!")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStudents(page, appliedSearch)
  }, [page, appliedSearch])

  const handleSearch = () => {
    setPage(1)
    setAppliedSearch(searchText.trim())
  }

  const handleClearSearch = () => {
    setSearchText("")
    setPage(1)
    setAppliedSearch("")
  }

  const resetForm = () => {
    setEditingId(null)
    setName("")
    setGuardianName("")
    setPhone("")
    setStatus("active")
  }

  const handleEdit = (s: Student) => {
    setEditingId(s.id)
    setName(s.name)
    setGuardianName(s.guardianName)
    setPhone(s.phone)
    setStatus(s.status)
  }

  const handleSubmit = async () => {
    if (!name || !guardianName || !phone) {
      return alert("Please fill all fields..!")
    }

    const input: StudentInput = {
      name: name,
      guardianName: guardianName,
      phone: phone
    }

    if (editingId && isTutor) {
      input.status = status
    }

    try {
      if (editingId) {
        await updateStudent(editingId, input)
      
      } else {
      
        await createStudent(input)
      
      }

      resetForm()

      await loadStudents(page, appliedSearch)

    } catch (err) {

      console.error(err)
      if (axios.isAxiosError(err) && err.response?.data?.errors) {
        alert(err.response.data.errors.join("\n"))
      } else if (axios.isAxiosError(err) && err.response?.data?.message) {
        alert(err.response.data.message)
      } else {
        alert("Save fail..!")
      }
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-emerald-950">Students</h1>

      <div className="bg-white border border-emerald-100 rounded-lg p-4 flex flex-col gap-3">
        <h2 className="font-semibold text-slate-900">
          {editingId ? "Edit student" : "Add a student"}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            placeholder="student name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
          <input
            placeholder="guardian name"
            type="text"
            value={guardianName}
            onChange={(e) => setGuardianName(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
          <input
            placeholder="phone, for example 0771234567"
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
          {editingId && isTutor && (
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          )}
        </div>

        <div className="flex gap-2">
          <button
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            onClick={handleSubmit}
          >
            {editingId ? "Save changes" : "Add student"}
          </button>
          {editingId && (
            <button
              className="px-4 py-2 border rounded-lg text-slate-700 hover:bg-emerald-50 transition"
              onClick={resetForm}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          placeholder="search by name"
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch()
            }
          }}
          className="w-full sm:flex-1 px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
        />
        <div className="flex gap-2">
          <button
            className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            onClick={handleSearch}
          >
            Search
          </button>
          {appliedSearch && (
            <button
              className="flex-1 sm:flex-none px-4 py-2 border rounded-lg bg-white text-slate-700 hover:bg-emerald-50 transition"
              onClick={handleClearSearch}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border border-emerald-100 rounded-lg overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-emerald-100 text-emerald-900">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Guardian</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-4 py-3 text-slate-500" colSpan={5}>
                  Loading...
                </td>
              </tr>
            )}
            {!loading && students.length === 0 && (
              <tr>
                <td className="px-4 py-3 text-slate-500" colSpan={5}>
                  No students found.
                </td>
              </tr>
            )}
            {students.map((s) => {
              return (
                <tr key={s.id} className="border-t border-emerald-50">
                  <td className="px-4 py-2 whitespace-nowrap">
                    <Link to={`/students/${s.id}`} className="text-emerald-700 hover:underline">
                      {s.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{s.guardianName}</td>
                  <td className="px-4 py-2">{s.phone}</td>
                  <td className="px-4 py-2">
                    <span
                      className={
                        "rounded-full px-2.5 py-1 text-xs font-semibold " +
                        (s.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-700")
                      }
                    >
                      {s.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      className="text-emerald-700 hover:underline"
                      onClick={() => handleEdit(s)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-700">
        <span>
          {total} students, page {page} of {Math.max(totalPages, 1)}
        </span>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 border rounded-lg hover:bg-emerald-50 transition disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <button
            className="px-3 py-1 border rounded-lg hover:bg-emerald-50 transition disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

export default Students