import { NextRequest, NextResponse } from 'next/server'
import { getPaymentReceiptByOrderId } from '@/lib/db-supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const orderId = parseInt(id)

    const receipt = await getPaymentReceiptByOrderId(orderId)
    if (!receipt) {
      return NextResponse.json(
        { error: 'Comprovante não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(receipt)
  } catch (error) {
    console.error('Error fetching receipt:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar comprovante' },
      { status: 500 }
    )
  }
}









