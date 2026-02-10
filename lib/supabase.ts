import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Log de diagnóstico (apenas no servidor)
if (typeof window === 'undefined') {
  if (!supabaseUrl) {
    console.warn('⚠️ NEXT_PUBLIC_SUPABASE_URL não está configurado')
  }
  if (!supabaseAnonKey) {
    console.warn('⚠️ NEXT_PUBLIC_SUPABASE_ANON_KEY não está configurado')
  }
  if (!supabaseServiceKey) {
    console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY não está configurado')
  }
  if (supabaseUrl && supabaseServiceKey) {
    console.log('✅ Supabase configurado:', supabaseUrl)
  } else {
    console.warn('⚠️ Supabase NÃO está configurado - usando mock data')
  }
}

// Cliente para uso no cliente (browser) - apenas se as variáveis estiverem configuradas
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Cliente  para uso no servidor (com service role key para operações privilegiadas)
export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

