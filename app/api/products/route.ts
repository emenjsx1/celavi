import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getStoreByUserId, getProductsByStoreId, getCategoryById } from '@/lib/db-supabase'
import { mockData, initializeMockData } from '@/lib/mock-data'

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
          const products = await getProductsByStoreId(store.id)
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
    const store = mockData.stores.findByUserId(parseInt(session.user.id))

    if (!store) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })
    }

    const products = mockData.products.findByStoreId(store.id).map(p => ({
      ...p,
      category: mockData.categories.findById(p.categoryId),
    }))

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar produtos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { categoryId, name, description, price, image, isAvailable, isHot } = await request.json()

    if (!categoryId || !name || price === undefined) {
      return NextResponse.json(
        { error: 'Categoria, nome e preço são obrigatórios' },
        { status: 400 }
      )
    }

    // Tentar salvar no Supabase primeiro
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl) {
      try {
        const { createProduct, getStoreByUserId } = await import('@/lib/db-supabase')
        const store = await getStoreByUserId(parseInt(session.user.id))
        
        if (store) {
          const product = await createProduct({
            categoryId: parseInt(categoryId),
            storeId: store.id,
            name,
            description: description || undefined,
            price: parseFloat(price),
            image: image || undefined,
            isAvailable: isAvailable !== false,
            isHot: isHot === true,
          })

          if (product) {
            const category = await getCategoryById(product.categoryId)
            return NextResponse.json({ ...product, category }, { status: 201 })
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

    const product = mockData.products.create({
      categoryId: parseInt(categoryId),
      storeId: store.id,
      name,
      description: description || undefined,
      price: parseFloat(price),
      image: image || undefined,
      isAvailable: isAvailable !== false,
      isHot: isHot === true,
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Erro ao criar produto' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id, categoryId, name, description, price, image, isAvailable, isHot } = await request.json()

    // Tentar atualizar no Supabase primeiro
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl) {
      try {
        const { updateProduct, getProductById, getStoreByUserId, getCategoryById } = await import('@/lib/db-supabase')
        const store = await getStoreByUserId(parseInt(session.user.id))
        
        if (store) {
          const existingProduct = await getProductById(parseInt(id))
          
          if (!existingProduct || existingProduct.storeId !== store.id) {
            return NextResponse.json(
              { error: 'Produto não encontrado' },
              { status: 404 }
            )
          }

          const updatedProduct = await updateProduct(parseInt(id), {
            categoryId: parseInt(categoryId),
            name,
            description: description || undefined,
            price: parseFloat(price),
            image: image || undefined,
            isAvailable: isAvailable !== false,
            isHot: isHot === true,
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
      categoryId: parseInt(categoryId),
      name,
      description: description || undefined,
      price: parseFloat(price),
      image: image || undefined,
      isAvailable: isAvailable !== false,
      isHot: isHot === true,
    })

    if (!updatedProduct) {
      return NextResponse.json(
        { error: 'Erro ao atualizar produto' },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar produto' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      )
    }

    // Tentar deletar no Supabase primeiro
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl) {
      try {
        const { deleteProduct, getProductById, getStoreByUserId } = await import('@/lib/db-supabase')
        const store = await getStoreByUserId(parseInt(session.user.id))
        
        if (store) {
          const product = await getProductById(parseInt(id))
          
          if (!product || product.storeId !== store.id) {
            return NextResponse.json(
              { error: 'Produto não encontrado' },
              { status: 404 }
            )
          }

          const deleted = await deleteProduct(parseInt(id))
          if (deleted) {
            return NextResponse.json({ message: 'Produto removido' })
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

    const deleted = mockData.products.delete(parseInt(id))

    if (!deleted) {
      return NextResponse.json(
        { error: 'Erro ao remover produto' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Produto removido' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Erro ao remover produto' },
      { status: 500 }
    )
  }
}
