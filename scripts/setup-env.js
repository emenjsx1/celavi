const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const envLocalPath = path.join(__dirname, '..', '.env.local')
const envPath = path.join(__dirname, '..', '.env')

// Gerar NEXTAUTH_SECRET aleatório
const generateSecret = () => {
  return crypto.randomBytes(32).toString('base64')
}

// Criar .env.local (prioridade para Next.js)
if (!fs.existsSync(envLocalPath)) {
  console.log('📝 Criando arquivo .env.local...')
  
  const secret = generateSecret()
  const envContent = `# NextAuth (OBRIGATÓRIO)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=${secret}

# Supabase (Opcional - se usar banco de dados)
NEXT_PUBLIC_SUPABASE_URL=https://cdmzweszhjxdscjhsbma.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbXp3ZXN6aGp4ZHNjamhzYm1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNjE3NDMsImV4cCI6MjA3OTYzNzc0M30.DqNqaVPZf45XsxN2QcAl2b06Ohaq4vxCmMimdwdKFDw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbXp3ZXN6aGp4ZHNjamhzYm1hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDA2MTc0MywiZXhwIjoyMDc5NjM3NzQzfQ.4U981nexrqLVkp8KICSe3KovHMmcFThW4xIwvAnGneQ
`
  
  fs.writeFileSync(envLocalPath, envContent)
  console.log('✅ Arquivo .env.local criado com NEXTAUTH_SECRET gerado automaticamente!')
  console.log('⚠️  IMPORTANTE: Reinicie o servidor (npm run dev) para aplicar as mudanças')
} else {
  console.log('✅ Arquivo .env.local já existe!')
  
  // Verificar se NEXTAUTH_SECRET está configurado
  const envContent = fs.readFileSync(envLocalPath, 'utf8')
  if (!envContent.includes('NEXTAUTH_SECRET=') || envContent.includes('NEXTAUTH_SECRET=change-this')) {
    console.log('⚠️  NEXTAUTH_SECRET não está configurado ou está com valor padrão!')
    console.log('   Adicione NEXTAUTH_SECRET no arquivo .env.local')
  }
}

// Criar .env também (fallback)
if (!fs.existsSync(envPath)) {
  console.log('📝 Criando arquivo .env (fallback)...')
  
  const envContent = `# Database
DATABASE_URL="postgresql://user:password@localhost:5432/cardapio_digital?schema=public"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=${generateSecret()}
`
  
  fs.writeFileSync(envPath, envContent)
  console.log('✅ Arquivo .env criado!')
}





