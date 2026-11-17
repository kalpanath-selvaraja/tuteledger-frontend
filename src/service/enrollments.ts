import api from "./api"

export type Enrollment = {
  id: string
  studentId: string
  classId: string
  startMonth: string
  endMonth: string | null
}

export const getEnrollments = async (studentId: string) => {
  const res = await api.get("/enrollments", { params: { studentId } })
  return res.data
}

export const createEnrollment = async (studentId: string, classId: string) => {
  const res = await api.post("/enrollments", { studentId, classId })
  return res.data
}

export const updateEnrollment = async (id: string, endMonth: string | null) => {
  const res = await api.put(`/enrollments/${id}`, { endMonth })
  return res.data
}