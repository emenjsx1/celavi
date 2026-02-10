import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    // Verificar variáveis de ambiente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    const status = {
      configured: !!supabaseAdmin,
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      url: supabaseUrl || 'NÃO CONFIGURADO',
      serviceKeyLength: supabaseServiceKey?.length || 0,
    }

    if (!supabaseAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Supabase não está configurado',
        status,
        error: 'Verifique as variáveis de ambiente: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY',
      }, { status: 500 })
    }

    // Testar se consegue ler dados
    const { data: stores, error: storesError } = await supabaseAdmin
      .from('stores')
      .select('id, name')
      .limit(5)

    if (storesError) {
      return NextResponse.json({
        success: false,
        message: 'Erro ao conectar com Supabase',
        status,
        error: storesError.message,
        details: storesError,
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase conectado com sucesso!',
      status,
      test: {
        canQuery: !storesError,
        storesCount: stores?.length || 0,
        stores: stores || [],
      },
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Erro ao testar Supabase',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 })
  }
}

