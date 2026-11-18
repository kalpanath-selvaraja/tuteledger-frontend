import { useEffect, useState } from "react"
import useAuth from "../hooks/useAuth"
import { getClasses, type ClassItem } from "../service/classes"
import { getStudents } from "../service/students"
import PageSkeleton from "../components/PageSkeleton"

// Today's weekday in Sri Lanka time, in the same words the classes part   use ("Monday")
const getToday = () => {
  return new Date().toLocaleDateString("en-US", { weekday: "long", timeZone: "Asia/Colombo" })
}

function Home() {
  const { user } = useAuth()

  const [classes, setClasses] = useState<ClassItem[]>([])
  const [studentCount, setStudentCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [classResponse, studentResponse] = await Promise.all([getClasses(), getStudents("", 1, 1)])
        setClasses(classResponse.data)
        setStudentCount(studentResponse.data.total)
      } catch (error) {
        console.error(error)
        alert("Could not load the home page..!")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) {
    return <PageSkeleton />
  }

  const today = getToday()
  const dateText = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Colombo"
  })

  const activeClasses = classes.filter((todayClass) => todayClass.active)
  const todayClasses = activeClasses
    .filter((todayClass) => todayClass.dayOfWeek === today)
    .sort((firstClass, secondClass) => firstClass.startTime.localeCompare(secondClass.startTime))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-1 rounded-xl bg-emerald-800 px-4 py-3 text-white">
        <p className="font-semibold">Welcome, {user?.name}</p>
        <p className="text-sm text-emerald-100">{dateText}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl bg-emerald-600 text-white p-4">
          <p className="text-sm text-emerald-100">Active classes</p>
          <p className="text-3xl font-bold">{activeClasses.length}</p>
        </div>
        <div className="rounded-xl bg-sky-600 text-white p-4">
          <p className="text-sm text-sky-100">Students registered</p>
          <p className="text-3xl font-bold">{studentCount}</p>
        </div>
        <div className="rounded-xl bg-amber-500 text-white p-4">
          <p className="text-sm text-amber-50">Classes today</p>
          <p className="text-3xl font-bold">{todayClasses.length}</p>
        </div>
      </div>

      <div className="bg-white border border-emerald-100 rounded-xl overflow-hidden">
        <div className="bg-emerald-50 px-4 py-3">
          <h2 className="font-semibold text-emerald-950">Today's classes ({today})</h2>
        </div>

        {todayClasses.length === 0 && (
          <p className="px-4 py-6 text-sm text-slate-500">No classes are scheduled today.</p>
        )}

        <ul>
          {todayClasses.map((todayClass) => {
            return (
              <li
                key={todayClass.id}
                className="border-t border-emerald-50 px-4 py-3 flex flex-wrap items-center justify-between gap-2"
              >
                <div>
                  <p className="font-semibold text-slate-900">{todayClass.name}</p>
                  <p className="text-xs text-slate-600">{todayClass.subject}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-emerald-900">{todayClass.startTime}</p>
                  <p className="text-xs text-slate-600">Rs. {todayClass.monthlyFeeLKR.toLocaleString()} per month</p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

export default Home