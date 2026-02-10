// Funções de análise e cálculos para relatórios financeiros

export interface OrderData {
  id: number
  orderNumber: string
  totalAmount: number
  paymentMethod: 'cash' | 'mpesa' | 'emola' | 'pos'
  status: 'pending_approval' | 'approved' | 'paid' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  customerName: string
  customerPhone: string
  createdAt: string
  items?: Array<{
    productId: number
    productName?: string
    quantity: number
    price: number
  }>
}

export interface RevenueDataPoint {
  date: string
  revenue: number
  orders: number
}

export interface PaymentMethodData {
  method: string
  amount: number
  count: number
  percentage: number
}

export interface ProductSalesData {
  productId: number
  productName: string
  quantity: number
  revenue: number
}

/**
 * Calcula receita agrupada por dia
 */
export function calculateRevenueByDay(orders: OrderData[]): RevenueDataPoint[] {
  const revenueMap = new Map<string, { revenue: number; orders: number }>()

  orders
    .filter(o => ['paid', 'preparing', 'ready', 'delivered'].includes(o.status))
    .forEach(order => {
      const date = new Date(order.createdAt).toISOString().split('T')[0]
      const existing = revenueMap.get(date) || { revenue: 0, orders: 0 }
      revenueMap.set(date, {
        revenue: existing.revenue + order.totalAmount,
        orders: existing.orders + 1,
      })
    })

  return Array.from(revenueMap.entries())
    .map(([date, data]) => ({
      date,
      revenue: data.revenue,
      orders: data.orders,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Calcula distribuição por método de pagamento
 */
export function calculatePaymentMethodDistribution(
  orders: OrderData[]
): PaymentMethodData[] {
  const methodMap = new Map<string, { amount: number; count: number }>()

  orders
    .filter(o => ['paid', 'preparing', 'ready', 'delivered'].includes(o.status))
    .forEach(order => {
      const existing = methodMap.get(order.paymentMethod) || { amount: 0, count: 0 }
      methodMap.set(order.paymentMethod, {
        amount: existing.amount + order.totalAmount,
        count: existing.count + 1,
      })
    })

  const total = Array.from(methodMap.values()).reduce((sum, m) => sum + m.amount, 0)

  return Array.from(methodMap.entries())
    .map(([method, data]) => ({
      method: formatPaymentMethod(method),
      amount: data.amount,
      count: data.count,
      percentage: total > 0 ? (data.amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
}

/**
 * Calcula produtos mais vendidos
 */
export async function calculateTopProducts(
  orders: OrderData[],
  fetchOrderItems: (orderId: number) => Promise<Array<{
    productId: number
    productName?: string
    quantity: number
    price: number
  }>>
): Promise<ProductSalesData[]> {
  const productMap = new Map<number, { name: string; quantity: number; revenue: number }>()

  const paidOrders = orders.filter(o =>
    ['paid', 'preparing', 'ready', 'delivered'].includes(o.status)
  )

  for (const order of paidOrders) {
    let items = order.items
    if (!items) {
      try {
        items = await fetchOrderItems(order.id)
      } catch (err) {
        console.error(`Erro ao buscar itens do pedido ${order.id}:`, err)
        continue
      }
    }

    items.forEach(item => {
      const existing = productMap.get(item.productId) || {
        name: item.productName || `Produto ${item.productId}`,
        quantity: 0,
        revenue: 0,
      }
      productMap.set(item.productId, {
        name: existing.name,
        quantity: existing.quantity + item.quantity,
        revenue: existing.revenue + item.price * item.quantity,
      })
    })
  }

  return Array.from(productMap.entries())
    .map(([productId, p]) => ({
      productId,
      productName: p.name,
      quantity: p.quantity,
      revenue: p.revenue,
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10) // Top 10
}

/**
 * Calcula ticket médio
 */
export function calculateAverageTicket(orders: OrderData[]): number {
  const paidOrders = orders.filter(o =>
    ['paid', 'preparing', 'ready', 'delivered'].includes(o.status)
  )
  if (paidOrders.length === 0) return 0
  const total = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0)
  return total / paidOrders.length
}

/**
 * Calcula pedidos por dia (média)
 */
export function calculateOrdersPerDay(orders: OrderData[]): number {
  if (orders.length === 0) return 0

  const dates = new Set<string>()
  orders.forEach(o => {
    const date = new Date(o.createdAt).toISOString().split('T')[0]
    dates.add(date)
  })

  if (dates.size === 0) return 0
  return orders.length / dates.size
}

/**
 * Calcula taxa de conversão (aprovados vs cancelados)
 */
export function calculateConversionRate(orders: OrderData[]): number {
  const approved = orders.filter(o =>
    ['approved', 'paid', 'preparing', 'ready', 'delivered'].includes(o.status)
  ).length
  const cancelled = orders.filter(o => o.status === 'cancelled').length
  const total = approved + cancelled
  if (total === 0) return 0
  return (approved / total) * 100
}

/**
 * Formata método de pagamento para exibição
 */
function formatPaymentMethod(method: string): string {
  switch (method) {
    case 'cash':
      return 'Dinheiro'
    case 'mpesa':
      return 'M-Pesa'
    case 'emola':
      return 'Emola'
    case 'pos':
      return 'POS'
    default:
      return method
  }
}

/**
 * Calcula taxa de aprovação de comprovantes
 */
export function calculateApprovalRate(orders: OrderData[]): number {
  const pendingApproval = orders.filter(o => o.status === 'pending_approval').length
  const approved = orders.filter(o => 
    ['approved', 'paid', 'preparing', 'ready', 'delivered'].includes(o.status) &&
    (o.paymentMethod === 'mpesa' || o.paymentMethod === 'emola')
  ).length
  const total = pendingApproval + approved
  if (total === 0) return 100 // Se não há pedidos com comprovante, considerar 100%
  return (approved / total) * 100
}

/**
 * Calcula tempo médio de preparo (usa tempo estimado como base)
 */
export function calculateAveragePreparationTime(orders: OrderData[]): number {
  // Como não temos tempo real de preparo, vamos usar uma estimativa baseada no status
  // Pedidos entregues assumem que foram preparados no tempo estimado
  const deliveredOrders = orders.filter(o => o.status === 'delivered')
  if (deliveredOrders.length === 0) return 0
  
  // Assumir que cada pedido tem um tempo estimado médio de 15 minutos
  // Em uma implementação real, isso viria do banco de dados
  return 15 // minutos
}

/**
 * Calcula número de clientes únicos
 */
export function calculateUniqueCustomers(orders: OrderData[]): number {
  const uniquePhones = new Set<string>()
  orders.forEach(o => {
    if (o.customerPhone) {
      uniquePhones.add(o.customerPhone)
    }
  })
  return uniquePhones.size
}

/**
 * Agrupa receita por período (dia, semana, mês)
 */
export function groupRevenueByPeriod(
  orders: OrderData[],
  period: 'day' | 'week' | 'month'
): RevenueDataPoint[] {
  const revenueMap = new Map<string, { revenue: number; orders: number }>()

  orders
    .filter(o => ['paid', 'preparing', 'ready', 'delivered'].includes(o.status))
    .forEach(order => {
      const date = new Date(order.createdAt)
      let key: string

      if (period === 'day') {
        key = date.toISOString().split('T')[0]
      } else if (period === 'week') {
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = weekStart.toISOString().split('T')[0]
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      }

      const existing = revenueMap.get(key) || { revenue: 0, orders: 0 }
      revenueMap.set(key, {
        revenue: existing.revenue + order.totalAmount,
        orders: existing.orders + 1,
      })
    })

  return Array.from(revenueMap.entries())
    .map(([date, data]) => ({
      date,
      revenue: data.revenue,
      orders: data.orders,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

