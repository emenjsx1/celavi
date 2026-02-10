import bcrypt from 'bcryptjs'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { mockData, initializeMockData } from './mock-data'

// Inicializar dados mock
initializeMockData()

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-key-change-in-production',
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          // Tentar buscar do Supabase primeiro
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
          if (supabaseUrl) {
            try {
              const { createClient } = await import('@supabase/supabase-js')
              const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
              if (supabaseKey) {
                const supabase = createClient(supabaseUrl, supabaseKey, {
                  auth: { autoRefreshToken: false, persistSession: false }
                })

                const { data: users, error } = await supabase
                  .from('users')
                  .select('*')
                  .eq('email', credentials.email)
                  .limit(1)

                if (!error && users && users.length > 0) {
                  const user = users[0]
                  const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                  )

                  if (isPasswordValid) {
                    return {
                      id: user.id.toString(),
                      email: user.email,
                      name: user.name,
                    }
                  }
                }
              }
            } catch (supabaseError) {
              // Fallback para mock data se Supabase falhar
              console.warn('Erro ao autenticar com Supabase, usando mock data:', supabaseError)
            }
          }

          // Fallback para mock data
          await initializeMockData()
          const user = mockData.users.findByEmail(credentials.email)

          if (!user) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
          }
        } catch (error) {
          console.error('Erro na autenticação:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function createUser(name: string, email: string, password: string) {
  await initializeMockData()
  const hashedPassword = await hashPassword(password)
  
  return mockData.users.create({
    name,
    email,
    password: hashedPassword,
  })
}
