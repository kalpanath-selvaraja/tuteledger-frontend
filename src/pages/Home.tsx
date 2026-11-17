import { Link } from "react-router-dom"
import useAuth from "../hooks/useAuth"

function Home() {
  const { user } = useAuth()

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl bg-linear-to-r from-emerald-700 to-teal-500 p-6 sm:p-8 text-white">
        <h1 className="text-2xl sm:text-3xl font-bold">Welcome, {user?.name}</h1>
        <p className="mt-1 text-emerald-50 capitalize">You are signed in as {user?.role}.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/students" className="rounded-xl bg-sky-100 p-5 hover:bg-sky-200 transition">
          <p className="text-lg font-semibold text-sky-900">Students</p>
          <p className="text-sm text-sky-800">Register students, enroll them and record fee payments.</p>
        </Link>
        <Link to="/classes" className="rounded-xl bg-amber-100 p-5 hover:bg-amber-200 transition">
          <p className="text-lg font-semibold text-amber-900">Classes</p>
          <p className="text-sm text-amber-800">See the classes, their schedule and monthly fees.</p>
        </Link>
      </div>
    </div>
  )
}

export default Home