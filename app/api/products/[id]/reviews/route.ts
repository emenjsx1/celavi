import { NextRequest, NextResponse } from 'next/server'
import { mockData, initializeMockData } from '@/lib/mock-data'
import { 
  getReviewsByProductId, 
  createReview, 
  getAverageRating, 
  getReviewCount 
} from '@/lib/db-supabase'

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
        const reviews = await getReviewsByProductId(productId)
        const averageRating = await getAverageRating(productId)
        const reviewCount = await getReviewCount(productId)

        return NextResponse.json({
          reviews,
          averageRating,
          reviewCount,
        })
      } catch (supabaseError) {
        console.warn('Supabase error, falling back to mock data:', supabaseError)
      }
    }

    // Fallback para mock data
    await initializeMockData()
    const productReviews = mockData.reviews.findByProductId(productId)
    const averageRating = mockData.reviews.getAverageRating(productId)
    const reviewCount = mockData.reviews.getCount(productId)

    return NextResponse.json({
      reviews: productReviews,
      averageRating,
      reviewCount,
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar avaliações' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const productId = parseInt(id)

    const { userName, rating, comment } = await request.json()

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
    if (supabaseUrl) {
      try {
        const review = await createReview({
          productId,
          userName,
          rating: parseInt(rating),
          comment,
        })

        if (review) {
          return NextResponse.json(review, { status: 201 })
        }
      } catch (supabaseError) {
        console.warn('Supabase error, falling back to mock data:', supabaseError)
      }
    }

    // Fallback para mock data
    await initializeMockData()
    const review = mockData.reviews.create({
      productId,
      userName,
      rating: parseInt(rating),
      comment,
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Erro ao criar avaliação' },
      { status: 500 }
    )
  }
}


