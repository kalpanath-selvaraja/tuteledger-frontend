import api from "./api"

export type PaymentItem = {
  enrollmentId: string
  month: string
}


export const createPayment = async (items: PaymentItem[]) => {
  const response = await api.post("/payments", { items })
  return response.data
}

export const voidPayment = async (id: string, reason: string) => {
  const response = await api.put(`/payments/${id}/void`, { reason })
  return response.data
}

export const createWaiver = async (enrollmentId: string, months: string[], reason: string) => {
  const response = await api.post("/waivers", { enrollmentId, months, reason })
  return response.data
}