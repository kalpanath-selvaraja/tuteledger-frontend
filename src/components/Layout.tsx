import type { ReactNode } from "react"
import NavBar from "./NavBar"

type LayoutTypes = {
  children: ReactNode
}

function Layout({ children }: LayoutTypes) {
  return (
    <div className="min-h-screen bg-slate-100">
      <NavBar />
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}

export default Layout