import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { approvePaymentReceipt, getPaymentReceiptByOrderId, updateOrderStatus } from '@/lib/db-supabase'

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

    // Buscar comprovante
    const receipt = await getPaymentReceiptByOrderId(orderId)
    if (!receipt) {
      return NextResponse.json(
        { error: 'Comprovante não encontrado' },
        { status: 404 }
      )
    }

    // Aprovar comprovante
    const approvedReceipt = await approvePaymentReceipt(receipt.id, parseInt(session.user.id))
    if (!approvedReceipt) {
      return NextResponse.json(
        { error: 'Erro ao aprovar comprovante' },
        { status: 500 }
      )
    }

    // Atualizar status do pedido para approved
    const order = await updateOrderStatus(orderId, 'approved')
    if (!order) {
      return NextResponse.json(
        { error: 'Erro ao atualizar pedido' },
        { status: 500 }
      )
    }

    return NextResponse.json({ order, receipt: approvedReceipt })
  } catch (error) {
    console.error('Error approving receipt:', error)
    return NextResponse.json(
      { error: 'Erro ao aprovar comprovante' },
      { status: 500 }
    )
  }
}









