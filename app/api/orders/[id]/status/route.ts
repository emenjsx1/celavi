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
    const { status } = await request.json()

    if (!status || !['pending_approval', 'approved', 'paid', 'preparing', 'ready', 'delivered', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'Status inválido' },
        { status: 400 }
      )
    }

    const order = await updateOrderStatus(orderId, status)
    if (!order) {
      return NextResponse.json(
        { error: 'Erro ao atualizar status do pedido' },
        { status: 500 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar status do pedido' },
      { status: 500 }
    )
  }
}









