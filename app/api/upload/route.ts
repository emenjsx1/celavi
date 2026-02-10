import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Apenas imagens são permitidas' }, { status: 400 })
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Arquivo muito grande. Máximo 5MB' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Tentar upload para Supabase primeiro, se configurado
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseUrl && supabaseServiceKey) {
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const { v4: uuidv4 } = await import('uuid')
        
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        })

        // Gerar nome único para o arquivo
        const fileExtension = file.name.split('.').pop() || 'jpg'
        const filename = `${uuidv4()}.${fileExtension}`
        const filepath = `products/${filename}`

        // Upload para Supabase Storage
        const { data, error } = await supabaseAdmin.storage
          .from('product-images')
          .upload(filepath, buffer, {
            contentType: file.type,
            upsert: false
          })

        if (!error && data) {
          // Obter URL pública da imagem
          const { data: urlData } = supabaseAdmin.storage
            .from('product-images')
            .getPublicUrl(filepath)

          return NextResponse.json({ url: urlData.publicUrl }, { status: 200 })
        } else {
          console.warn('Supabase upload failed, falling back to local storage:', error?.message)
          // Continuar para fallback local
        }
      } catch (supabaseError) {
        console.warn('Supabase not configured or error, using local storage:', supabaseError)
        // Continuar para fallback local
      }
    }

    // Fallback: Salvar localmente
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}-${sanitizedName}`
    const filepath = join(uploadsDir, filename)

    // Salvar arquivo
    await writeFile(filepath, buffer)

    // Retornar URL da imagem
    const imageUrl = `/uploads/${filename}`

    return NextResponse.json({ url: imageUrl }, { status: 200 })
  } catch (error: any) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao fazer upload da imagem' },
      { status: 500 }
    )
  }
}

