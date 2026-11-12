import api from "./api"

export type ClassItem = {
  id: string
  name: string
  subject: string
  dayOfWeek: string
  startTime: string
  monthlyFeeLKR: number
  active: boolean
}

export type ClassInput = {
  name: string
  subject: string
  dayOfWeek: string
  startTime: string
  monthlyFeeLKR: number
  active?: boolean
}

export const getClasses = async () => {
  const res = await api.get("/classes")
  return res.data
}

export const createClass = async (input: ClassInput) => {
  const res = await api.post("/classes", input)
  return res.data
}

export const updateClass = async (id: string, input: ClassInput) => {
  const res = await api.put(`/classes/${id}`, input)
  return res.data
}