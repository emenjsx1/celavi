import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { storeId, tableId, customerName, customerPhone, reason } = body

    if (!storeId || !tableId) {
      return NextResponse.json(
        { error: 'storeId e tableId são obrigatórios' },
        { status: 400 }
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase não configurado' },
        { status: 500 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('attendant_calls')
      .insert({
        store_id: storeId,
        table_id: tableId,
        customer_name: customerName || null,
        customer_phone: customerPhone || null,
        reason: reason || 'Geral',
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar chamada de atendente:', error)
      return NextResponse.json(
        { error: 'Erro ao criar chamada de atendente' },
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
      createdAt: data.created_at,
    })
  } catch (error) {
    console.error('Error creating attendant call:', error)
    return NextResponse.json(
      { error: 'Erro ao criar chamada de atendente' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')
    const status = searchParams.get('status') || 'pending'

    if (!storeId) {
      return NextResponse.json(
        { error: 'storeId é obrigatório' },
        { status: 400 }
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase não configurado' },
        { status: 500 }
      )
    }

    let query = supabaseAdmin
      .from('attendant_calls')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erro ao buscar chamadas:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar chamadas de atendente' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      data.map((call: any) => ({
        id: call.id,
        storeId: call.store_id,
        tableId: call.table_id,
        customerName: call.customer_name,
        customerPhone: call.customer_phone,
        reason: call.reason,
        status: call.status,
        attendedBy: call.attended_by,
        attendedAt: call.attended_at,
        createdAt: call.created_at,
        updatedAt: call.updated_at,
      }))
    )
  } catch (error) {
    console.error('Error fetching attendant calls:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar chamadas de atendente' },
      { status: 500 }
    )
  }
}









