const bcrypt = require('bcryptjs')
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://qbjrdytwoyoysfnweugf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFianJkeXR3b3lveXNmbndldWdmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTE2NTYwMCwiZXhwIjoyMDg0NzQxNjAwfQ.5b-g1DTQh2fBHTCyQRiwbxo5Udv7D1GmhE42Gdafs50'

async function createAdminUser() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    console.log('🔐 Criando usuário admin CELA VI...')
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash('Celavi123@', 12)
    console.log('✅ Senha hash criada')
    
    // Inserir ou atualizar usuário
    const { data, error } = await supabase
      .from('users')
      .upsert({
        name: 'Admin CELA VI',
        email: 'celavi@celavi.restaurant',
        password: hashedPassword
      }, {
        onConflict: 'email'
      })
      .select()
    
    if (error) {
      console.error('❌ Erro ao criar usuário:', error)
      return
    }
    
    console.log('✅ Usuário admin criado/atualizado com sucesso!')
    console.log('📧 Email: celavi@celavi.restaurant')
    console.log('🔑 Senha: Celavi123@')
    console.log('🎯 Use essas credenciais para fazer login')
    
  } catch (err) {
    console.error('❌ Erro geral:', err)
  }
}

createAdminUser()

