import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getStoreByUserId, updateTable, deleteTable } from '@/lib/db-supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const tableId = parseInt(id)

    // Por enquanto, retornar erro pois não temos função getTableById
    // Isso pode ser implementado se necessário
    return NextResponse.json(
      { error: 'Função não implementada' },
      { status: 501 }
    )
  } catch (error) {
    console.error('Error fetching table:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar mesa' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const tableId = parseInt(id)
    const { number, isActive } = await request.json()

    // Tentar buscar do Supabase primeiro
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl) {
      try {
        const store = await getStoreByUserId(parseInt(session.user.id))
        if (store) {
          const updateData: any = {}
          if (number !== undefined) updateData.number = number
          if (isActive !== undefined) updateData.isActive = isActive

          const table = await updateTable(tableId, updateData)

          if (table) {
            return NextResponse.json(table)
          }
        }
      } catch (supabaseError) {
        console.warn('Supabase error:', supabaseError)
        return NextResponse.json(
          { error: 'Erro ao atualizar mesa' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar mesa' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Error updating table:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar mesa' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const tableId = parseInt(id)

    // Tentar buscar do Supabase primeiro
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl) {
      try {
        const success = await deleteTable(tableId)

        if (success) {
          return NextResponse.json({ success: true })
        }
      } catch (supabaseError) {
        console.warn('Supabase error:', supabaseError)
        return NextResponse.json(
          { error: 'Erro ao deletar mesa' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Erro ao deletar mesa' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Error deleting table:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar mesa' },
      { status: 500 }
    )
  }
}









