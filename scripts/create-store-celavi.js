const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://qbjrdytwoyoysfnweugf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFianJkeXR3b3lveXNmbndldWdmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTE2NTYwMCwiZXhwIjoyMDg0NzQxNjAwfQ.5b-g1DTQh2fBHTCyQRiwbxo5Udv7D1GmhE42Gdafs50'

async function createStore() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    console.log('🏪 Criando loja CELA VI no Supabase...')
    
    // Verificar se a loja já existe
    const { data: existingStore } = await supabase
      .from('stores')
      .select('*')
      .eq('slug', 'celavi')
      .single()
    
    if (existingStore) {
      console.log('✅ Loja já existe:', existingStore.name)
      return
    }
    
    // Criar a loja
    const storeData = {
      name: 'CELA VI',
      slug: 'celavi',
      description: 'Restaurante CELA VI - Frango Dourado e muito mais!',
      phone: '+258843219876',
      address: 'Beira, Mozambique',
      is_active: true,
      theme_color: '#F2C200', // Dourado
      background_color: '#0F0F0F', // Escuro
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .insert(storeData)
      .select()
      .single()
    
    if (storeError) {
      console.error('❌ Erro ao criar loja:', storeError)
      return
    }
    
    console.log('✅ Loja CELA VI criada com sucesso!')
    console.log('📊 Dados:', {
      id: store.id,
      nome: store.name,
      slug: store.slug,
      telefone: store.phone
    })
    
  } catch (err) {
    console.error('❌ Erro geral:', err.message)
  }
}

createStore()
