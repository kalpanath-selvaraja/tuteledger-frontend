import { useState } from "react"
import { showError } from "../utils/showError"
import { createUser } from "../service/users"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Staff() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // true while the request is running, so the button cannot be pressed twice
  const [saving, setSaving] = useState(false)

  const resetForm = () => {
    setName("")
    setEmail("")
    setPassword("")
  }

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !password) {
      return alert("Please fill all fields..!")
    }

    if (!EMAIL_PATTERN.test(email.trim())) {
        return alert("Enter a valid email address..!")
    }

    setSaving(true)

    try {
      await createUser({ name: name.trim(), email: email.trim(), password: password })

      alert("Receptionist account created for " + email.trim().toLowerCase() + ".")

      resetForm()

    } catch (err) {

      // 400 sends a list of messages, 409 (email taken) sends one message

      showError(err, "Could not create the account..!")
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
          Create a receptionist account. Only the tutor can open this page.
        </p>
      </div>

      <div className="bg-white border border-emerald-100 rounded-lg p-4 flex flex-col gap-3 max-w-xl">
        <h2 className="font-semibold text-emerald-950">New receptionist</h2>

        <input
          placeholder="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
        />
        <input
          placeholder="email"
          type="email"
          autoComplete="off"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
        />
        <input
          placeholder="password (at least 8 characters)"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
        />

        <p className="text-xs text-slate-500">
          Give the receptionist this password yourself. It is stored only as a hash and cannot be shown again.
        </p>

        <div className="flex gap-2">
          <button
            className="px-4 py-2 bg-emerald-800 text-white rounded-lg hover:bg-emerald-900 transition disabled:opacity-60"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Saving..." : "Create receptionist"}
          </button>
          <button
            className="px-4 py-2 border rounded-lg text-slate-700 hover:bg-emerald-50 transition"
            onClick={resetForm}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}

export default Staff