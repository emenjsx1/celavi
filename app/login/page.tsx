'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Email ou senha incorretos')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      console.error('Erro ao fazer login:', err)
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="bg-dark-bg min-h-screen flex items-center justify-center p-4">
      <div className="bg-dark-surface rounded-lg shadow-lg p-8 w-full max-w-md border-2 border-dark-border">
        <div className="flex flex-col items-center mb-6">
          <img 
            src="/logo-cela-vi-beira.png" 
            alt="Logo Cela VI Beira"
            className="h-16 w-auto mb-4 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
          <h1 className="text-3xl font-bold text-text-light text-center">
            Login
          </h1>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Formulário de Login */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-text-light font-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-dark-bg border-2 border-dark-border rounded-lg text-text-light focus:outline-none focus:ring-2 focus:ring-gold-primary focus:border-gold-primary"
            />
          </div>
          <div>
            <label className="block text-text-light font-semibold mb-2">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-dark-bg border-2 border-dark-border rounded-lg text-text-light focus:outline-none focus:ring-2 focus:ring-gold-primary focus:border-gold-primary"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold-primary text-dark-bg py-2 px-4 rounded font-semibold hover:bg-gold-light transition disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        
        <p className="text-center text-sm text-text-muted mt-4">
          Cadastros são feitos manualmente pelo administrador
        </p>
      </div>
    </div>
  )
}


