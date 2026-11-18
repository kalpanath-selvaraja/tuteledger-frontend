import api from "./api"

export type UserRole = "tutor" | "receptionist"

export type StaffUser = {
  id: string
  name: string
  email: string
  role: UserRole
  active: boolean
}

export type UserInput = {
  name: string
  email: string
  password: string
  role: UserRole
}

export type UserUpdateInput = {
  name: string
  email: string
  password?: string
}

export const getUsers = async () => {
  const response = await api.get("/users")
  return response.data
}

export const createUser = async (input: UserInput) => {
  const response = await api.post("/users", input)
  return response.data
}

export const updateUser = async (userId: string, input: UserUpdateInput) => {
  const response = await api.put(`/users/${userId}`, input)
  return response.data
}
