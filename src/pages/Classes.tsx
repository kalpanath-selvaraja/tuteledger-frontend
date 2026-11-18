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
import Skeleton from "../components/Skeleton"

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
  const [showInputs, setShowInputs] = useState(false);

  const loadClasses = async () => {
    try {
      const response = await getClasses()
      setClasses(response.data)
    } catch (error) {
      console.error(error)
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
    setShowInputs(false)
  }

  const handleEdit = (classItem: ClassItem) => {
    setEditingId(classItem.id)
    setName(classItem.name)
    setSubject(classItem.subject)
    setDayOfWeek(classItem.dayOfWeek)
    setStartTime(classItem.startTime)
    setFee(String(classItem.monthlyFeeLKR))
    setActive(classItem.active)
    setShowInputs(true)
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
    } catch (error) {
      console.error(error)
      if (axios.isAxiosError(error) && error.response?.data?.errors) {
        alert(error.response.data.errors.join("\n"))
      } else {
        alert("Save fail..!")
      }
    }
  }

  return (
    <div className="flex flex-col gap-6 rounded-xl bg-stone-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl tracking-tight text-emerald-950 md:text-5xl">
            Classes
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {classes.length} {classes.length === 1 ? "class" : "classes"} &middot;{" "}
            {classes.filter((classItem) => classItem.active).length} active
          </p>
        </div>

        {isTutor && (
          <button
            className="rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900"
            onClick={() => {
              resetForm()
              setShowInputs(true)
            }}
          >
            + Add class
          </button>
        )}
      </div>

      {isTutor && showInputs && (
        <div className="bg-white border border-emerald-100 rounded-lg p-4 flex flex-col gap-3">
          <h2 className="font-semibold text-emerald-950">
            {editingId ? "Edit class" : "Add a class"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              placeholder="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <input
              placeholder="subject"
              type="text"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <select
              value={dayOfWeek}
              onChange={(event) => setDayOfWeek(event.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
              onChange={(event) => setStartTime(event.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <input
              placeholder="monthly fee (LKR)"
              type="number"
              value={fee}
              onChange={(event) => setFee(event.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            {editingId && (
              <label className="flex items-center gap-2 text-slate-700">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(event) => setActive(event.target.checked)}
                />
                Active
              </label>
            )}
          </div>

          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-emerald-800 text-white rounded-lg hover:bg-emerald-900 transition"
              onClick={handleSubmit}
            >
              {editingId ? "Save changes" : "Add class"}
            </button>
            
              <button
                className="px-4 py-2 border rounded-lg text-slate-700 hover:bg-emerald-50 transition"
                onClick={resetForm}
              >
                Cancel
              </button>
            
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-[#d8e1d7] bg-white">
        <table className="w-full border-collapse text-left text-sm text-[#172c24]">
          <thead className="bg-[#edf3e9] text-xs text-[#3f5749]">
            <tr>
              <th scope="col" className="px-4 py-3">Class</th>
              <th scope="col" className="px-4 py-3">Schedule</th>
              <th scope="col" className="whitespace-nowrap px-4 py-3 text-right">Monthly fee</th>
              <th scope="col" className="px-4 py-3">Status</th>
              {isTutor && <th scope="col" aria-label="Actions" />}
            </tr>
          </thead>

          <tbody>
            {loading &&
              [1, 2, 3, 4, 5].map((n) => (
                <tr key={n}>
                  <td className="px-4 py-3" colSpan={isTutor ? 5 : 4}>
                    <Skeleton className="h-4 w-full" />
                  </td>
                </tr>
              )
            )}

            {!loading && classes.length === 0 && (
              <tr>
                <td colSpan={isTutor ? 5 : 4} className="px-4 py-3 text-slate-600">
                  No classes yet.
                </td>
              </tr>
            )}

            {classes.map((classItem) => {
              const [hour, minute] = classItem.startTime.split(":")
              const hourNumber = Number(hour)
              const time = minute?.length === 2 && hourNumber >= 0 && hourNumber < 24
                ? `${hourNumber % 12 || 12}:${minute} ${hourNumber < 12 ? "AM" : "PM"}`
                : classItem.startTime

              return (
                <tr key={classItem.id} className="border-t border-[#e3e9e0]">
                  <td className="px-4 py-2">
                    <p className="font-bold">{classItem.name}</p>
                    <p className="text-xs text-[#506259]">{classItem.subject}</p>
                  </td>

                  <td className="whitespace-nowrap px-4 py-2">
                    {classItem.dayOfWeek} &middot; {time}
                  </td>

                  <td className="whitespace-nowrap px-4 py-2 text-right tabular-nums">
                    Rs. {classItem.monthlyFeeLKR.toLocaleString()}
                  </td>

                  <td className="px-4 py-2">
                    <span className={
                      "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-semibold " +
                      (classItem.active ? "bg-[#e7f2e5] text-[#315740]" : "bg-[#f1f0eb] text-[#59574d]")
                    }>
                      <span aria-hidden="true" className="h-[5px] w-[5px] rounded-full bg-current" />
                      {classItem.active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {isTutor && (
                    <td className="px-4 py-2 text-right">
                      <button
                        type="button"
                        className="rounded-lg px-2.5 py-2 font-semibold text-[#255740] hover:bg-[#edf3e9]"
                        onClick={() => handleEdit(classItem)}
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