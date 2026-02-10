const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://qbjrdytwoyoysfnweugf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFianJkeXR3b3lveXNmbndldWdmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTE2NTYwMCwiZXhwIjoyMDg0NzQxNjAwfQ.5b-g1DTQh2fBHTCyQRiwbxo5Udv7D1GmhE42Gdafs50'

async function fixStoreUserRelation() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    console.log('🔗 Corrigindo relação usuário-loja...')
    
    // Buscar o usuário admin
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'celavi@celavi.restaurant')
      .single()
    
    if (userError) {
      console.error('❌ Erro ao buscar usuário:', userError)
      return
    }
    
    console.log('✅ Usuário encontrado, ID:', user.id)
    
    // Buscar a loja celavi
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('slug', 'celavi')
      .single()
    
    if (storeError) {
      console.error('❌ Erro ao buscar loja:', storeError)
      return
    }
    
    console.log('✅ Loja encontrada, ID:', store.id)
    
    // Atualizar a loja com o user_id correto
    const { data: updatedStore, error: updateError } = await supabase
      .from('stores')
      .update({ user_id: user.id })
      .eq('id', store.id)
      .select()
      .single()
    
    if (updateError) {
      console.error('❌ Erro ao atualizar loja:', updateError)
      return
    }
    
    console.log('✅ Loja atualizada com sucesso!')
    console.log('🎯 Relação estabelecida:', {
      userId: user.id,
      storeId: store.id,
      storeName: updatedStore.name
    })
    
  } catch (err) {
    console.error('❌ Erro geral:', err.message)
  }
}

fixStoreUserRelation()
