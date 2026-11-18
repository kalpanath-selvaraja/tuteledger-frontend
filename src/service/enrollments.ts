import api from "./api"

export type Enrollment = {
  id: string
  studentId: string
  classId: string
  startMonth: string
  endMonth: string | null
}

export const getEnrollments = async (studentId: string) => {
  const response = await api.get("/enrollments", { params: { studentId } })
  return response.data
}

export const createEnrollment = async (studentId: string, classId: string) => {
  const response = await api.post("/enrollments", { studentId, classId })
  return response.data
}

export const updateEnrollment = async (id: string, endMonth: string | null) => {
  const response = await api.put(`/enrollments/${id}`, { endMonth })
  return response.data
}