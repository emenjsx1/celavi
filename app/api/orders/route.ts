import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getStoreByUserId,
  getStoreBySlug,
  getOrdersByStoreId,
  getOrdersByPhone,
  createOrder,
  getProductById,
  createOrderItem,
  getNextOrderNumber,
} from '@/lib/db-supabase'
import { mockData, initializeMockData } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const phone = searchParams.get('phone')
    const storeSlug = searchParams.get('store_slug')

    // Se buscar por telefone (público)
    if (phone) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (supabaseUrl) {
        try {
          const orders = await getOrdersByPhone(phone)
          return NextResponse.json(orders)
        } catch (supabaseError) {
          console.warn('Supabase error:', supabaseError)
        }
      }
      return NextResponse.json([])
    }

    // Se buscar por loja (admin)
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl) {
      try {
        let store
        if (storeSlug) {
          store = await getStoreBySlug(storeSlug)
        } else {
          store = await getStoreByUserId(parseInt(session.user.id))
        }

        if (store) {
          const orders = await getOrdersByStoreId(store.id, status || undefined)
          console.log(`✅ Pedidos encontrados para loja ${store.id}: ${orders.length}`)
          if (orders.length > 0) {
            console.log(`   Primeiro pedido: ${orders[0].orderNumber}`)
          }
          return NextResponse.json(orders)
        } else {
          console.warn('⚠️ Loja não encontrada para o usuário')
        }
      } catch (supabaseError) {
        console.error('❌ Erro ao buscar pedidos do Supabase:', supabaseError)
        // Mock data não tem pedidos, retornar array vazio
        console.log(`⚠️ Erro ao buscar pedidos, retornando array vazio`)
        return NextResponse.json([])
      }
    }

    // Supabase não configurado, retornar array vazio
    console.log(`⚠️ Supabase não configurado, retornando array vazio`)
    return NextResponse.json([])
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar pedidos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      storeSlug,
      tableId,
      customerName,
      customerPhone,
      paymentMethod,
      items,
      receiptId,
    } = body

    // tableId pode ser 0 para retirada no caixa
    if (!storeSlug || (tableId !== 0 && !tableId) || !customerName || !customerPhone || !paymentMethod || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      )
    }

    // Validar método de pagamento
    if (!['cash', 'mpesa', 'emola', 'pos'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Método de pagamento inválido' },
        { status: 400 }
      )
    }

    // Inicializar mock data
    await initializeMockData()

    // Buscar loja
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    let store = null

    if (supabaseUrl) {
      try {
        store = await getStoreBySlug(storeSlug)
      } catch (supabaseError) {
        console.warn('Supabase error, falling back to mock data:', supabaseError)
      }
    }

    // Fallback para mock data
    if (!store) {
      store = mockData.stores.findBySlug(storeSlug)
    }

    if (!store) {
      return NextResponse.json(
        { error: 'Loja não encontrada' },
        { status: 404 }
      )
    }

    // Validar produtos e calcular total e tempo estimado
    let totalAmount = 0
    let estimatedTime = 0

    for (const item of items) {
      let product = null
      
      // Tentar buscar do Supabase primeiro
      if (supabaseUrl) {
        try {
          product = await getProductById(item.productId)
        } catch (error) {
          console.warn('Error fetching product from Supabase:', error)
        }
      }

      // Fallback para mock data
      if (!product) {
        product = mockData.products.findById(item.productId)
      }

      if (!product) {
        return NextResponse.json(
          { error: `Produto ${item.productId} não encontrado` },
          { status: 404 }
        )
      }
      if (!product.isAvailable) {
        return NextResponse.json(
          { error: `Produto ${product.name} não está disponível` },
          { status: 400 }
        )
      }

      totalAmount += product.price * item.quantity
      estimatedTime += (product.preparationTime || 5) * item.quantity
    }

    // Normalizar telefone para consistência
    const normalizePhone = (phone: string): string => {
      if (!phone) return ''
      let normalized = phone.replace(/[\s\-\(\)\.]/g, '')
      if (normalized.startsWith('+258')) {
        normalized = normalized.substring(4)
      } else if (normalized.startsWith('258')) {
        normalized = normalized.substring(3)
      }
      return normalized.replace(/\D/g, '')
    }
    
    const normalizedPhone = normalizePhone(customerPhone)
    console.log(`📞 Telefone normalizado: ${normalizedPhone} (original: ${customerPhone})`)

    // Criar ou atualizar customer automaticamente
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (supabaseUrl && supabaseKey) {
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(supabaseUrl, supabaseKey)
        
        // Verificar se customer já existe (usar telefone normalizado)
        const { data: existingCustomer } = await supabase
          .from('customers')
          .select('id')
          .eq('phone', normalizedPhone)
          .single()

        if (!existingCustomer) {
          // Criar novo customer com telefone normalizado
          await supabase
            .from('customers')
            .insert({
              name: customerName,
              phone: normalizedPhone,
            })
        } else {
          // Atualizar customer existente
          await supabase
            .from('customers')
            .update({
              name: customerName,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingCustomer.id)
        }
      } catch (customerError) {
        console.warn('Error creating/updating customer:', customerError)
        // Continuar mesmo se falhar a criação do customer
      }
    }

    // Criar pedido
    // Se tableId for 0, significa retirada no caixa (usar NULL)
    const finalTableId = tableId === 0 ? null : tableId
    
    let order = null

    // Tentar criar no Supabase primeiro
    if (supabaseUrl) {
      try {
        order = await createOrder({
          storeId: store.id,
          tableId: finalTableId,
          customerName,
          customerPhone: normalizedPhone, // Usar telefone normalizado
          paymentMethod,
          status: paymentMethod === 'pos' || paymentMethod === 'cash' ? 'paid' : 'pending_approval',
          totalAmount,
          estimatedTime,
          receiptId,
        })
        
        if (!order) {
          console.warn('⚠️ Falha ao criar pedido no Supabase, tentando mock data')
          console.warn('   ⚠️ ATENÇÃO: O pedido será perdido ao reiniciar o servidor!')
          console.warn('   🔧 Para corrigir, execute: node scripts/verificar-service-role-key.js')
        } else {
          console.log('✅ Pedido criado com sucesso no Supabase:', order.orderNumber)
        }
      } catch (error) {
        console.error('❌ Erro ao criar pedido no Supabase:', error)
        // Continuar para fallback
      }
    }

    // Fallback para mock data (se Supabase falhar ou não estiver configurado)
    if (!order) {
      // Criar pedido em mock data
      const orderNumber = `ORD-${Date.now()}`
      order = {
        id: Date.now(),
        storeId: store.id,
        orderNumber,
        tableId: finalTableId,
        customerName,
        customerPhone,
        paymentMethod,
        status: paymentMethod === 'pos' || paymentMethod === 'cash' ? 'paid' : 'pending_approval',
        totalAmount,
        estimatedTime,
        receiptId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      // Nota: Em produção, você precisaria salvar isso em memória ou banco
      console.warn('⚠️ Pedido criado em mock data (será perdido ao reiniciar servidor)')
      console.warn('⚠️ ATENÇÃO: Configure o Supabase corretamente para persistir pedidos!')
    }

    // Criar itens do pedido
    for (const item of items) {
      let product = null
      
      if (supabaseUrl) {
        try {
          product = await getProductById(item.productId)
        } catch (error) {
          // Continuar para fallback
        }
      }

      if (!product) {
        product = mockData.products.findById(item.productId)
      }

      if (product) {
        if (supabaseUrl && order.id) {
          try {
            await createOrderItem({
              orderId: order.id,
              productId: item.productId,
              quantity: item.quantity,
              price: product.price,
              notes: item.notes || undefined,
            })
          } catch (error) {
            console.warn('Error creating order item in Supabase:', error)
          }
        }
      }
    }

    if (!order) {
      console.error('❌ Falha crítica: pedido não foi criado nem no Supabase nem no mock data')
      return NextResponse.json(
        { error: 'Erro ao criar pedido. Por favor, tente novamente.' },
        { status: 500 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('❌ Erro ao criar pedido:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json(
      { error: `Erro ao criar pedido: ${errorMessage}` },
      { status: 500 }
    )
  }
}

