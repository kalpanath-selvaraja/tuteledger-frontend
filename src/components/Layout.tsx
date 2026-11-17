import type { ReactNode } from "react"
import NavBar from "./NavBar"

type LayoutTypes = {
  children: ReactNode
}

function Layout({ children }: LayoutTypes) {
  return (
    <div className="min-h-screen bg-stone-100">
      <NavBar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">{children}</main>
    </div>
  )
}

export default Layout