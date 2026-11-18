import axios from "axios"

export const showError = (error: unknown, defaultMessage: string) => {
  console.error(error)
  if (axios.isAxiosError(error) && error.response?.data?.errors) {
    return alert(error.response.data.errors.join("\n"))
  }
  if (axios.isAxiosError(error) && error.response?.data?.message) {
    return alert(error.response.data.message)
  }
  alert(defaultMessage)
}
