import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios"
import { refreshTokenCall } from "../service/auth"

type RetryConfig = InternalAxiosRequestConfig & { _isRefresh?: boolean }

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

const PUBLIC_ENDPOINTS = ["/auth/login", "/auth/refresh"]

api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("ACCESS_TOKEN")

  const isPublic = PUBLIC_ENDPOINTS.some((url) => config.url?.includes(url))
  if (!isPublic && accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig | undefined
    if (!originalRequest) {
      return Promise.reject(error)
    }

    const isPublic = PUBLIC_ENDPOINTS.some((url) => {
      return originalRequest.url?.includes(url)
    })

    if (
      error.response?.status === 401 &&
      !originalRequest._isRefresh &&
      !isPublic
    ) {
      originalRequest._isRefresh = true
      try {
        const refreshToken = localStorage.getItem("REFRESH_TOKEN") as string
        if (!refreshToken) {
          throw new Error("No refresh token available")
        }

        const refreshResponse = await refreshTokenCall(refreshToken)
        const newAccessToken = refreshResponse.data.accessToken

        localStorage.setItem("ACCESS_TOKEN", newAccessToken)
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

        return axios(originalRequest)
      } catch (err) {
        console.error(err)
        localStorage.removeItem("ACCESS_TOKEN")
        localStorage.removeItem("REFRESH_TOKEN")
        window.location.href = "/login"
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  }
)

export default api