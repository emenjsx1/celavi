import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getStoreByUserId, getProductById, updateProduct, getCategoryById } from '@/lib/db-supabase'
import { mockData, initializeMockData } from '@/lib/mock-data'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      )
    }

    // Tentar atualizar no Supabase primeiro
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl) {
      try {
        const store = await getStoreByUserId(parseInt(session.user.id))
        
        if (store) {
          const product = await getProductById(parseInt(id))
          
          if (!product || product.storeId !== store.id) {
            return NextResponse.json(
              { error: 'Produto não encontrado' },
              { status: 404 }
            )
          }

          const updatedProduct = await updateProduct(parseInt(id), {
            isAvailable: !product.isAvailable,
          })

          if (updatedProduct) {
            const category = await getCategoryById(updatedProduct.categoryId)
            return NextResponse.json({ ...updatedProduct, category })
          }
        }
      } catch (supabaseError) {
        console.warn('Supabase error, falling back to mock data:', supabaseError)
      }
    }

    // Fallback para mock data
    await initializeMockData()
    const store = mockData.stores.findByUserId(parseInt(session.user.id))

    if (!store) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })
    }

    const product = mockData.products.findById(parseInt(id))

    if (!product || product.storeId !== store.id) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    const updatedProduct = mockData.products.update(parseInt(id), {
      isAvailable: !product.isAvailable,
    })

    if (!updatedProduct) {
      return NextResponse.json(
        { error: 'Erro ao alterar status do produto' },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('Error toggling product:', error)
    return NextResponse.json(
      { error: 'Erro ao alterar status do produto' },
      { status: 500 }
    )
  }
}
