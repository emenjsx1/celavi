import { NextRequest, NextResponse } from 'next/server'
import { getOrdersByPhone } from '@/lib/db-supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')

    if (!phone) {
      return NextResponse.json(
        { error: 'Número de telefone é obrigatório' },
        { status: 400 }
      )
    }

    console.log(`🔍 Buscando pedidos para o telefone: ${phone}`)
    const orders = await getOrdersByPhone(phone)
    console.log(`📦 Retornando ${orders.length} pedido(s)`)
    
    return NextResponse.json(orders)
  } catch (error) {
    console.error('❌ Erro ao buscar pedidos por telefone:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json(
      { error: `Erro ao buscar pedidos: ${errorMessage}` },
      { status: 500 }
    )
  }
}








