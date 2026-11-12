import useAuth from "../hooks/useAuth"

function Home() {
  const { user } = useAuth()

  const handleLogout = () => {
    localStorage.removeItem("ACCESS_TOKEN")
    localStorage.removeItem("REFRESH_TOKEN")
    window.location.href = "/login"
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 gap-4">
      <h1 className="text-2xl font-semibold">TuteLedger</h1>
      <p>
        Logged in as {user?.name} ({user?.role})
      </p>
      <button
        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  )
}

export default Home