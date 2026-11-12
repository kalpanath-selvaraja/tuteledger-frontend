import { useState } from "react"
import { login } from "../service/auth"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async () => {
    if (!email || !password) {
      return alert("Please fill all fields..!")
    }

    try {
      const res = await login(email, password)

      const resData = res.data
      const accessToken = resData.accessToken
      const refreshToken = resData.refreshToken
      if (accessToken && refreshToken) {
        localStorage.setItem("ACCESS_TOKEN", accessToken)
        localStorage.setItem("REFRESH_TOKEN", refreshToken)

        window.location.href = "/"
      }
    } catch (err) {
      console.error(err)
      alert("Login fail..!")
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="flex flex-col gap-4 w-80">
        <h1 className="text-2xl font-semibold">TuteLedger Login</h1>

        <input
          placeholder="email"
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          placeholder="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          onClick={handleLogin}
        >
          Login
        </button>
      </div>
    </div>
  )
}

export default Login