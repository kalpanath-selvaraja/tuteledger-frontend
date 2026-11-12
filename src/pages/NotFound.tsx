import { Link } from "react-router-dom"

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 gap-2">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <Link to="/" className="text-blue-600 hover:underline">
        Go to home
      </Link>
    </div>
  )
}

export default NotFound