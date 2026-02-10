import { NextRequest, NextResponse } from 'next/server'
import { getOrderItemsByOrderId, getProductById } from '@/lib/db-supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const orderId = parseInt(id)

    const items = await getOrderItemsByOrderId(orderId)
    
    // Buscar nomes dos produtos
    const itemsWithProducts = await Promise.all(
      items.map(async (item) => {
        try {
          const product = await getProductById(item.productId)
          return {
            ...item,
            product: product ? {
              id: product.id,
              name: product.name,
            } : undefined
          }
        } catch (err) {
          console.error('Error fetching product:', err)
          return item
        }
      })
    )
    
    return NextResponse.json(itemsWithProducts)
  } catch (error) {
    console.error('Error fetching order items:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar itens do pedido' },
      { status: 500 }
    )
  }
}

