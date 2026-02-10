const fs = require('fs')
const path = require('path')

// Carregar .env.local
const envPath = path.join(process.cwd(), '.env.local')
let envContent = ''

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8')
} else {
  console.log('❌ Arquivo .env.local não encontrado!')
  process.exit(1)
}

// Extrair Service Role Key
const serviceRoleKeyMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)
const serviceRoleKey = serviceRoleKeyMatch ? serviceRoleKeyMatch[1].trim() : null

console.log('🔍 Verificando SUPABASE_SERVICE_ROLE_KEY...\n')

if (!serviceRoleKey) {
  console.log('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada no .env.local')
  console.log('\n📋 Para corrigir:')
  console.log('   1. Acesse: https://supabase.com/dashboard/project/qbjrdytwoyoysfnweugf/settings/api')
  console.log('   2. Clique em "Reveal" ao lado de "service_role"')
  console.log('   3. Copie a chave completa')
  console.log('   4. Adicione no .env.local:')
  console.log('      SUPABASE_SERVICE_ROLE_KEY=sua_chave_aqui')
  process.exit(1)
}

// Verificar formato
if (!serviceRoleKey.startsWith('eyJ')) {
  console.log('⚠️  A Service Role Key parece estar incorreta')
  console.log('   Deve começar com: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
  console.log('   Valor atual começa com:', serviceRoleKey.substring(0, 20) + '...')
}

if (serviceRoleKey.length < 200) {
  console.log('⚠️  A Service Role Key parece muito curta')
  console.log('   Tamanho atual:', serviceRoleKey.length, 'caracteres')
  console.log('   Esperado: ~200+ caracteres')
}

// Testar conexão
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 
  envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim()

if (!supabaseUrl) {
  console.log('❌ NEXT_PUBLIC_SUPABASE_URL não encontrada')
  process.exit(1)
}

console.log('✅ Service Role Key encontrada no .env.local')
console.log('   Tamanho:', serviceRoleKey.length, 'caracteres')
console.log('   Inicia com:', serviceRoleKey.substring(0, 20) + '...')
console.log('\n🧪 Testando conexão...')

// Testar com Supabase
const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Testar uma query simples
supabase
  .from('stores')
  .select('id')
  .limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.log('❌ Erro ao testar conexão:', error.message)
      if (error.message.includes('Invalid API key')) {
        console.log('\n🔧 A Service Role Key está incorreta!')
        console.log('   Siga as instruções acima para obter a chave correta.')
      }
      process.exit(1)
    } else {
      console.log('✅ Conexão com Service Role Key: OK')
      console.log('🎉 Tudo configurado corretamente!')
      console.log('\n💡 Reinicie o servidor Next.js para aplicar as mudanças.')
    }
  })
  .catch(err => {
    console.log('❌ Erro ao testar:', err.message)
    process.exit(1)
  })


