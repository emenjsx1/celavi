'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import StarRating from '@/components/StarRating'

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

export default function OrderHistoryPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const phoneFromQuery = searchParams.get('phone')
  
  const [phone, setPhone] = useState(phoneFromQuery || '')
  const [orders, setOrders] = useState<Order[]>([])
  const [orderItems, setOrderItems] = useState<Record<number, OrderItem[]>>({})
  const [loading, setLoading] = useState(false)
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null)
  const [reviewingOrder, setReviewingOrder] = useState<number | null>(null)
  const [review, setReview] = useState({ rating: 0, comment: '' })

  useEffect(() => {
    if (phone) {
      fetchOrders()
      // Atualizar a cada 30 segundos (reduzido de 5 segundos)
      const interval = setInterval(fetchOrders, 30000)
      return () => clearInterval(interval)
    }
  }, [phone])

  const fetchOrders = async () => {
    if (!phone) return
    
    setLoading(true)
    try {
      const res = await fetch(`/api/orders/by-phone?phone=${encodeURIComponent(phone)}`)
      if (res.ok) {
        const data = await res.json()
        const ordersWithDates = data.map((order: any) => ({
          ...order,
          createdAt: order.createdAt ? new Date(order.createdAt) : new Date(),
          updatedAt: order.updatedAt ? new Date(order.updatedAt) : new Date(),
        }))
        setOrders(ordersWithDates)
      } else {
        const errorData = await res.json().catch(() => ({}))
        console.error('Error fetching orders:', errorData)
      }
    } catch (err) {
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrderItems = async (orderId: number) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/items`)
      if (res.ok) {
        const data = await res.json()
        // Buscar nomes dos produtos
        const itemsWithProducts = await Promise.all(
          data.map(async (item: OrderItem) => {
            try {
              const productRes = await fetch(`/api/products/${item.productId}`)
              if (productRes.ok) {
                const product = await productRes.json()
                return { ...item, product }
              }
            } catch (err) {
              console.error('Error fetching product:', err)
            }
            return item
          })
        )
        setOrderItems(prev => ({ ...prev, [orderId]: itemsWithProducts }))
      }
    } catch (err) {
      console.error('Error fetching order items:', err)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.trim()) {
      fetchOrders()
      router.push(`/loja/${slug}/pedidos?phone=${encodeURIComponent(phone)}`)
    }
  }

  const handleSubmitReview = async (orderId: number) => {
    if (review.rating === 0) {
      alert('Por favor, selecione uma avaliação')
      return
    }

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          userName: orders.find(o => o.id === orderId)?.customerName || 'Cliente',
          rating: review.rating,
          comment: review.comment || '',
        }),
      })

      if (res.ok) {
        setReviewingOrder(null)
        setReview({ rating: 0, comment: '' })
        alert('Avaliação enviada com sucesso!')
      } else {
        const error = await res.json()
        alert(error.error || 'Erro ao enviar avaliação')
      }
    } catch (err) {
      console.error('Error submitting review:', err)
      alert('Erro ao enviar avaliação')
    }
  }

  const getStatusBadgeColor = (status: Order['status']) => {
    switch (status) {
      case 'pending_approval':
        return 'bg-gold bg-opacity-20 text-gold border border-gold'
      case 'approved':
        return 'bg-gold bg-opacity-20 text-gold border border-gold'
      case 'paid':
        return 'bg-gold bg-opacity-20 text-gold border border-gold'
      case 'preparing':
        return 'bg-gold bg-opacity-20 text-gold border border-gold'
      case 'ready':
        return 'bg-gold bg-opacity-20 text-gold border border-gold'
      case 'delivered':
        return 'bg-dark-gray text-gray-light border border-border'
      case 'cancelled':
        return 'bg-dark-red bg-opacity-20 text-red-300 border border-dark-red'
      default:
        return 'bg-dark-gray text-gray-light border border-border'
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

  const formatDate = (date: Date) => {
    const d = new Date(date)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}`
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-dark-gray rounded-lg shadow-lg p-6 mb-6 border-2 border-border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Meus Pedidos</h1>
            <Link
              href={`/loja/${slug}`}
              className="bg-gold text-black-pure px-3 py-1.5 rounded-lg font-semibold hover:bg-gold-bright transition text-xs"
            >
              Voltar ao Menu
            </Link>
          </div>

          {/* Busca por telefone */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Digite seu número de celular"
              className="flex-1 px-4 py-2 bg-black-main border-2 border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold"
              required
            />
            <button
              type="submit"
              className="bg-gold text-black-pure px-4 py-2 rounded-lg font-semibold hover:bg-gold-bright transition text-sm"
            >
              Buscar
            </button>
          </form>
        </div>

        {/* Lista de Pedidos */}
        {loading && phone ? (
          <div className="text-center py-8 bg-dark-gray rounded-lg border border-border">
            <p className="text-white">Carregando pedidos...</p>
          </div>
        ) : orders.length === 0 && phone ? (
          <div className="text-center py-12 bg-dark-gray rounded-lg border-2 border-border">
            <p className="text-white text-lg mb-2">Nenhum pedido encontrado</p>
            <p className="text-gray-medium text-sm">
              Não há pedidos para este número de telefone.
            </p>
          </div>
        ) : !phone ? (
          <div className="text-center py-12 bg-dark-gray rounded-lg border-2 border-border">
            <p className="text-white text-lg mb-2">Digite seu número de telefone</p>
            <p className="text-gray-medium text-sm">
              Digite seu número de celular acima para ver seus pedidos.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-dark-gray border-2 border-border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-2xl font-bold text-gold">{order.orderNumber}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm text-white mb-2">
                      <p><strong>Data:</strong> {formatDate(order.createdAt)}</p>
                      <p><strong>{order.tableId ? 'Mesa' : 'Tipo de Entrega'}:</strong> {order.tableId ? `#${order.tableId}` : 'Retirar no Caixa'}</p>
                      <p><strong>Total:</strong> MT {order.totalAmount.toFixed(0)}</p>
                      <p><strong>Tempo estimado:</strong> {order.estimatedTime} min</p>
                    </div>

                    {/* Botão para expandir */}
                    <button
                      onClick={() => {
                        if (expandedOrder === order.id) {
                          setExpandedOrder(null)
                        } else {
                          setExpandedOrder(order.id)
                          if (!orderItems[order.id]) {
                            fetchOrderItems(order.id)
                          }
                        }
                      }}
                      className="text-sm text-gold font-semibold hover:text-gold-bright transition"
                    >
                      {expandedOrder === order.id ? 'Ocultar detalhes' : 'Ver detalhes'}
                    </button>

                    {/* Detalhes expandidos */}
                    {expandedOrder === order.id && orderItems[order.id] && (
                      <div className="mt-4 pt-4 border-t-2 border-border">
                        <h4 className="font-bold text-white mb-2">Produtos:</h4>
                        <ul className="space-y-2">
                          {orderItems[order.id].map((item) => (
                            <li key={item.id} className="text-sm text-white">
                              <span className="font-semibold">x{item.quantity}</span> - {item.product?.name || `Produto ID: ${item.productId}`} - MT {item.price.toFixed(0)}
                              {item.notes && (
                                <p className="text-xs text-gray-medium italic ml-6">Nota: {item.notes}</p>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Botão de avaliação (apenas se entregue) */}
                    {order.status === 'delivered' && (
                      <div className="mt-4">
                        {reviewingOrder === order.id ? (
                          <div className="bg-black-main rounded-lg p-4 border-2 border-border">
                            <h4 className="font-bold text-white mb-2">Avaliar Pedido</h4>
                            <div className="mb-3">
                              <label className="block text-sm font-semibold text-white mb-1">
                                Avaliação
                              </label>
                              <StarRating
                                rating={review.rating}
                                interactive={true}
                                onRatingChange={(rating) => setReview({ ...review, rating })}
                                size="lg"
                              />
                            </div>
                            <div className="mb-3">
                              <label className="block text-sm font-semibold text-white mb-1">
                                Comentário (opcional)
                              </label>
                              <textarea
                                value={review.comment}
                                onChange={(e) => setReview({ ...review, comment: e.target.value })}
                                className="w-full px-3 py-2 bg-dark-gray border-2 border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold resize-none"
                                rows={3}
                                placeholder="Deixe um comentário sobre seu pedido..."
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSubmitReview(order.id)}
                                className="bg-gold text-black-pure px-3 py-1.5 rounded-lg font-semibold hover:bg-gold-bright transition text-sm"
                              >
                                Enviar Avaliação
                              </button>
                              <button
                                onClick={() => {
                                  setReviewingOrder(null)
                                  setReview({ rating: 0, comment: '' })
                                }}
                                className="bg-dark-gray text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-gold hover:text-black-pure transition text-sm"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setReviewingOrder(order.id)}
                            className="bg-gold text-black-pure px-3 py-1.5 rounded-lg font-semibold hover:bg-gold-bright transition text-xs"
                          >
                            Avaliar Pedido
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

