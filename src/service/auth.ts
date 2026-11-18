import api from "./api";

export const login = async (email: string, password:string)=> {
    const response = await api.post("/auth/login", {
        email,
        password
    })

    return response.data
}

export const getMyDetails = async () => {
    const response = await api.get("/auth/me")
    return response.data
}

export const refreshTokenCall = async(refreshToken: string) => {

    const response = await api.post("/auth/refresh", {refreshToken})
    return response.data
}



