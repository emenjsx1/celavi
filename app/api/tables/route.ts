import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getStoreByUserId, getTablesByStoreId, createTable } from '@/lib/db-supabase'
import { mockData, initializeMockData } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active_only') === 'true'

    // Inicializar mock data
    await initializeMockData()

    // Tentar buscar do Supabase primeiro
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl) {
      try {
        const store = await getStoreByUserId(parseInt(session.user.id))
        if (store) {
          const tables = await getTablesByStoreId(store.id, activeOnly)
          return NextResponse.json(tables)
        }
      } catch (supabaseError) {
        console.warn('Supabase error, falling back to mock data:', supabaseError)
      }
    }

    // Fallback para mock data
    const store = mockData.stores.findByUserId(parseInt(session.user.id))
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { number, isActive } = await request.json()

    if (!number || number < 1) {
      return NextResponse.json(
        { error: 'Número da mesa é obrigatório e deve ser maior que 0' },
        { status: 400 }
      )
    }

    // Inicializar mock data
    await initializeMockData()

    // Tentar buscar do Supabase primeiro
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl) {
      try {
        const store = await getStoreByUserId(parseInt(session.user.id))
        if (store) {
          // Verificar se já existe mesa com esse número
          const existingTables = await getTablesByStoreId(store.id, false)
          if (existingTables.some(t => t.number === number)) {
            return NextResponse.json(
              { error: 'Já existe uma mesa com esse número' },
              { status: 400 }
            )
          }

          const table = await createTable({
            storeId: store.id,
            number,
            isActive: isActive !== false,
          })

          if (table) {
            return NextResponse.json(table)
          }
        }
      } catch (supabaseError) {
        console.warn('Supabase error, falling back to mock data:', supabaseError)
        // Continuar para fallback
      }
    }

    // Fallback para mock data
    const store = mockData.stores.findByUserId(parseInt(session.user.id))
    if (!store) {
      return NextResponse.json(
        { error: 'Loja não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se já existe mesa com esse número
    const existingTable = mockData.tables.findByNumber(store.id, number)
    if (existingTable) {
      return NextResponse.json(
        { error: 'Já existe uma mesa com esse número' },
        { status: 400 }
      )
    }

    const table = mockData.tables.create({
      storeId: store.id,
      number,
      isActive: isActive !== false,
    })

    return NextResponse.json(table)
  } catch (error) {
    console.error('Error creating table:', error)
    return NextResponse.json(
      { error: 'Erro ao criar mesa' },
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

    const { id, number, isActive } = await request.json()

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
        const { getStoreByUserId, updateTable, getTablesByStoreId } = await import('@/lib/db-supabase')
        const store = await getStoreByUserId(parseInt(session.user.id))

        if (store) {
          const tables = await getTablesByStoreId(store.id, false)
          const table = tables.find(t => t.id === parseInt(id))

          if (!table) {
            return NextResponse.json(
              { error: 'Mesa não encontrada' },
              { status: 404 }
            )
          }

          const updatedTable = await updateTable(parseInt(id), {
            number,
            isActive: isActive !== undefined ? isActive : undefined,
          })

          if (updatedTable) {
            return NextResponse.json(updatedTable)
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

    const table = mockData.tables.findById(parseInt(id))
    if (!table || table.storeId !== store.id) {
      return NextResponse.json(
        { error: 'Mesa não encontrada' },
        { status: 404 }
      )
    }

    const updatedTable = mockData.tables.update(parseInt(id), {
      number,
      isActive: isActive !== undefined ? isActive : undefined,
    })

    return NextResponse.json(updatedTable)
  } catch (error) {
    console.error('Error updating table:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar mesa' },
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
        const { getStoreByUserId, deleteTable, getTablesByStoreId } = await import('@/lib/db-supabase')
        const store = await getStoreByUserId(parseInt(session.user.id))

        if (store) {
          const tables = await getTablesByStoreId(store.id, false)
          const table = tables.find(t => t.id === parseInt(id))

          if (!table) {
            return NextResponse.json(
              { error: 'Mesa não encontrada' },
              { status: 404 }
            )
          }

          const deleted = await deleteTable(parseInt(id))
          if (deleted) {
            return NextResponse.json({ message: 'Mesa removida' })
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

    const table = mockData.tables.findById(parseInt(id))
    if (!table || table.storeId !== store.id) {
      return NextResponse.json(
        { error: 'Mesa não encontrada' },
        { status: 404 }
      )
    }

    const deleted = mockData.tables.delete(parseInt(id))
    if (deleted) {
      return NextResponse.json({ message: 'Mesa removida' })
    }

    return NextResponse.json(
      { error: 'Erro ao remover mesa' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Error deleting table:', error)
    return NextResponse.json(
      { error: 'Erro ao remover mesa' },
      { status: 500 }
    )
  }
}
