import { NextRequest, NextResponse } from 'next/server'
import { getStoreBySlug, getProductsByStoreId, getCategoryById } from '@/lib/db-supabase'
import { mockData, initializeMockData } from '@/lib/mock-data'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Aguardar params (Next.js 15+)
    const { slug } = await params
    
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoria')

    // Tentar buscar do Supabase primeiro
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl) {
      try {
        const store = await getStoreBySlug(slug)
        if (store) {
          const products = await getProductsByStoreId(
            store.id,
            categoryId ? parseInt(categoryId) : undefined
          )

          const productsWithCategory = await Promise.all(
            products.map(async (p) => {
              const category = await getCategoryById(p.categoryId)
              return {
                ...p,
                category,
              }
            })
          )

          return NextResponse.json(productsWithCategory)
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

    let products = mockData.products.findByStoreId(store.id)
    
    if (categoryId) {
      products = products.filter(p => p.categoryId === parseInt(categoryId))
    }

    const productsWithCategory = products.map(p => ({
      ...p,
      category: mockData.categories.findById(p.categoryId),
    }))

    return NextResponse.json(productsWithCategory)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar produtos' },
      { status: 500 }
    )
  }
}
