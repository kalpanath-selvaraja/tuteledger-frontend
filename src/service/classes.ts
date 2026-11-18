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
  const response = await api.get("/classes")
  return response.data
}

export const createClass = async (input: ClassInput) => {
  const response = await api.post("/classes", input)
  return response.data
}

export const updateClass = async (id: string, input: ClassInput) => {
  const response = await api.put(`/classes/${id}`, input)
  return response.data
}