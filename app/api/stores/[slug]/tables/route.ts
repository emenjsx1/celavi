import { NextRequest, NextResponse } from 'next/server'
import { getStoreBySlug, getTablesByStoreId } from '@/lib/db-supabase'
import { mockData, initializeMockData } from '@/lib/mock-data'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active_only') === 'true'

    // Inicializar mock data
    await initializeMockData()

    // Tentar buscar do Supabase primeiro
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl) {
      try {
        const store = await getStoreBySlug(slug)
        if (store) {
          const tables = await getTablesByStoreId(store.id, activeOnly)
          return NextResponse.json(tables)
        }
      } catch (supabaseError) {
        console.warn('Supabase error, falling back to mock data:', supabaseError)
      }
    }

    // Fallback para mock data
    const store = mockData.stores.findBySlug(slug)
    if (store) {
      const tables = mockData.tables.findByStoreId(store.id, activeOnly)
      return NextResponse.json(tables)
    }

    return NextResponse.json([])
  } catch (error) {
    console.error('Error fetching tables:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar mesas' },
      { status: 500 }
    )
  }
}





