import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import type { ReactNode } from "react"
import Login from "../pages/Login"
import NotFound from "../pages/NotFound"
import Layout from "../components/Layout"
import Home from "../pages/Home"
import useAuth from "../hooks/useAuth"
import Classes from "../pages/Classes"

type RequireAuthTypes = {
  children: ReactNode
  roles?: string[]
}

const RequireAuth = ({ children, roles }: RequireAuthTypes) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p>You do not have permission to view this page.</p>
        </div>
      </Layout>
    )
  }

  return <Layout>{children}</Layout>
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/Login" element={<Login />} />

        <Route
          path="/"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />

        <Route
          path="/classes"
          element={
            <RequireAuth>
              <Classes />
            </RequireAuth>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter