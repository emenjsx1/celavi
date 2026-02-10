import { NextRequest, NextResponse } from 'next/server'
import { getOrderById, updateOrderStatus } from '@/lib/db-supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const orderId = parseInt(id)

    const order = await getOrderById(orderId)
    if (!order) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar pedido' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const orderId = parseInt(id)
    const body = await request.json()

    const { updateOrder } = await import('@/lib/db-supabase')
    const order = await updateOrder(orderId, body)

    if (!order) {
      return NextResponse.json(
        { error: 'Erro ao atualizar pedido' },
        { status: 500 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar pedido' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const orderId = parseInt(id)

    // Atualizar status para cancelled
    const order = await updateOrderStatus(orderId, 'cancelled')
    if (!order) {
      return NextResponse.json(
        { error: 'Erro ao cancelar pedido' },
        { status: 500 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error cancelling order:', error)
    return NextResponse.json(
      { error: 'Erro ao cancelar pedido' },
      { status: 500 }
    )
  }
}









