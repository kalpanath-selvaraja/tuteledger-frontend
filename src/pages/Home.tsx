import useAuth from "../hooks/useAuth"

function Home() {
  const { user } = useAuth()

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6">
      <h1 className="text-xl font-semibold text-slate-900">
        Welcome, {user?.name}
      </h1>
      <p className="text-slate-600 mt-1">You are signed in as {user?.role}.</p>
    </div>
  )
}

export default Home