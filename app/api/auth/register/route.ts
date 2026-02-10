import { NextRequest, NextResponse } from 'next/server'

// Cadastro bloqueado - apenas manual pelo admin
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Cadastro não disponível. Contas são criadas manualmente pelo administrador.' },
    { status: 403 }
  )
}
