import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { mockData, initializeMockData } from '@/lib/mock-data'

// DELETE - Deletar avaliação
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeMockData()
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const reviewId = parseInt(id)

    const review = mockData.reviews.findById(reviewId)
    if (!review) {
      return NextResponse.json(
        { error: 'Avaliação não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o produto pertence à loja do admin
    const product = mockData.products.findById(review.productId)
    if (!product) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    const store = mockData.stores.findByUserId(parseInt(session.user.id))
    if (!store || product.storeId !== store.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      )
    }

    const deleted = mockData.reviews.delete(reviewId)
    if (!deleted) {
      return NextResponse.json(
        { error: 'Erro ao deletar avaliação' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Avaliação deletada com sucesso' })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar avaliação' },
      { status: 500 }
    )
  }
}










