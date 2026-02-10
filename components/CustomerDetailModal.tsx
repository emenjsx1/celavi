'use client'

import { useState, useEffect } from 'react'
import { FinanceOrder } from '@/components/DashboardContent'

interface CustomerDetailModalProps {
  isOpen: boolean
  onClose: () => void
  customerPhone: string
  customerName: string
  totalSpent: number
  ordersCount: number
  allOrders: FinanceOrder[]
  videoUrl?: string
}

interface CustomerSegment {
  type: 'VIP' | 'Frequente' | 'Novo' | 'Regular'
  description: string
}

export default function CustomerDetailModal({
  isOpen,
  onClose,
  customerPhone,
  customerName,
  totalSpent,
  ordersCount,
  allOrders,
  videoUrl,
}: CustomerDetailModalProps) {
  const [customerOrders, setCustomerOrders] = useState<FinanceOrder[]>([])
  const [segment, setSegment] = useState<CustomerSegment | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)

  // Carregar notas salvas
  useEffect(() => {
    if (isOpen && customerPhone) {
      const notesKey = `customer_notes_${customerPhone}`
      const savedNotes = localStorage.getItem(notesKey)
      if (savedNotes) {
        setNotes(savedNotes)
      }
    }
  }, [isOpen, customerPhone])

  useEffect(() => {
    if (!isOpen) return

    // Filtrar pedidos do cliente
    const orders = allOrders.filter(
      o => o.customerPhone === customerPhone && o.status !== 'cancelled'
    )
    setCustomerOrders(orders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ))

    // Calcular segmentação
    const last30Days = orders.filter(o => {
      const orderDate = new Date(o.createdAt)
      const daysAgo = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24)
      return daysAgo <= 30
    }).length

    const last7Days = orders.filter(o => {
      const orderDate = new Date(o.createdAt)
      const daysAgo = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24)
      return daysAgo <= 7
    }).length

    let customerSegment: CustomerSegment

    if (totalSpent > 5000 || ordersCount > 20) {
      customerSegment = {
        type: 'VIP',
        description: 'Cliente de alto valor - priorizar atendimento',
      }
    } else if (last30Days >= 5) {
      customerSegment = {
        type: 'Frequente',
        description: 'Cliente frequente - manter relacionamento',
      }
    } else if (last7Days === 1 && ordersCount === 1) {
      customerSegment = {
        type: 'Novo',
        description: 'Novo cliente - oportunidade de fidelização',
      }
    } else {
      customerSegment = {
        type: 'Regular',
        description: 'Cliente regular',
      }
    }

    setSegment(customerSegment)
    setLoading(false)
  }, [isOpen, customerPhone, allOrders, totalSpent, ordersCount])

  if (!isOpen) return null

  const formatDate = (date: string) => {
    const d = new Date(date)
    return d.toLocaleString('pt-MZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatStatus = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return 'Aguardando aprovação'
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

  const formatPayment = (method: string) => {
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

  const getSegmentColor = (type: string) => {
    switch (type) {
      case 'VIP':
        return 'bg-yellow-100 text-yellow-800 border-yellow-500'
      case 'Frequente':
        return 'bg-blue-100 text-blue-800 border-blue-500'
      case 'Novo':
        return 'bg-green-100 text-green-800 border-green-500'
      default:
        return 'bg-dark-bg text-gray-800 border-gray-500'
    }
  }

  // Calcular frequência de pedidos
  const daysSinceFirstOrder = customerOrders.length > 0
    ? Math.floor(
        (Date.now() - new Date(customerOrders[customerOrders.length - 1].createdAt).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0
  const averageDaysBetweenOrders =
    customerOrders.length > 1
      ? daysSinceFirstOrder / (customerOrders.length - 1)
      : 0

  // Identificar se está inativo
  const lastOrderDate =
    customerOrders.length > 0 ? new Date(customerOrders[0].createdAt) : null
  const daysSinceLastOrder = lastOrderDate
    ? Math.floor((Date.now() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0
  const isInactive = daysSinceLastOrder > 30

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-dark-surface rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-dark-border"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-red-strong text-white p-4 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold">{customerName || 'Cliente'}</h2>
            <p className="text-sm opacity-90">{customerPhone}</p>
          </div>
          <button
            onClick={onClose}
            className="text-dark-bg hover:text-gold-dark text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-6">
          {loading ? (
            <p className="text-center text-text-muted">Carregando...</p>
          ) : (
            <>
              {/* Resumo e Segmentação */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border-2 border-green-600 rounded-lg bg-green-50">
                  <p className="text-sm text-green-800 font-semibold">Total Gasto</p>
                  <p className="text-2xl font-bold text-green-700">MT {totalSpent.toFixed(0)}</p>
                </div>
                <div className="p-4 border-2 border-blue-600 rounded-lg bg-blue-50">
                  <p className="text-sm text-blue-800 font-semibold">Total de Pedidos</p>
                  <p className="text-2xl font-bold text-blue-700">{ordersCount}</p>
                </div>
                <div className="p-4 border-2 border-purple-600 rounded-lg bg-purple-50">
                  <p className="text-sm text-purple-800 font-semibold">Ticket Médio</p>
                  <p className="text-2xl font-bold text-purple-700">
                    MT {ordersCount > 0 ? (totalSpent / ordersCount).toFixed(0) : '0'}
                  </p>
                </div>
              </div>

              {/* Vídeo do Cliente */}
              {videoUrl && (
                <div className="bg-dark-surface p-4 border-2 border-dark-border rounded-lg">
                  <h3 className="font-bold text-text-light mb-3 flex items-center gap-2">
                    <span>🎥</span> Vídeo do Cliente
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-3 items-start">
                    <a
                      href={videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-red-strong text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-dark transition text-sm flex items-center gap-2"
                    >
                      <span>▶️</span> Assistir Vídeo
                    </a>
                    <p className="text-sm text-text-muted flex-1">
                      {videoUrl}
                    </p>
                  </div>
                </div>
              )}

              {/* Segmentação */}
              {segment && (
                <div className={`p-4 border-2 rounded-lg ${getSegmentColor(segment.type)}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-lg">Segmento: {segment.type}</p>
                      <p className="text-sm mt-1">{segment.description}</p>
                    </div>
                    <span className="text-3xl">
                      {segment.type === 'VIP' && '⭐'}
                      {segment.type === 'Frequente' && '🔄'}
                      {segment.type === 'Novo' && '🆕'}
                      {segment.type === 'Regular' && '👤'}
                    </span>
                  </div>
                </div>
              )}

              {/* Análise de Recorrência */}
              <div className="bg-dark-surface p-4 border-2 border-dark-border rounded-lg">
                <h3 className="font-bold text-text-light mb-3">Análise de Recorrência</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-text-muted">Frequência média</p>
                    <p className="text-lg font-semibold text-text-light">
                      {averageDaysBetweenOrders > 0
                        ? `${averageDaysBetweenOrders.toFixed(1)} dias`
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">Último pedido</p>
                    <p className="text-lg font-semibold text-text-light">
                      {lastOrderDate
                        ? `${daysSinceLastOrder} dias atrás`
                        : 'Nunca'}
                    </p>
                  </div>
                  {isInactive && (
                    <div className="md:col-span-2">
                      <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded">
                        ⚠️ Cliente inativo há mais de 30 dias - considere ações de retenção
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notas do Cliente */}
              <div className="bg-dark-surface p-4 border-2 border-dark-border rounded-lg">
                <h3 className="font-bold text-text-light mb-2">Notas do Cliente</h3>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Adicione observações sobre este cliente..."
                  className="w-full px-3 py-2 border-2 border-red-dark rounded-lg text-sm min-h-[100px]"
                />
                <button
                  onClick={async () => {
                    try {
                      // Salvar notas no localStorage por enquanto (pode ser expandido para banco depois)
                      const notesKey = `customer_notes_${customerPhone}`
                      localStorage.setItem(notesKey, notes)
                      alert('Notas salvas com sucesso!')
                    } catch (err) {
                      console.error('Erro ao salvar notas:', err)
                      alert('Erro ao salvar notas')
                    }
                  }}
                  className="mt-2 bg-red-strong text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-dark transition text-sm"
                >
                  Salvar Notas
                </button>
              </div>

              {/* Histórico de Pedidos */}
              <div>
                <h3 className="font-bold text-text-light mb-3">Histórico de Pedidos</h3>
                <div className="border-2 border-red-dark rounded-lg overflow-hidden">
                  <div className="bg-dark-gray px-4 py-2 border-b border-red-dark font-semibold text-text-light">
                    {customerOrders.length} pedido(s)
                  </div>
                  <div className="divide-y divide-gray-200 max-h-[400px] overflow-y-auto">
                    {customerOrders.map(order => (
                      <div
                        key={order.id}
                        className="px-4 py-3 hover:bg-dark-surface transition"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <p className="font-semibold text-text-light">{order.orderNumber}</p>
                            <p className="text-xs text-text-muted">{formatDate(order.createdAt)}</p>
                          </div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-sm font-semibold text-text-light">
                              MT {order.totalAmount.toFixed(0)}
                            </span>
                            <span className="text-xs px-2 py-1 rounded bg-gray-200 text-text-light">
                              {formatPayment(order.paymentMethod)}
                            </span>
                            <span className="text-xs px-2 py-1 rounded bg-dark-bg text-text-light">
                              {formatStatus(order.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {customerOrders.length === 0 && (
                      <p className="text-center py-6 text-text-muted">
                        Nenhum pedido encontrado.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

