'use client'

import { useState, useEffect } from 'react'
import { FinanceOrder } from '@/components/DashboardContent'

interface Alert {
  id: string
  type: 'warning' | 'error' | 'info'
  message: string
  timestamp: Date
}

interface FinancialAlertsProps {
  orders: FinanceOrder[]
  dailyRevenueGoal?: number
}

export default function FinancialAlerts({
  orders,
  dailyRevenueGoal,
}: FinancialAlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])

  useEffect(() => {
    const newAlerts: Alert[] = []

    const now = new Date()

    // Alertas de comprovantes pendentes há mais de 30 minutos
    const pendingReceipts = orders.filter(
      o =>
        o.status === 'pending_approval' &&
        (o.paymentMethod === 'mpesa' || o.paymentMethod === 'emola')
    )

    pendingReceipts.forEach(order => {
      const orderDate = new Date(order.createdAt)
      const minutesAgo = (now.getTime() - orderDate.getTime()) / (1000 * 60)

      if (minutesAgo > 30) {
        newAlerts.push({
          id: `pending-${order.id}`,
          type: 'warning',
          message: `Comprovante pendente há ${Math.floor(minutesAgo)} minutos - Pedido ${order.orderNumber}`,
          timestamp: orderDate,
        })
      }
    })

    // Alertas de pedidos em preparo há mais de 60 minutos
    const preparingOrders = orders.filter(o => o.status === 'preparing')

    preparingOrders.forEach(order => {
      const orderDate = new Date(order.createdAt)
      const minutesAgo = (now.getTime() - orderDate.getTime()) / (1000 * 60)

      if (minutesAgo > 60) {
        newAlerts.push({
          id: `preparing-${order.id}`,
          type: 'error',
          message: `Pedido em preparo há ${Math.floor(minutesAgo)} minutos - Pedido ${order.orderNumber}`,
          timestamp: orderDate,
        })
      }
    })

    // Alertas de clientes VIP com pedidos pendentes
    const vipCustomers = new Set<string>()
    orders
      .filter(o => ['paid', 'preparing', 'ready', 'delivered'].includes(o.status))
      .forEach(order => {
        const customerOrders = orders.filter(
          o => o.customerPhone === order.customerPhone && o.status !== 'cancelled'
        )
        const totalSpent = customerOrders.reduce((sum, o) => sum + o.totalAmount, 0)

        if (totalSpent > 5000 || customerOrders.length > 20) {
          vipCustomers.add(order.customerPhone)
        }
      })

    orders
      .filter(
        o =>
          vipCustomers.has(o.customerPhone) &&
          ['pending_approval', 'approved'].includes(o.status)
      )
      .forEach(order => {
        newAlerts.push({
          id: `vip-${order.id}`,
          type: 'info',
          message: `Cliente VIP com pedido pendente - ${order.customerName} (${order.orderNumber})`,
          timestamp: new Date(order.createdAt),
        })
      })

    // Alerta de meta diária não atingida
    if (dailyRevenueGoal) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayOrders = orders.filter(
        o =>
          new Date(o.createdAt) >= today &&
          ['paid', 'preparing', 'ready', 'delivered'].includes(o.status)
      )
      const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0)
      const progress = (todayRevenue / dailyRevenueGoal) * 100

      if (progress < 50 && now.getHours() >= 18) {
        // Após 18h e menos de 50% da meta
        newAlerts.push({
          id: 'daily-goal',
          type: 'warning',
          message: `Meta diária: MT ${todayRevenue.toFixed(0)} / MT ${dailyRevenueGoal.toFixed(0)} (${progress.toFixed(1)}%)`,
          timestamp: now,
        })
      }
    }

    setAlerts(newAlerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()))
  }, [orders, dailyRevenueGoal])

  if (alerts.length === 0) {
    return null
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-100 border-red-500 text-red-800'
      case 'warning':
        return 'bg-yellow-100 border-yellow-500 text-yellow-800'
      case 'info':
        return 'bg-blue-100 border-blue-500 text-blue-800'
      default:
        return 'bg-gray-100 border-gray-500 text-gray-800'
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return '🚨'
      case 'warning':
        return '⚠️'
      case 'info':
        return 'ℹ️'
      default:
        return '📢'
    }
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-bold text-black-dark">Alertas e Notificações</h3>
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {alerts.map(alert => (
          <div
            key={alert.id}
            className={`p-3 border-2 rounded-lg ${getAlertColor(alert.type)}`}
          >
            <div className="flex items-start gap-2">
              <span className="text-xl">{getAlertIcon(alert.type)}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold">{alert.message}</p>
                <p className="text-xs opacity-70 mt-1">
                  {alert.timestamp.toLocaleString('pt-MZ', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}







