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
   const response = await api.get("/students", {params: {search, page, limit}})

   return response.data
}

export const createStudent = async (input: StudentInput) => {
  const response = await api.post("/students", input)
  return response.data
}

export const updateStudent = async (id: string, input: StudentInput) => {
  const response = await api.put(`/students/${id}`, input)
  return response.data
}

export const getStudentById = async (id: string) => {
  const response = await api.get(`/students/${id}`)
  return response.data
}