import { useState ,  } from "react"
import { login } from "../service/auth"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async () => {
    // event.preventDefault()
    if (!email || !password) {
      return alert("Please fill all fields..!")
    }

    try {
      const response = await login(email, password)

      const loginData = response.data
      const accessToken = loginData.accessToken
      const refreshToken = loginData.refreshToken
      if (accessToken && refreshToken) {
        localStorage.setItem("ACCESS_TOKEN", accessToken)
        localStorage.setItem("REFRESH_TOKEN", refreshToken)

        window.location.href = "/"
      }
    } catch (error) {
      console.error(error)
      alert("Login fail..!")
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full">
      {/* left side login */}
      <div className="flex flex-col items-center  w-full md:w-1/2 min-h-screen bg-stone-50 p-8">
        <div className="flex items-center gap-3 self-start">
          
          <img src="/tutor-ledger-logo.png" alt="" className="h-10 w-10" />

          <span className="text-[21px] font-bold">Tutor Ledger</span>
        </div>
        
        <div className="my-auto flex w-full max-w-[380px] flex-col gap-4 py-10">
          <h1 className="text-[47px] md:text-[58px] font-bold tracking-tighter">
            Sign in
          </h1>

          <input id="email"
            placeholder="email"
            type="text"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="px-4 py-2 h-[54px] border rounded-[10px] focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
          <input
            placeholder="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="px-4 py-2 h-[54px] border rounded-[10px] focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />

          <button
            className="px-4 py-2 bg-emerald-800 text-white rounded-lg hover:bg-emerald-900 transition"
            onClick={handleLogin}
          >
            Login
          </button>
        </div>
      </div>

      {/* Right Side */}
      <div className="hidden md:flex flex-col items-center justify-center w-1/2 min-h-screen bg-emerald-950 text-white p-8">
        <h2 className="text-3xl font-bold">Welcome to TuteLedger</h2>

        <img src="/tutor-lesson.png"  alt="A tutor helping a student with a workbook" className="mt-6 w-full max-w-lg rounded-lg" />
      </div>
    </div>
  );
}

export default Login