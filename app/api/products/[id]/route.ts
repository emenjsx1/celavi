import { NextRequest, NextResponse } from 'next/server'
import { getProductById } from '@/lib/db-supabase'
import { mockData, initializeMockData } from '@/lib/mock-data'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const productId = parseInt(id)

    // Tentar buscar do Supabase primeiro
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl) {
      try {
        const product = await getProductById(productId)
        if (product) {
          return NextResponse.json(product)
        }
      } catch (supabaseError) {
        console.warn('Supabase error, falling back to mock data:', supabaseError)
      }
    }

    // Fallback para mock data
    await initializeMockData()
    const product = mockData.products.findById(productId)
    
    if (!product) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar produto' },
      { status: 500 }
    )
  }
}









