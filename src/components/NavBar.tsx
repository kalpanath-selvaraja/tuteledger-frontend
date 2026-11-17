import { useState } from "react"
import { NavLink } from "react-router-dom"
import useAuth from "../hooks/useAuth"

function NavBar() {
  const { user } = useAuth()

  // On a phone the links hide behind a menu button. "open" says if the menu is showing.
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem("ACCESS_TOKEN")
    localStorage.removeItem("REFRESH_TOKEN")
    window.location.href = "/login"
  }

  // NavLink tells us if this link is the current page, so we can highlight it
  const linkClass = ({ isActive }: { isActive: boolean }) => {
    return (
      "px-3 py-2 rounded-lg text-sm font-medium transition " +
      (isActive ? "bg-white text-emerald-900" : "text-emerald-50 hover:bg-emerald-700")
    )
  }

  return (
    <nav className="bg-emerald-900 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-6">
          <NavLink to="/" className="flex items-center gap-2 text-lg font-bold text-white">
            <img src="/tutor-ledger-logo.png" alt="" className="h-8 w-8 rounded" />
            TuteLedger
          </NavLink>

          {/* desktop links */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/classes" className={linkClass}>
              Classes
            </NavLink>
            <NavLink to="/students" className={linkClass}>
              Students
            </NavLink>
          </div>
        </div>

        {/* desktop user box */}
        <div className="hidden md:flex items-center gap-3 text-sm text-emerald-50">
          <span>
            {user?.name} <span className="rounded-full bg-emerald-700 px-2 py-0.5 text-xs capitalize">{user?.role}</span>
          </span>
          <button
            className="px-3 py-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        {/* phone menu button */}
        <button
          className="md:hidden px-3 py-2 rounded-lg bg-emerald-800 text-white"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {/* phone menu panel */}
      {open && (
        <div className="md:hidden border-t border-emerald-800 px-3 pb-3 pt-2 flex flex-col gap-1">
          <NavLink to="/classes" className={linkClass} onClick={() => setOpen(false)}>
            Classes
          </NavLink>
          <NavLink to="/students" className={linkClass} onClick={() => setOpen(false)}>
            Students
          </NavLink>
          <p className="px-3 pt-2 text-sm text-emerald-100 capitalize">
            {user?.name} ({user?.role})
          </p>
          <button
            className="mt-1 px-3 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  )
}

export default NavBar