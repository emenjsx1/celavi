import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
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
        const { getStoreByUserId, getCategoriesByStoreId } = await import('@/lib/db-supabase')
        const store = await getStoreByUserId(parseInt(session.user.id))
        if (store) {
          const categories = await getCategoriesByStoreId(store.id)
          return NextResponse.json(categories)
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

    const categories = mockData.categories.findByStoreId(store.id)

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar categorias' },
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

    const { name, description, orderPosition, parentId } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      )
    }

    // Tentar salvar no Supabase primeiro
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl) {
      try {
        const { getStoreByUserId, createCategory } = await import('@/lib/db-supabase')
        const store = await getStoreByUserId(parseInt(session.user.id))
        if (store) {
          const category = await createCategory({
            storeId: store.id,
            name,
            description: description || undefined,
            orderPosition: orderPosition || 0,
            parentId: parentId ? parseInt(parentId) : undefined,
          })
          if (category) {
            return NextResponse.json(category, { status: 201 })
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

    const category = mockData.categories.create({
      storeId: store.id,
      name,
      description: description || undefined,
      orderPosition: orderPosition || 0,
      parentId: parentId ? parseInt(parentId) : undefined,
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Erro ao criar categoria' },
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

    const { id, name, description, orderPosition, parentId } = await request.json()

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
        const { getStoreByUserId, updateCategory, getCategoryById } = await import('@/lib/db-supabase')
        const store = await getStoreByUserId(parseInt(session.user.id))
        if (store) {
          const category = await getCategoryById(parseInt(id))
          if (!category || category.storeId !== store.id) {
            return NextResponse.json(
              { error: 'Categoria não encontrada' },
              { status: 404 }
            )
          }
          const updatedCategory = await updateCategory(parseInt(id), {
            name,
            description: description || undefined,
            orderPosition: orderPosition || 0,
            parentId: parentId !== undefined ? (parentId ? parseInt(parentId) : null) : undefined,
          })
          if (updatedCategory) {
            return NextResponse.json(updatedCategory)
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

    const category = mockData.categories.findById(id)

    if (!category || category.storeId !== store.id) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    const updatedCategory = mockData.categories.update(id, {
      name,
      description: description || undefined,
      orderPosition: orderPosition || 0,
      parentId: parentId !== undefined ? (parentId ? parseInt(parentId) : null) : undefined,
    })

    if (!updatedCategory) {
      return NextResponse.json(
        { error: 'Erro ao atualizar categoria' },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar categoria' },
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

    // Tentar remover no Supabase primeiro
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl) {
      try {
        const { getStoreByUserId, deleteCategory, getCategoryById } = await import('@/lib/db-supabase')
        const store = await getStoreByUserId(parseInt(session.user.id))
        if (store) {
          const category = await getCategoryById(parseInt(id))
          if (!category || category.storeId !== store.id) {
            return NextResponse.json(
              { error: 'Categoria não encontrada' },
              { status: 404 }
            )
          }
          const deleted = await deleteCategory(parseInt(id))
          if (deleted) {
            return NextResponse.json({ message: 'Categoria removida' })
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

    const category = mockData.categories.findById(parseInt(id))

    if (!category || category.storeId !== store.id) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      )
    }

    const deleted = mockData.categories.delete(parseInt(id))

    if (!deleted) {
      return NextResponse.json(
        { error: 'Erro ao remover categoria' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Categoria removida' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Erro ao remover categoria' },
      { status: 500 }
    )
  }
}
