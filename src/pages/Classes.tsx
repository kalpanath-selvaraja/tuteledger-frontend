import { useEffect, useState } from "react"
import axios from "axios"
import useAuth from "../hooks/useAuth"
import {
  getClasses,
  createClass,
  updateClass,
  type ClassInput,
  type ClassItem
} from "../service/classes"

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
]

function Classes() {
  const { user } = useAuth()
  const isTutor = user?.role === "tutor"

  const [classes, setClasses] = useState<ClassItem[]>([])
  const [loading, setLoading] = useState(true)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [subject, setSubject] = useState("")
  const [dayOfWeek, setDayOfWeek] = useState("Monday")
  const [startTime, setStartTime] = useState("")
  const [fee, setFee] = useState("")
  const [active, setActive] = useState(true)

  const loadClasses = async () => {
    try {
      const res = await getClasses()
      setClasses(res.data)
    } catch (err) {
      console.error(err)
      alert("Could not load classes..!")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClasses()
  }, [])

  const resetForm = () => {
    setEditingId(null)
    setName("")
    setSubject("")
    setDayOfWeek("Monday")
    setStartTime("")
    setFee("")
    setActive(true)
  }

  const handleEdit = (c: ClassItem) => {
    setEditingId(c.id)
    setName(c.name)
    setSubject(c.subject)
    setDayOfWeek(c.dayOfWeek)
    setStartTime(c.startTime)
    setFee(String(c.monthlyFeeLKR))
    setActive(c.active)
  }

  const handleSubmit = async () => {
    if (!name || !subject || !startTime || !fee) {
      return alert("Please fill all fields..!")
    }

    const input: ClassInput = {
      name: name,
      subject: subject,
      dayOfWeek: dayOfWeek,
      startTime: startTime,
      monthlyFeeLKR: Number(fee)
    }

    try {
      if (editingId) {
        await updateClass(editingId, { ...input, active: active })
      } else {
        await createClass(input)
      }
      resetForm()
      await loadClasses()
    } catch (err) {
      console.error(err)
      if (axios.isAxiosError(err) && err.response?.data?.errors) {
        alert(err.response.data.errors.join("\n"))
      } else {
        alert("Save fail..!")
      }
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-slate-900">Classes</h1>

      {isTutor && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col gap-3">
          <h2 className="font-semibold text-slate-900">
            {editingId ? "Edit class" : "Add a class"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              placeholder="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              placeholder="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {DAYS.map((day) => {
                return (
                  <option key={day} value={day}>
                    {day}
                  </option>
                )
              })}
            </select>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              placeholder="monthly fee (LKR)"
              type="number"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {editingId && (
              <label className="flex items-center gap-2 text-slate-700">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                />
                Active
              </label>
            )}
          </div>

          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              onClick={handleSubmit}
            >
              {editingId ? "Save changes" : "Add class"}
            </button>
            {editingId && (
              <button
                className="px-4 py-2 border rounded-lg text-slate-700 hover:bg-slate-50 transition"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Subject</th>
              <th className="px-4 py-2">Day</th>
              <th className="px-4 py-2">Time</th>
              <th className="px-4 py-2">Fee (LKR)</th>
              <th className="px-4 py-2">Status</th>
              {isTutor && <th className="px-4 py-2"></th>}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-4 py-3 text-slate-500" colSpan={7}>
                  Loading...
                </td>
              </tr>
            )}
            {!loading && classes.length === 0 && (
              <tr>
                <td className="px-4 py-3 text-slate-500" colSpan={7}>
                  No classes yet.
                </td>
              </tr>
            )}
            {classes.map((c) => {
              return (
                <tr key={c.id} className="border-t border-slate-100">
                  <td className="px-4 py-2">{c.name}</td>
                  <td className="px-4 py-2">{c.subject}</td>
                  <td className="px-4 py-2">{c.dayOfWeek}</td>
                  <td className="px-4 py-2">{c.startTime}</td>
                  <td className="px-4 py-2">{c.monthlyFeeLKR.toLocaleString()}</td>
                  <td className="px-4 py-2">
                    {c.active ? "Active" : "Inactive"}
                  </td>
                  {isTutor && (
                    <td className="px-4 py-2">
                      <button
                        className="text-blue-600 hover:underline"
                        onClick={() => handleEdit(c)}
                      >
                        Edit
                      </button>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Classes