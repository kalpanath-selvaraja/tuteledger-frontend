import { createContext, useEffect, useState, type ReactNode } from "react"
import { getMyDetails } from "../service/auth"


export type User = {
  id: string
  name: string
  email: string
  role: "tutor" | "receptionist"
}

export type AuthContextTypes = {
  user: User | null
  setUser: (user: User | null) => void
  // showLoader: () => void
  // hideLoader: () => void
  // isLoading: boolean
  loading:boolean
}

export const AuthContext = createContext<AuthContextTypes | null>(null)

type AuthProviderTypes = {
  children: ReactNode
}

const AuthProvider = ({ children }: AuthProviderTypes) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  // const [isLoading, setIsLoading] = useState(true)

  // const  showLoader = () => setIsLoading(true)
  // const  hideLoader = () => setIsLoading(false)


  useEffect(() => {
    const accessToken = localStorage.getItem("ACCESS_TOKEN")
    if (accessToken) {
      // setIsLoading(true)
      setLoading(true)
      getMyDetails()
        .then((res) => {
          if (res.data) {
            setUser(res.data)
          } else {
            setUser(null)
          }
        })
        .catch((error) => {
          console.error(error)
          setUser(null)
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider value={
      { 
        user, 
        setUser, 
        loading
        // showLoader, 
        // hideLoader, 
        // isLoading 
      }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider