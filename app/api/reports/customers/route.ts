import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getStoreByUserId, getOrdersByStoreId } from '@/lib/db-supabase'
import { generatePDFReport, generateExcelReport, type ReportData } from '@/lib/reports'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'pdf'

    // Buscar loja do usuário
    const store = await getStoreByUserId(parseInt(session.user.id))
    if (!store) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })
    }

    // Buscar pedidos
    const orders = await getOrdersByStoreId(store.id, undefined)

    // Agrupar por cliente
    const customerMap = new Map<
      string,
      {
        name: string
        phone: string
        totalSpent: number
        ordersCount: number
        lastOrderDate: Date
      }
    >()

    orders
      .filter(o => o.status !== 'cancelled')
      .forEach(order => {
        const key = order.customerPhone
        const existing = customerMap.get(key) || {
          name: order.customerName,
          phone: order.customerPhone,
          totalSpent: 0,
          ordersCount: 0,
          lastOrderDate: order.createdAt,
        }

        customerMap.set(key, {
          name: existing.name || order.customerName,
          phone: order.customerPhone,
          totalSpent: existing.totalSpent + order.totalAmount,
          ordersCount: existing.ordersCount + 1,
          lastOrderDate:
            order.createdAt > existing.lastOrderDate
              ? order.createdAt
              : existing.lastOrderDate,
        })
      })

    // Converter para array e ordenar por total gasto
    const customers = Array.from(customerMap.values()).sort(
      (a, b) => b.totalSpent - a.totalSpent
    )

    // Preparar dados do relatório
    const reportData: ReportData = {
      orders: customers.map(c => ({
        orderNumber: `CLI-${c.phone.slice(-4)}`,
        customerName: c.name,
        customerPhone: c.phone,
        totalAmount: c.totalSpent,
        paymentMethod: 'N/A',
        status: `${c.ordersCount} pedidos`,
        createdAt: c.lastOrderDate.toISOString(),
      })),
      summary: {
        totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
        totalOrders: customers.length,
        averageTicket: 0,
      },
    }

    // Gerar relatório
    let blob: Blob
    let contentType: string
    let filename: string

    if (format === 'excel') {
      blob = generateExcelReport(reportData, store.name)
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      filename = `relatorio-clientes-${Date.now()}.xlsx`
    } else {
      blob = generatePDFReport(reportData, store.name)
      contentType = 'application/pdf'
      filename = `relatorio-clientes-${Date.now()}.pdf`
    }

    // Retornar arquivo
    return new NextResponse(blob, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error generating customers report:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar relatório' },
      { status: 500 }
    )
  }
}

