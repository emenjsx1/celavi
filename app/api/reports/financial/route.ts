import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getStoreByUserId, getOrdersByStoreId } from '@/lib/db-supabase'
import { generatePDFReport, generateExcelReport, type ReportData } from '@/lib/reports'
import { calculateAverageTicket, type OrderData } from '@/lib/analytics'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const format = searchParams.get('format') || 'pdf'

    // Buscar loja do usuário
    const store = await getStoreByUserId(parseInt(session.user.id))
    if (!store) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })
    }

    // Buscar pedidos
    const orders = await getOrdersByStoreId(store.id, undefined)

    // Filtrar por data se fornecido
    let filteredOrders = orders
    if (startDate) {
      const start = new Date(startDate)
      filteredOrders = filteredOrders.filter(o => new Date(o.createdAt) >= start)
    }
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      filteredOrders = filteredOrders.filter(o => new Date(o.createdAt) <= end)
    }

    // Preparar dados do relatório
    const paidOrders = filteredOrders.filter(o =>
      ['paid', 'preparing', 'ready', 'delivered'].includes(o.status)
    )

    const reportData: ReportData = {
      orders: filteredOrders.map(o => ({
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        totalAmount: o.totalAmount,
        paymentMethod: o.paymentMethod,
        status: o.status,
        createdAt: o.createdAt.toISOString(),
      })),
      summary: {
        totalRevenue: paidOrders.reduce((sum, o) => sum + o.totalAmount, 0),
        totalOrders: filteredOrders.length,
        averageTicket: calculateAverageTicket(
          filteredOrders.map(o => ({
            id: o.id,
            orderNumber: o.orderNumber,
            totalAmount: o.totalAmount,
            paymentMethod: o.paymentMethod as 'cash' | 'mpesa' | 'emola' | 'pos',
            status: o.status as OrderData['status'],
            customerName: o.customerName,
            customerPhone: o.customerPhone,
            createdAt: o.createdAt.toISOString(),
          }))
        ),
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      },
    }

    // Gerar relatório
    let blob: Blob
    let contentType: string
    let filename: string

    if (format === 'excel') {
      blob = generateExcelReport(reportData, store.name)
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      filename = `relatorio-financeiro-${Date.now()}.xlsx`
    } else {
      blob = generatePDFReport(reportData, store.name)
      contentType = 'application/pdf'
      filename = `relatorio-financeiro-${Date.now()}.pdf`
    }

    // Retornar arquivo
    return new NextResponse(blob, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error generating financial report:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar relatório' },
      { status: 500 }
    )
  }
}

