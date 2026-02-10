const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Testando conexão com Supabase...\n')

// Verificar variáveis
console.log('📋 Variáveis de ambiente:')
console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Configurado' : '❌ Não configurado'}`)
console.log(`   NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Configurado' : '❌ Não configurado'}`)
console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅ Configurado' : '❌ Não configurado'}\n`)

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Erro: NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são obrigatórios!')
  process.exit(1)
}

// Testar conexão com Anon Key
console.log('🔌 Testando conexão com Anon Key...')
const supabase = createClient(supabaseUrl, supabaseAnonKey)

supabase
  .from('stores')
  .select('id, name, slug')
  .limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.error('❌ Erro ao conectar:', error.message)
      process.exit(1)
    }
    
    console.log('✅ Conexão com Anon Key: OK')
    console.log(`   Loja encontrada: ${data?.[0]?.name || 'Nenhuma'}\n`)
    
    // Testar com Service Role Key se disponível
    if (supabaseServiceKey) {
      console.log('🔌 Testando conexão com Service Role Key...')
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
      
      supabaseAdmin
        .from('stores')
        .select('id, name')
        .limit(1)
        .then(({ data: adminData, error: adminError }) => {
          if (adminError) {
            console.error('❌ Erro com Service Role Key:', adminError.message)
            console.log('\n⚠️  A Service Role Key pode estar incorreta!')
            process.exit(1)
          }
          
          console.log('✅ Conexão com Service Role Key: OK')
          console.log('\n🎉 Tudo configurado corretamente!')
          console.log('\n📊 Resumo:')
          console.log(`   URL: ${supabaseUrl}`)
          console.log(`   Anon Key: ✅ Funcionando`)
          console.log(`   Service Role Key: ✅ Funcionando`)
          console.log('\n✅ Você pode criar mesas e pedidos agora!')
        })
        .catch(err => {
          console.error('❌ Erro inesperado:', err.message)
          process.exit(1)
        })
    } else {
      console.log('\n⚠️  Service Role Key não configurada')
      console.log('   Você ainda pode usar o sistema, mas algumas funcionalidades podem não funcionar.')
      console.log('\n📝 Para obter a Service Role Key:')
      console.log('   1. Acesse: https://supabase.com/dashboard/project/qbjrdytwoyoysfnweugf/settings/api')
      console.log('   2. Copie a "service_role" key')
      console.log('   3. Adicione no .env.local: SUPABASE_SERVICE_ROLE_KEY=sua_chave_aqui')
    }
  })
  .catch(err => {
    console.error('❌ Erro inesperado:', err.message)
    process.exit(1)
  })





