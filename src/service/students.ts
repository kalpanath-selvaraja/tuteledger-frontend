import api from "./api"

export type Student = {
    id: string
    name: string
    guardianName: string
    phone: string
    status: "active" | "inactive"
}

export type StudentInput= {
    name: string
    guardianName: string
    phone: string
    status? : "active" | "inactive"
}

export type StudentPage ={ 
    students : Student[]
    page: number
    limit: number
    total: number
    totalPages: number
}

export const getStudents = async (search: string, page: number, limit: number) => {
   const res = await api.get("/students", {params: {search, page, limit}})

   return res.data
}

export const createStudent = async (input: StudentInput) => {
  const res = await api.post("/students", input)
  return res.data
}

export const updateStudent = async (id: string, input: StudentInput) => {
  const res = await api.put(`/students/${id}`, input)
  return res.data
}