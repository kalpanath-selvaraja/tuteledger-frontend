import { useEffect, useRef, useState } from "react"
import { showError } from "../utils/showError"
import useAuth from "../hooks/useAuth"
import Skeleton from "../components/Skeleton"
import { createUser, getUsers, updateUser, type StaffUser, type UserRole } from "../service/users"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Staff() {
  const { user, setUser } = useAuth()
  const nameInput = useRef<HTMLInputElement>(null)
  const [staffList, setStaffList] = useState<StaffUser[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [reloadCount, setReloadCount] = useState(0)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>("receptionist")

  // true while the request is running, so the button cannot be pressed twice
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    getUsers()
      .then((response) => {
        if (!cancelled) {
          setStaffList(response.data)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError("Could not load the staff. Please try again.")
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [reloadCount])

  const resetForm = () => {
    setEditingId(null)
    setName("")
    setEmail("")
    setPassword("")
    setRole("receptionist")
  }

  const handleEdit = (staffMember: StaffUser) => {
    setEditingId(staffMember.id)
    setName(staffMember.name)
    setEmail(staffMember.email)
    setPassword("")
    setRole(staffMember.role)
    nameInput.current?.focus()
  }

  const handleRetry = () => {
    setLoading(true)
    setLoadError("")
    setReloadCount(reloadCount + 1)
  }

  const handleSubmit = async () => {
    if (saving || loading) return
    if (!name.trim() || !email.trim() || (!editingId && !password)) {
      return alert("Please fill all required fields..!")
    }

    if (!EMAIL_PATTERN.test(email.trim())) {
      return alert("Enter a valid email address..!")
    }

    if (password && password.length < 8) {
      return alert("Password must be at least 8 characters..!")
    }

    setSaving(true)

    try {
      let savedUser: StaffUser

      if (editingId) {
        const response = await updateUser(editingId, {
          name: name.trim(),
          email: email.trim(),
          password: password
        })
        savedUser = response.data

        setStaffList((currentStaff) => currentStaff.map((staffMember) => {
          if (staffMember.id === savedUser.id) {
            return savedUser
          }
          return staffMember
        }))
      } else {
        const response = await createUser({
          name: name.trim(),
          email: email.trim(),
          password: password,
          role: role
        })
        savedUser = response.data
        setStaffList((currentStaff) => [savedUser, ...currentStaff])
      }

      if (user?.id === savedUser.id) {
        setUser({
          id: savedUser.id,
          name: savedUser.name,
          email: savedUser.email,
          role: savedUser.role
        })
      }

      alert(editingId ? "Staff account updated." : "Staff account created for " + savedUser.email + ".")
      resetForm()
    } catch (error) {
      // 400 sends a list of messages, 409 (email taken) sends one message
      showError(error, "Could not save the account..!")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 rounded-xl bg-stone-50 p-4">
      <div>
        <h1 className="font-serif text-4xl tracking-tight text-emerald-950 md:text-5xl">
          Staff
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Create tutor and receptionist accounts, or update their name, email and password.
        </p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          void handleSubmit()
        }}
        className="bg-white border border-emerald-100 rounded-lg p-4 max-w-xl"
      >
        <fieldset disabled={saving} className="flex min-w-0 flex-col gap-3">
          <legend className="font-semibold text-emerald-950 mb-3">
            {editingId ? "Edit staff account" : "New staff account"}
          </legend>

          <label htmlFor="staff-name" className="text-sm font-medium text-slate-700">
            Name
          </label>
          <input
            ref={nameInput}
            id="staff-name"
            required
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />

          <label htmlFor="staff-email" className="text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="staff-email"
            required
            type="email"
            autoComplete="off"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />

          <label htmlFor="staff-role" className="text-sm font-medium text-slate-700">
            Role
          </label>
          <select
            id="staff-role"
            value={role}
            disabled={!!editingId}
            onChange={(event) => setRole(event.target.value as UserRole)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="receptionist">Receptionist</option>
            <option value="tutor">Tutor</option>
          </select>

          <label htmlFor="staff-password" className="text-sm font-medium text-slate-700">
            {editingId ? "New password" : "Password"}
          </label>
          <input
            id="staff-password"
            required={!editingId}
            minLength={8}
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-describedby="staff-password-help"
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
          <p id="staff-password-help" className="text-xs text-slate-500">
            {editingId
              ? "Leave the password blank to keep the current password."
              : "Use at least 8 characters and give the staff member their password. Existing passwords cannot be shown."}
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving || loading}
              className="px-4 py-2 bg-emerald-800 text-white rounded-lg hover:bg-emerald-900 transition disabled:opacity-60"
            >
              {saving ? "Saving..." : editingId ? "Save changes" : "Create account"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border rounded-lg text-slate-700 hover:bg-emerald-50 transition"
            >
              {editingId ? "Cancel editing" : "Clear"}
            </button>
          </div>
        </fieldset>
      </form>

      <div className="bg-white border border-emerald-100 rounded-lg p-4">
        <h2 className="font-semibold text-emerald-950 mb-3">
          Staff accounts
        </h2>
        {loadError ? (
          <div role="alert" className="text-sm text-red-700">
            <p>{loadError}</p>
            <button
              type="button"
              onClick={handleRetry}
              disabled={saving}
              className="mt-3 px-4 py-2 border rounded-lg text-slate-700"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-emerald-50 text-emerald-950">
                <tr>
                  <th scope="col" className="px-4 py-3">Name</th>
                  <th scope="col" className="px-4 py-3">Email</th>
                  <th scope="col" className="px-4 py-3">Role</th>
                  <th scope="col" className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody aria-busy={loading}>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-4">
                      <span role="status" className="sr-only">Loading staff accounts</span>
                      <div aria-hidden="true" className="space-y-3">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </td>
                  </tr>
                ) : staffList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-slate-500">
                      No staff accounts found.
                    </td>
                  </tr>
                ) : staffList.map((staffMember) => (
                  <tr key={staffMember.id} className="border-t border-emerald-100">
                    <td className="px-4 py-3">
                      {staffMember.name}
                      {staffMember.id === user?.id && (
                        <span className="ml-2 text-xs text-slate-500">You</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{staffMember.email}</td>
                    <td className="px-4 py-3">
                      {staffMember.role === "tutor" ? "Tutor" : "Receptionist"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(staffMember)}
                        disabled={saving}
                        aria-label={"Edit " + staffMember.name}
                        className="px-3 py-2 border rounded-lg text-emerald-900 hover:bg-emerald-50 disabled:opacity-60"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Staff
