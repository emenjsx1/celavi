import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

// Verificar variáveis de ambiente
if (!process.env.NEXTAUTH_SECRET) {
  console.warn('⚠️ NEXTAUTH_SECRET não está configurado. Usando fallback. Configure no Vercel para produção.')
}

// Verificar NEXTAUTH_URL em produção
if (process.env.NODE_ENV === 'production' && !process.env.NEXTAUTH_URL) {
  console.warn('⚠️ NEXTAUTH_URL não está configurado. Isso pode causar problemas em produção.')
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }





