'use client'

import { useState, useEffect, useRef } from 'react'
import { useNotificationSound } from '@/lib/useNotificationSound'

interface Order {
  id: number
  orderNumber: string
  tableId: number | null // null para retirada no caixa
  customerName: string
  customerPhone: string
  paymentMethod: 'cash' | 'mpesa' | 'emola' | 'pos'
  status: 'pending_approval' | 'approved' | 'paid' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  totalAmount: number
  estimatedTime: number
  receiptId?: number
  createdAt: Date
  updatedAt: Date
}

interface OrderItem {
  id: number
  productId: number
  quantity: number
  price: number
  notes?: string
  product?: {
    id: number
    name: string
  }
}

interface PaymentReceipt {
  id: number
  receiptUrl: string
  isApproved: boolean
}

export default function OrdersSection({ storeId }: { storeId: number }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null)
  const [orderItems, setOrderItems] = useState<Record<number, OrderItem[]>>({})
  const [receipts, setReceipts] = useState<Record<number, PaymentReceipt | null>>({})
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const previousOrdersRef = useRef<number[]>([])
  const playNotificationSound = useNotificationSound('order') // Som de caixa registradora para pedidos
  
  // Estados para filtro de data
  const [dateFilter, setDateFilter] = useState<string>('all') // 'all', 'today', 'yesterday', '7days', '30days', 'custom'
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')

  const fetchOrders = async () => {
    try {
      const statusParam = selectedFilter === 'all' ? '' : `?status=${selectedFilter === 'pending' ? 'pending_approval' : selectedFilter}`
      const res = await fetch(`/api/orders${statusParam}`)
      if (res.ok) {
        const data = await res.json()
        // Converter strings de data para Date objects
        const ordersWithDates = data.map((order: any) => ({
          ...order,
          createdAt: order.createdAt ? new Date(order.createdAt) : new Date(),
          updatedAt: order.updatedAt ? new Date(order.updatedAt) : new Date(),
        }))
        setOrders(ordersWithDates)
      }
    } catch (err) {
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    // Atualizar a cada 10 segundos para o dashboard do admin (tempo real)
    const interval = setInterval(fetchOrders, 10000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilter])

  useEffect(() => {
    // Detectar novos pedidos e tocar som
    const currentOrderIds = orders.map(o => o.id)
    const newOrderIds = currentOrderIds.filter(id => !previousOrdersRef.current.includes(id))
    
    if (newOrderIds.length > 0 && previousOrdersRef.current.length > 0) {
      // Novo pedido detectado
      playNotificationSound()
    }
    
    previousOrdersRef.current = currentOrderIds
  }, [orders, playNotificationSound])

  useEffect(() => {
    // Filtrar pedidos por status e data
    let filtered = orders

    // Filtro por status
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(order => {
        if (selectedFilter === 'pending') {
          return order.status === 'pending_approval'
        } else if (selectedFilter === 'approved') {
          return order.status === 'approved'
        } else if (selectedFilter === 'preparing') {
          return order.status === 'preparing'
        } else if (selectedFilter === 'ready') {
          return order.status === 'ready'
        } else if (selectedFilter === 'delivered') {
          return order.status === 'delivered'
        }
        return false
      })
    }

    // Filtro por data
    if (dateFilter !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      let dateRange: { start: Date; end: Date } | null = null

      switch (dateFilter) {
        case 'today':
          dateRange = { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
          break
        case 'yesterday':
          const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
          dateRange = { start: yesterday, end: today }
          break
        case '7days':
          dateRange = { start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), end: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
          break
        case '30days':
          dateRange = { start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000), end: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
          break
        case 'custom':
          if (customStartDate && customEndDate) {
            const start = new Date(customStartDate)
            const end = new Date(customEndDate)
            end.setHours(23, 59, 59, 999) // Fim do dia
            dateRange = { start, end }
          }
          break
      }

      if (dateRange) {
        filtered = filtered.filter(order => {
          const orderDate = new Date(order.createdAt)
          return orderDate >= dateRange!.start && orderDate < dateRange!.end
        })
      }
    }

    setFilteredOrders(filtered)
  }, [orders, selectedFilter, dateFilter, customStartDate, customEndDate])

  const fetchOrderItems = async (orderId: number) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/items`)
      if (res.ok) {
        const data = await res.json()
        setOrderItems(prev => ({ ...prev, [orderId]: data }))
      }
    } catch (err) {
      console.error('Error fetching order items:', err)
    }
  }

  const fetchReceipt = async (orderId: number) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/receipt`)
      if (res.ok) {
        const data = await res.json()
        setReceipts(prev => ({ ...prev, [orderId]: data }))
      }
    } catch (err) {
      console.error('Error fetching receipt:', err)
    }
  }

  const handleApproveReceipt = async (orderId: number) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/approve`, {
        method: 'PUT',
      })

      if (res.ok) {
        setMessage('Comprovante aprovado!')
        fetchOrders()
        setTimeout(() => setMessage(''), 3000)
      } else {
        const data = await res.json()
        setError(data.error || 'Erro ao aprovar comprovante')
      }
    } catch (err) {
      setError('Erro ao aprovar comprovante')
    }
  }

  const handleMarkPaid = async (orderId: number) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/mark-paid`, {
        method: 'PUT',
      })

      if (res.ok) {
        setMessage('Pedido marcado como pago!')
        fetchOrders()
        setTimeout(() => setMessage(''), 3000)
      } else {
        const data = await res.json()
        setError(data.error || 'Erro ao marcar como pago')
      }
    } catch (err) {
      setError('Erro ao marcar como pago')
    }
  }

  const handleUpdateStatus = async (orderId: number, newStatus: Order['status']) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        setMessage('Status atualizado!')
        fetchOrders()
        setTimeout(() => setMessage(''), 3000)
      } else {
        const data = await res.json()
        setError(data.error || 'Erro ao atualizar status')
      }
    } catch (err) {
      setError('Erro ao atualizar status')
    }
  }

  const toggleOrderExpanded = (orderId: number, paymentMethod: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null)
    } else {
      setExpandedOrder(orderId)
      if (!orderItems[orderId]) {
        fetchOrderItems(orderId)
      }
      if (paymentMethod !== 'cash' && !receipts[orderId]) {
        fetchReceipt(orderId)
      }
    }
  }

  const getStatusBadgeColor = (status: Order['status']) => {
    switch (status) {
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-blue-100 text-blue-800'
      case 'paid':
        return 'bg-gold bg-opacity-20 text-gold'
      case 'preparing':
        return 'bg-gold bg-opacity-20 text-gold'
      case 'ready':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'pending_approval':
        return 'Aguardando Aprovação'
      case 'approved':
        return 'Aprovado'
      case 'paid':
        return 'Pago'
      case 'preparing':
        return 'Preparando'
      case 'ready':
        return 'Pronto'
      case 'delivered':
        return 'Entregue'
      case 'cancelled':
        return 'Cancelado'
      default:
        return status
    }
  }

  const getPaymentMethodLabel = (method: string) => {
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

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash':
        return 'bg-gold bg-opacity-20 text-gold'
      case 'mpesa':
        return 'bg-blue-100 text-blue-800'
      case 'emola':
        return 'bg-purple-100 text-purple-800'
      case 'pos':
        return 'bg-gold bg-opacity-20 text-gold'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    
    if (minutes < 1) return 'Agora'
    if (minutes < 60) return `${minutes} min atrás`
    if (hours < 24) return `${hours}h atrás`
    return `${Math.floor(hours / 24)}d atrás`
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-white">Carregando pedidos...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Pedidos</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              playNotificationSound()
              setMessage('Som de caixa registradora tocado!')
              setTimeout(() => setMessage(''), 2000)
            }}
            className="px-3 py-1.5 bg-gold text-black-pure rounded-lg text-xs font-semibold hover:bg-gold-bright transition"
            title="Testar som de caixa registradora (pedidos)"
          >
            💰 Testar Som
          </button>
          <div className="text-sm text-gray-600">
            {filteredOrders.length} de {orders.length} pedido(s)
          </div>
        </div>
      </div>

      {message && (
        <div className="bg-gold bg-opacity-20 border border-gold text-gold px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-dark-red bg-opacity-20 border border-dark-red text-red-300 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filtros de Status */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              selectedFilter === 'all'
                ? 'bg-gold text-black-pure'
                : 'bg-dark-gray text-white hover:bg-gold hover:text-black-pure border border-border'
            }`}
          >
            Todos
          </button>
        <button
          onClick={() => setSelectedFilter('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            selectedFilter === 'pending'
              ? 'bg-gold text-black-pure'
              : 'bg-dark-gray text-white hover:bg-gold hover:text-black-pure border border-border'
          }`}
        >
          Aguardando Aprovação
        </button>
        <button
          onClick={() => setSelectedFilter('approved')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            selectedFilter === 'approved'
              ? 'bg-gold text-black-pure'
              : 'bg-dark-gray text-white hover:bg-gold hover:text-black-pure border border-border'
          }`}
        >
          Aprovados
        </button>
        <button
          onClick={() => setSelectedFilter('preparing')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            selectedFilter === 'preparing'
              ? 'bg-gold text-black-pure'
              : 'bg-dark-gray text-white hover:bg-gold hover:text-black-pure border border-border'
          }`}
        >
          Preparando
        </button>
        <button
          onClick={() => setSelectedFilter('ready')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            selectedFilter === 'ready'
              ? 'bg-gold text-black-pure'
              : 'bg-dark-gray text-white hover:bg-gold hover:text-black-pure border border-border'
          }`}
        >
          Prontos
        </button>
        <button
          onClick={() => setSelectedFilter('delivered')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            selectedFilter === 'delivered'
              ? 'bg-gold text-black-pure'
              : 'bg-dark-gray text-white hover:bg-gold hover:text-black-pure border border-border'
          }`}
        >
          Entregues
        </button>
        </div>

        {/* Filtros de Data */}
        <div className="bg-gray-50 p-3 rounded-lg border-2 border-gray-200">
          <label className="block text-sm font-bold text-white mb-2">Filtrar por Data:</label>
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                dateFilter === 'all'
                  ? 'bg-gold text-black-pure'
                  : 'bg-dark-gray border-2 border-border text-white hover:bg-gold hover:text-black-pure'
              }`}
            >
              Todas as Datas
            </button>
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                dateFilter === 'today'
                  ? 'bg-gold text-black-pure'
                  : 'bg-dark-gray border-2 border-border text-white hover:bg-gold hover:text-black-pure'
              }`}
            >
              Hoje
            </button>
            <button
              onClick={() => setDateFilter('yesterday')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                dateFilter === 'yesterday'
                  ? 'bg-gold text-black-pure'
                  : 'bg-dark-gray border-2 border-border text-white hover:bg-gold hover:text-black-pure'
              }`}
            >
              Ontem
            </button>
            <button
              onClick={() => setDateFilter('7days')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                dateFilter === '7days'
                  ? 'bg-gold text-black-pure'
                  : 'bg-dark-gray border-2 border-border text-white hover:bg-gold hover:text-black-pure'
              }`}
            >
              Últimos 7 dias
            </button>
            <button
              onClick={() => setDateFilter('30days')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                dateFilter === '30days'
                  ? 'bg-gold text-black-pure'
                  : 'bg-dark-gray border-2 border-border text-white hover:bg-gold hover:text-black-pure'
              }`}
            >
              Últimos 30 dias
            </button>
            <button
              onClick={() => setDateFilter('custom')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                dateFilter === 'custom'
                  ? 'bg-gold text-black-pure'
                  : 'bg-dark-gray border-2 border-border text-white hover:bg-gold hover:text-black-pure'
              }`}
            >
              Personalizado
            </button>
          </div>

          {/* Seleção de intervalo personalizado */}
          {dateFilter === 'custom' && (
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-white mb-1">Data Inicial:</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-black-main border-2 border-border rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-white mb-1">Data Final:</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  min={customStartDate}
                  className="w-full px-3 py-2 bg-black-main border-2 border-border rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-dark-gray border-2 border-border rounded-lg p-4 hover:shadow-md transition"
          >
            {/* Alerta simples para POS */}
            {order.paymentMethod === 'pos' && order.tableId && (
              <div className="mb-3 bg-gold bg-opacity-20 border border-gold text-gold px-3 py-2 rounded text-sm">
                ⚠️ POS - Enviar atendente para Mesa {order.tableId}
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <h3 className="text-xl font-bold text-gold">{order.orderNumber}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getPaymentMethodColor(order.paymentMethod)}`}>
                    {getPaymentMethodLabel(order.paymentMethod)}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm text-white">
                  <div>
                    <p className="font-semibold text-gray-medium text-xs mb-1">Cliente</p>
                    <p>{order.customerName}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-medium text-xs mb-1">Telefone</p>
                    <p>{order.customerPhone}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-medium text-xs mb-1">
                      {order.tableId ? 'Mesa' : 'Tipo de Entrega'}
                    </p>
                    <p className="font-bold text-gold">
                      {order.tableId ? `#${order.tableId}` : 'Retirar no Caixa'}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-medium text-xs mb-1">Total</p>
                    <p className="font-bold text-gold">MT {order.totalAmount.toFixed(0)}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-medium text-xs mb-1">Tempo</p>
                    <p>{order.estimatedTime} min</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-medium text-xs mb-1">Há</p>
                    <p>{formatTimeAgo(order.createdAt)}</p>
                  </div>
                </div>

                {/* Botão para expandir e ver detalhes */}
                <button
                  onClick={() => toggleOrderExpanded(order.id, order.paymentMethod)}
                  className="mt-3 text-sm text-gold font-semibold hover:text-gold-bright transition"
                >
                  {expandedOrder === order.id ? 'Ocultar detalhes' : 'Ver detalhes'}
                </button>

                {/* Detalhes expandidos */}
                {expandedOrder === order.id && (
                  <div className="mt-4 pt-4 border-t-2 border-border">
                    {/* Itens do pedido */}
                    {orderItems[order.id] && (
                      <div className="mb-4">
                        <h4 className="font-bold text-white mb-2">Produtos:</h4>
                        <ul className="space-y-2">
                          {orderItems[order.id].map((item) => (
                            <li key={item.id} className="text-sm text-white bg-black-main p-2 rounded border border-border">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <span className="font-bold text-gold">x{item.quantity}</span>{' '}
                                  <span className="font-semibold">{item.product?.name || `Produto ID: ${item.productId}`}</span>
                                  {item.notes && (
                                    <p className="text-xs text-gray-medium italic mt-1 ml-4">📝 Nota: {item.notes}</p>
                                  )}
                                </div>
                                <span className="font-bold text-gold">MT {item.price.toFixed(0)}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Comprovante (se M-Pesa/Emola) */}
                    {order.paymentMethod !== 'cash' && order.paymentMethod !== 'pos' && receipts[order.id] && (
                      <div className="mb-4">
                        <h4 className="font-bold text-white mb-2">Comprovante:</h4>
                        <img
                          src={receipts[order.id]!.receiptUrl}
                          alt="Comprovante"
                          className="max-w-xs rounded-lg border-2 border-border cursor-pointer hover:opacity-80 transition"
                          onClick={() => setImagePreview(receipts[order.id]!.receiptUrl)}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Seção de Controle de Status */}
              <div className="flex flex-col gap-2 flex-shrink-0 w-full sm:w-auto sm:min-w-[200px]">
                {/* Aprovar Comprovante (se necessário) */}
                {order.status === 'pending_approval' && order.paymentMethod !== 'cash' && order.paymentMethod !== 'pos' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveReceipt(order.id)}
                      className="flex-1 bg-gold text-black-pure px-3 py-2 rounded-lg text-xs font-semibold hover:bg-gold-bright transition"
                    >
                      Aprovar
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                      className="flex-1 bg-dark-red text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-opacity-80 transition"
                    >
                      Rejeitar
                    </button>
                  </div>
                )}

                {/* Marcar como Pago (se necessário) */}
                {order.status === 'approved' && (
                  <button
                    onClick={() => handleMarkPaid(order.id)}
                    className="w-full bg-gold text-black-pure px-3 py-2 rounded-lg text-xs font-semibold hover:bg-gold-bright transition"
                  >
                    Marcar como Pago
                  </button>
                )}

                {/* Controle de Status */}
                <div className="border-2 border-border rounded-lg p-3 bg-dark-gray">
                  <label className="block text-xs font-bold text-white mb-2">
                    Status:
                  </label>
                  
                  <select
                    value={order.status}
                    onChange={(e) => handleUpdateStatus(order.id, e.target.value as Order['status'])}
                    className="w-full px-3 py-2 border-2 border-border rounded-lg text-sm font-semibold text-white bg-black-main focus:outline-none focus:ring-2 focus:ring-gold"
                  >
                    <option value="pending_approval">Aguardando Aprovação</option>
                    <option value="approved">Aprovado</option>
                    <option value="paid">Pago</option>
                    <option value="preparing">Preparando</option>
                    <option value="ready">Pronto</option>
                    <option value="delivered">Entregue</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="text-center py-12 bg-dark-gray rounded-lg border-2 border-border">
            <p className="text-white text-lg mb-2">Nenhum pedido encontrado</p>
            <p className="text-gray-medium text-sm">
              Quando houver pedidos, eles aparecerão aqui.
            </p>
          </div>
        )}
      </div>

      {/* Modal de preview da imagem */}
      {imagePreview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setImagePreview(null)}
        >
          <div className="max-w-4xl w-full">
            <img
              src={imagePreview}
              alt="Comprovante"
              className="w-full h-auto rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  )
}

