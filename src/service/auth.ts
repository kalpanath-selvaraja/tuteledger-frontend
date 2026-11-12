import api from "./api";

export const login = async (email: string, password:string)=> {
    const responce = await api.post("/auth/login", {
        email,
        password
    })

    return responce.data
}

export const getMyDetails = async () => {
    const responce = await api.get("/auth/me")
    return responce.data
}

export const refreshTokenCall = async(refreshToken: string) => {

    const responce = await api.post("/auth/refresh", {refreshToken})
    return responce.data
}



