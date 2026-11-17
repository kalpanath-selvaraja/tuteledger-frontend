import api from "./api"

export type PaymentItem = {
  enrollmentId: string
  month: string
}


export const createPayment = async (items: PaymentItem[]) => {
  const res = await api.post("/payments", { items })
  return res.data
}

export const voidPayment = async (id: string, reason: string) => {
  const res = await api.put(`/payments/${id}/void`, { reason })
  return res.data
}

export const createWaiver = async (enrollmentId: string, months: string[], reason: string) => {
  const res = await api.post("/waivers", { enrollmentId, months, reason })
  return res.data
}