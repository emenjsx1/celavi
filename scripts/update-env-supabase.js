const fs = require('fs')
const path = require('path')

// Credenciais corretas do Supabase (obtidas via MCP)
const SUPABASE_URL = 'https://qbjrdytwoyoysfnweugf.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFianJkeXR3b3lveXNmbndldWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNjU2MDAsImV4cCI6MjA4NDc0MTYwMH0._fjT0src_7QuKxU3yN5uEoL5FukdNqWq-R4y7qIk5is'

const envPath = path.join(process.cwd(), '.env.local')

// Ler arquivo .env.local existente ou criar novo
let envContent = ''
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8')
}

// Atualizar ou adicionar variáveis do Supabase
const lines = envContent.split('\n')
const newLines = []
let hasSupabaseUrl = false
let hasSupabaseAnonKey = false
let hasServiceRoleKey = false

for (const line of lines) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
    newLines.push(`NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}`)
    hasSupabaseUrl = true
  } else if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
    newLines.push(`NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}`)
    hasSupabaseAnonKey = true
  } else if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
    // Manter a Service Role Key existente se houver
    newLines.push(line)
    hasServiceRoleKey = true
  } else if (line.trim() && !line.startsWith('#')) {
    newLines.push(line)
  } else {
    newLines.push(line)
  }
}

// Adicionar variáveis que não existem
if (!hasSupabaseUrl) {
  newLines.push(`NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}`)
}
if (!hasSupabaseAnonKey) {
  newLines.push(`NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}`)
}
if (!hasServiceRoleKey) {
  newLines.push(`# SUPABASE_SERVICE_ROLE_KEY=OBTENHA_NO_DASHBOARD_DO_SUPABASE`)
  newLines.push(`# Acesse: https://supabase.com/dashboard/project/qbjrdytwoyoysfnweugf/settings/api`)
}

// Garantir que há uma linha vazia no final
if (newLines[newLines.length - 1] !== '') {
  newLines.push('')
}

// Escrever arquivo atualizado
fs.writeFileSync(envPath, newLines.join('\n'), 'utf8')

console.log('✅ Arquivo .env.local atualizado com sucesso!')
console.log('')
console.log('📋 Variáveis atualizadas:')
console.log(`   ✅ NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}`)
console.log(`   ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY=***${SUPABASE_ANON_KEY.slice(-10)}`)
console.log('')
if (!hasServiceRoleKey) {
  console.log('⚠️  IMPORTANTE: Você precisa adicionar a SUPABASE_SERVICE_ROLE_KEY manualmente:')
  console.log('   1. Acesse: https://supabase.com/dashboard/project/qbjrdytwoyoysfnweugf/settings/api')
  console.log('   2. Copie a "service_role" key')
  console.log('   3. Adicione no .env.local: SUPABASE_SERVICE_ROLE_KEY=sua_chave_aqui')
  console.log('')
}
console.log('🔄 Reinicie o servidor Next.js para aplicar as mudanças!')





