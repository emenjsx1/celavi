import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

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
    const body = await request.json()
    const { status } = body

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase não configurado' },
        { status: 500 }
      )
    }

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (status === 'attended') {
      updateData.attended_by = parseInt(session.user.id)
      updateData.attended_at = new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('attendant_calls')
      .update(updateData)
      .eq('id', parseInt(id))
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar chamada:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar chamada de atendente' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: data.id,
      storeId: data.store_id,
      tableId: data.table_id,
      customerName: data.customer_name,
      customerPhone: data.customer_phone,
      reason: data.reason,
      status: data.status,
      attendedBy: data.attended_by,
      attendedAt: data.attended_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    })
  } catch (error) {
    console.error('Error updating attendant call:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar chamada de atendente' },
      { status: 500 }
    )
  }
}









