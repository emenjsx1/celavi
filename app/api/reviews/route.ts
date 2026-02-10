import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { mockData, initializeMockData } from '@/lib/mock-data'
import { getStoreByUserId, getReviewsByStoreId, getProductsByStoreId } from '@/lib/db-supabase'

// GET - Buscar todas as avaliações da loja do admin
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Tentar buscar do Supabase primeiro
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl) {
      try {
        const store = await getStoreByUserId(parseInt(session.user.id))
        if (store) {
          const reviews = await getReviewsByStoreId(store.id)
          const products = await getProductsByStoreId(store.id)
          
          // Adicionar informações do produto a cada review
          const allReviews = reviews.map(review => {
            const product = products.find(p => p.id === review.productId)
            return {
              ...review,
              product: product ? {
                id: product.id,
                name: product.name,
              } : undefined
            }
          })

          // Ordenar por data mais recente
          allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

          return NextResponse.json(allReviews)
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

    // Buscar todos os produtos da loja
    const products = mockData.products.findByStoreId(store.id)
    
    // Buscar todas as avaliações dos produtos da loja
    const allReviews = []
    for (const product of products) {
      const productReviews = mockData.reviews.findByProductId(product.id)
      for (const review of productReviews) {
        allReviews.push({
          ...review,
          product: {
            id: product.id,
            name: product.name,
          }
        })
      }
    }

    // Ordenar por data mais recente
    allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json(allReviews)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar avaliações' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { orderId, productId, userName, rating, comment } = await request.json()

    if (!userName || !rating || !comment) {
      return NextResponse.json(
        { error: 'Preencha todos os campos' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Avaliação deve ser entre 1 e 5 estrelas' },
        { status: 400 }
      )
    }

    // Tentar salvar no Supabase primeiro
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (supabaseUrl && supabaseServiceKey) {
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        })

        const { data, error } = await supabaseAdmin
          .from('reviews')
          .insert({
            order_id: orderId || null,
            product_id: productId || null,
            user_name: userName,
            rating: parseInt(rating),
            comment,
          })
          .select()
          .single()

        if (error) {
          throw error
        }

        if (data) {
          return NextResponse.json({
            id: data.id,
            orderId: data.order_id || undefined,
            productId: data.product_id || undefined,
            userName: data.user_name,
            rating: data.rating,
            comment: data.comment,
            createdAt: new Date(data.created_at),
          }, { status: 201 })
        }
      } catch (supabaseError) {
        console.warn('Supabase error, falling back to mock data:', supabaseError)
      }
    }

    // Fallback para mock data (apenas se productId)
    if (productId) {
      await initializeMockData()
      const review = mockData.reviews.create({
        productId,
        userName,
        rating: parseInt(rating),
        comment,
      })
      return NextResponse.json(review, { status: 201 })
    }

    return NextResponse.json(
      { error: 'orderId ou productId é obrigatório' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Erro ao criar avaliação' },
      { status: 500 }
    )
  }
}


