import { NextRequest, NextResponse } from 'next/server'
import { getStoreBySlug, getCategoriesByStoreId, getProductsByStoreId } from '@/lib/db-supabase'
import { mockData, initializeMockData } from '@/lib/mock-data'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Aguardar params (Next.js 15+)
    const { slug } = await params
    
    // Tentar buscar do Supabase primeiro
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl) {
      try {
        const store = await getStoreBySlug(slug)
        if (store) {
          const categories = await getCategoriesByStoreId(store.id)
          const products = await getProductsByStoreId(store.id)
          
          return NextResponse.json({
            ...store,
            categories,
            products,
          })
        }
      } catch (supabaseError) {
        console.warn('Supabase error, falling back to mock data:', supabaseError)
      }
    }

    // Fallback para mock data
    await initializeMockData()
    const store = mockData.stores.findBySlug(slug)

    if (!store) {
      return NextResponse.json(
        { error: 'Loja não encontrada' },
        { status: 404 }
      )
    }

    const categories = mockData.categories.findByStoreId(store.id)
    const products = mockData.products.findByStoreId(store.id)

    return NextResponse.json({
      ...store,
      categories,
      products,
    })
  } catch (error) {
    console.error('Error fetching store:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar loja' },
      { status: 500 }
    )
  }
}
