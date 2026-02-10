const fs = require('fs')
const path = require('path')

// Service Role Key fornecida pelo usuário
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFianJkeXR3b3lveXNmbndldWdmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTE2NTYwMCwiZXhwIjoyMDg0NzQxNjAwfQ.5b-g1DTQh2fBHTCyQRiwbxo5Udv7D1GmhE42Gdafs50'

const envPath = path.join(process.cwd(), '.env.local')

console.log('🔧 Atualizando SUPABASE_SERVICE_ROLE_KEY no .env.local...\n')

// Ler arquivo .env.local
let envContent = ''
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8')
} else {
  console.log('❌ Arquivo .env.local não encontrado!')
  console.log('   Criando novo arquivo...')
  envContent = ''
}

// Atualizar ou adicionar SUPABASE_SERVICE_ROLE_KEY
if (envContent.includes('SUPABASE_SERVICE_ROLE_KEY=')) {
  // Substituir linha existente
  envContent = envContent.replace(
    /SUPABASE_SERVICE_ROLE_KEY=.*/g,
    `SUPABASE_SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY}`
  )
  console.log('✅ Service Role Key atualizada')
} else {
  // Adicionar nova linha
  if (envContent && !envContent.endsWith('\n')) {
    envContent += '\n'
  }
  envContent += `SUPABASE_SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY}\n`
  console.log('✅ Service Role Key adicionada')
}

// Salvar arquivo
fs.writeFileSync(envPath, envContent, 'utf8')

console.log('✅ Arquivo .env.local atualizado com sucesso!')
console.log('\n🧪 Testando conexão...')

// Testar conexão
const { createClient } = require('@supabase/supabase-js')
const supabaseUrl = 'https://qbjrdytwoyoysfnweugf.supabase.co'
const supabase = createClient(supabaseUrl, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

supabase
  .from('stores')
  .select('id')
  .limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.log('❌ Erro ao testar:', error.message)
      process.exit(1)
    } else {
      console.log('✅ Conexão com Service Role Key: OK')
      console.log('🎉 Tudo configurado corretamente!')
      console.log('\n💡 Reinicie o servidor Next.js para aplicar as mudanças:')
      console.log('   1. Pare o servidor (Ctrl+C)')
      console.log('   2. Execute: npm run dev')
    }
  })
  .catch(err => {
    console.log('❌ Erro ao testar:', err.message)
    process.exit(1)
  })


