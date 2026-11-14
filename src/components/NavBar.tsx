import { Link } from "react-router-dom"
import useAuth from "../hooks/useAuth"

function NavBar() {
  const { user } = useAuth()

  const handleLogout = () => {
    localStorage.removeItem("ACCESS_TOKEN")
    localStorage.removeItem("REFRESH_TOKEN")
    window.location.href = "/login"
  }

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          
          <Link to="/" className="text-lg font-semibold text-slate-900">
            TuteLedger
          </Link>

          <Link to="/classes" className="text-slate-700 hover:text-blue-600">
            Classes
          </Link>

          <Link to="/students" className="text-slate-700 hover:text-blue-600">
            Students
          </Link>
        </div>

        <div className="flex items-center gap-3 text-sm text-slate-700">
          <span>
            {user?.name} ({user?.role})
          </span>
          <button
            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default NavBar