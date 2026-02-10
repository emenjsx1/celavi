import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { updateOrderStatus } from '@/lib/db-supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const orderId = parseInt(id)

    const order = await updateOrderStatus(orderId, 'paid')
    if (!order) {
      return NextResponse.json(
        { error: 'Erro ao marcar pedido como pago' },
        { status: 500 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error marking order as paid:', error)
    return NextResponse.json(
      { error: 'Erro ao marcar pedido como pago' },
      { status: 500 }
    )
  }
}









