import api from "./api"

export type UserInput = {
  name: string
  email: string
  password: string
}

export const createUser = async (input: UserInput) => {
  const res = await api.post("/users", input)
  return res.data
}