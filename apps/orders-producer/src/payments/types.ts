export type Payment = {
  paymentId: string
  orderId: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed'
  method: 'card' | 'paypal' | 'cash' | 'wire'
  processedAt: string
  failureReason?: string
}
