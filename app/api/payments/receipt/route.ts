import { NextRequest, NextResponse } from 'next/server'
import { createPaymentReceipt } from '@/lib/db-supabase'
import { supabaseAdmin } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const orderId = formData.get('order_id') as string
    const paymentMethod = formData.get('payment_method') as string

    if (!file || !orderId || !paymentMethod) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      )
    }

    if (!['mpesa', 'emola'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Método de pagamento inválido' },
        { status: 400 }
      )
    }

    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Formato inválido. Use JPG, PNG ou PDF' },
        { status: 400 }
      )
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 5MB' },
        { status: 400 }
      )
    }

    // Converter File para Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `receipts/${orderId}/${fileName}`

    // Upload para Supabase Storage
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase não configurado' },
        { status: 500 }
      )
    }

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('payment-receipts')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Erro ao fazer upload do arquivo' },
        { status: 500 }
      )
    }

    // Obter URL pública
    const { data: urlData } = supabaseAdmin.storage
      .from('payment-receipts')
      .getPublicUrl(filePath)

    const receiptUrl = urlData.publicUrl

    // Salvar registro do comprovante
    const receipt = await createPaymentReceipt({
      orderId: parseInt(orderId),
      paymentMethod: paymentMethod as 'mpesa' | 'emola',
      receiptUrl,
      isApproved: false,
    })

    if (!receipt) {
      console.error('Erro ao salvar comprovante no banco de dados')
      return NextResponse.json(
        { error: 'Erro ao salvar comprovante no banco de dados' },
        { status: 500 }
      )
    }


    return NextResponse.json({
      id: receipt.id,
      receiptUrl: receipt.receiptUrl,
    })
  } catch (error) {
    console.error('Error uploading receipt:', error)
    return NextResponse.json(
      { error: 'Erro ao fazer upload do comprovante' },
      { status: 500 }
    )
  }
}

