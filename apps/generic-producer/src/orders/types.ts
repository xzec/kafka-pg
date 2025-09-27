export type Order = {
  orderId: string
  customerId: string
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'fulfilled' | 'cancelled'
  paymentMethod: 'card' | 'paypal' | 'cash' | 'wire'
  items: number
  createdAt: string
}
