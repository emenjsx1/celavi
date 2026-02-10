'use client'

import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import * as QRCode from 'qrcode'
import StarRating from '@/components/StarRating'
import OrdersSection from '@/components/OrdersSection'
import TablesSection from '@/components/TablesSection'
import AttendantCallsSection from '@/components/AttendantCallsSection'
import FinancialCharts from '@/components/FinancialCharts'
import CustomerDetailModal from '@/components/CustomerDetailModal'
import ExportReports from '@/components/ExportReports'
import FinancialAlerts from '@/components/FinancialAlerts'
import {
  calculateRevenueByDay,
  calculatePaymentMethodDistribution,
  calculateTopProducts,
  calculateAverageTicket,
  calculateOrdersPerDay,
  calculateConversionRate,
  type OrderData,
} from '@/lib/analytics'

interface Store {
  id: number
  name: string
  slug: string
  description?: string
  address?: string
  phone?: string
  email?: string
  facebookUrl?: string
  instagramUrl?: string
  whatsappUrl?: string
  appUrl?: string
  mpesaName?: string
  mpesaPhone?: string
  emolaName?: string
  emolaPhone?: string
  categories: Category[]
  products: Product[]
}

interface Category {
  id: number
  name: string
  description?: string
  orderPosition: number
  parentId?: number
}

interface Product {
  id: number
  name: string
  description?: string
  price: number
  image?: string
  isAvailable: boolean
  isHot?: boolean
  preparationTime?: number
  category: Category
  categoryId: number
}

// Helper function para formatar datas de forma consistente
const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

export default function DashboardContent({ session }: { session: any }) {
  const [store, setStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [activeTab, setActiveTab] = useState<
    'categories' | 'products' | 'reviews' | 'orders' | 'tables' | 'attendant-calls' | 'finance' | 'customers'
  >('categories')

  useEffect(() => {
    fetchStore()
  }, [])

  useEffect(() => {
    if (store) {
      generateQRCode()
    }
  }, [store])

  const fetchStore = async () => {
    try {
      const res = await fetch('/api/stores')
      if (res.ok) {
        const data = await res.json()
        setStore(data)
      }
    } catch (err) {
      console.error('Error fetching store:', err)
    } finally {
      setLoading(false)
    }
  }

  const generateQRCode = async () => {
    if (!store) return

    try {
      const cardapioUrl = `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/loja/${store.slug}`
      const qr = await QRCode.toDataURL(cardapioUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#D4AF37', // Dourado
          light: '#FFFFFF',
        },
      })
      setQrCodeUrl(qr)
    } catch (err) {
      console.error('Error generating QR code:', err)
    }
  }

  if (loading) {
    return (
      <div className="bg-dark-bg min-h-screen flex items-center justify-center">
        <p className="text-text-light">Carregando...</p>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="bg-dark-bg min-h-screen flex items-center justify-center">
        <div className="bg-dark-surface rounded-lg shadow-lg p-8 max-w-md text-center border-2 border-dark-border">
          <p className="text-text-light text-lg mb-4">Loja não encontrada</p>
          <p className="text-text-muted">Entre em contato com o suporte.</p>
        </div>
      </div>
    )
  }

  const cardapioUrl = `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/loja/${store.slug}`

  return (
    <div className="bg-dark-bg min-h-screen">
      {/* Header */}
      <header className="bg-dark-surface border-b-2 border-dark-border text-text-light p-4 shadow-lg">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 px-2 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <img
              src="/logo-cela-vi-beira.png"
              alt="Logo Cela VI Beira"
              className="h-8 sm:h-10 w-auto object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
            <h1 className="text-lg sm:text-2xl font-bold"></h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <Link
              href={`/loja/${store.slug}`}
              target="_blank"
              className="bg-gold-primary text-dark-bg px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-gold-light transition font-semibold text-xs sm:text-sm flex-1 sm:flex-initial text-center"
            >
              Ver Cardápio
            </Link>
            <button
              onClick={() => signOut()}
              className="bg-dark-border text-text-light px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-gold-primary hover:text-dark-bg transition text-xs sm:text-sm font-semibold flex-1 sm:flex-initial"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-2 sm:p-4 max-w-7xl overflow-x-hidden w-full">
        {/* Mensagens */}
        {message && (
          <div className="bg-gold bg-opacity-20 border border-gold text-gold px-4 py-3 rounded-lg mb-4">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Grid Layout - Organizado */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6 w-full max-w-full overflow-x-hidden">
          {/* QR Code Section - Lado Esquerdo */}
          <div className="lg:col-span-2 bg-dark-surface rounded-lg shadow-lg p-6 border-2 border-dark-border">
            <h2 className="text-2xl font-bold text-text-light mb-4">QR Code do Cardápio</h2>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="bg-dark-bg p-4 rounded-lg border-2 border-dark-border flex-shrink-0">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 md:w-56 md:h-56" />
                ) : (
                  <div className="w-48 h-48 md:w-56 md:h-56 bg-dark-surface flex items-center justify-center rounded">
                    <p className="text-text-muted text-sm">Gerando QR Code...</p>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-text-light mb-2">Link do Cardápio</h3>
                <div className="bg-dark-bg p-3 rounded border-2 border-dark-border mb-3">
                  <code className="text-xs break-all text-text-light">{cardapioUrl}</code>
                </div>
                <p className="text-sm text-text-muted mb-4">
                  Escaneie o QR Code ou compartilhe o link acima.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(cardapioUrl)
                      setMessage('Link copiado!')
                      setTimeout(() => setMessage(''), 3000)
                    }}
                    className="bg-gold-primary text-dark-bg px-4 py-2 rounded-lg font-semibold hover:bg-gold-light transition text-sm"
                  >
                    Copiar Link
                  </button>
                  {qrCodeUrl && (
                    <button
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = qrCodeUrl
                        link.download = `qr-code-${store.slug}.png`
                        link.click()
                      }}
                      className="bg-dark-border text-text-light px-4 py-2 rounded-lg font-semibold hover:bg-gold-primary hover:text-dark-bg transition text-sm"
                    >
                      Baixar QR Code
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Redes Sociais e App - Lado Direito */}
          <div className="bg-dark-surface rounded-lg shadow-lg p-6 border-2 border-dark-border">
            <h2 className="text-xl font-bold text-text-light mb-4">Configurações</h2>
            <form onSubmit={async (e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const data = {
                id: store.id,
                name: store.name,
                slug: store.slug,
                description: store.description,
                facebookUrl: formData.get('facebookUrl') || undefined,
                instagramUrl: formData.get('instagramUrl') || undefined,
                whatsappUrl: formData.get('whatsappUrl') || undefined,
                appUrl: formData.get('appUrl') || undefined,
                mpesaName: formData.get('mpesaName') || undefined,
                mpesaPhone: formData.get('mpesaPhone') || undefined,
                emolaName: formData.get('emolaName') || undefined,
                emolaPhone: formData.get('emolaPhone') || undefined,
              }
              try {
                const res = await fetch('/api/stores', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data),
                })
                if (res.ok) {
                  setMessage('Configurações atualizadas!')
                  fetchStore()
                  setTimeout(() => setMessage(''), 3000)
                } else {
                  const errorData = await res.json()
                  setError(errorData.error || 'Erro ao atualizar configurações')
                  setTimeout(() => setError(''), 5000)
                }
              } catch (err) {
                console.error('Error updating store:', err)
                setError('Erro ao atualizar configurações')
                setTimeout(() => setError(''), 5000)
              }
            }} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-text-light mb-1">Facebook</label>
                <input
                  type="url"
                  name="facebookUrl"
                  defaultValue={store.facebookUrl || ''}
                  className="w-full px-3 py-2 text-sm bg-dark-bg border-2 border-dark-border rounded-lg text-text-light focus:outline-none focus:ring-2 focus:ring-gold-primary focus:border-gold-primary"
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-light mb-1">Instagram</label>
                <input
                  type="url"
                  name="instagramUrl"
                  defaultValue={store.instagramUrl || ''}
                  className="w-full px-3 py-2 text-sm bg-dark-bg border-2 border-dark-border rounded-lg text-text-light focus:outline-none focus:ring-2 focus:ring-gold-primary focus:border-gold-primary"
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-light mb-1">WhatsApp</label>
                <input
                  type="url"
                  name="whatsappUrl"
                  defaultValue={store.whatsappUrl || ''}
                  className="w-full px-3 py-2 text-sm bg-dark-bg border-2 border-dark-border rounded-lg text-text-light focus:outline-none focus:ring-2 focus:ring-gold-primary focus:border-gold-primary"
                  placeholder="https://wa.me/..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-light mb-1">App Oficial</label>
                <input
                  type="url"
                  name="appUrl"
                  defaultValue={store.appUrl || ''}
                  className="w-full px-3 py-2 text-sm bg-dark-bg border-2 border-dark-border rounded-lg text-text-light focus:outline-none focus:ring-2 focus:ring-gold-primary focus:border-gold-primary"
                  placeholder="https://play.google.com/..."
                />
              </div>
              <div className="border-t-2 border-dark-border pt-3 mt-3">
                <h3 className="text-sm font-bold text-text-light mb-2">Métodos de Pagamento</h3>

                <div className="mb-3">
                  <label className="block text-xs font-semibold text-text-light mb-1">M-Pesa - Nome da Empresa</label>
                  <input
                    type="text"
                    name="mpesaName"
                    defaultValue={store.mpesaName || ''}
                    className="w-full px-3 py-2 text-sm bg-dark-bg border-2 border-dark-border rounded-lg text-text-light focus:outline-none focus:ring-2 focus:ring-gold-primary focus:border-gold-primary"
                    placeholder="Ex: M-Pesa Moçambique"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-xs font-semibold text-text-light mb-1">M-Pesa - Número</label>
                  <input
                    type="tel"
                    name="mpesaPhone"
                    defaultValue={store.mpesaPhone || ''}
                    className="w-full px-3 py-2 text-sm bg-dark-bg border-2 border-dark-border rounded-lg text-text-light focus:outline-none focus:ring-2 focus:ring-gold-primary focus:border-gold-primary"
                    placeholder="+258 XXX XXX XXX"
                  />
                </div>

                <div className="mb-3">
                  <label className="block text-xs font-semibold text-text-light mb-1">Emola - Nome da Empresa</label>
                  <input
                    type="text"
                    name="emolaName"
                    defaultValue={store.emolaName || ''}
                    className="w-full px-3 py-2 text-sm bg-dark-bg border-2 border-dark-border rounded-lg text-text-light focus:outline-none focus:ring-2 focus:ring-gold-primary focus:border-gold-primary"
                    placeholder="Ex: Emola"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-light mb-1">Emola - Número</label>
                  <input
                    type="tel"
                    name="emolaPhone"
                    defaultValue={store.emolaPhone || ''}
                    className="w-full px-3 py-2 text-sm bg-dark-bg border-2 border-dark-border rounded-lg text-text-light focus:outline-none focus:ring-2 focus:ring-gold-primary focus:border-gold-primary"
                    placeholder="+258 XXX XXX XXX"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-gold-primary text-dark-bg px-4 py-2 rounded-lg font-semibold hover:bg-gold-light transition w-full text-sm"
              >
                Salvar
              </button>
            </form>
          </div>
        </div>

        {/* Tabs e Conteúdo Principal */}
        <div className="bg-dark-surface rounded-lg shadow-lg border-2 border-dark-border overflow-hidden max-w-full">
          {/* Tabs */}
          <div className="bg-dark-gray border-b-2 border-border p-2 sm:p-4 overflow-x-auto">
            <nav className="flex gap-2 min-w-max sm:min-w-0">
              <button
                onClick={() => setActiveTab('categories')}
                className={`px-4 sm:px-6 py-2 rounded-lg transition font-semibold text-xs sm:text-sm whitespace-nowrap ${activeTab === 'categories'
                    ? 'bg-gold-primary text-dark-bg'
                    : 'bg-dark-surface text-text-light hover:bg-gold-primary hover:text-dark-bg border-2 border-dark-border'
                  }`}
              >
                Categorias
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`px-4 sm:px-6 py-2 rounded-lg transition font-semibold text-xs sm:text-sm whitespace-nowrap ${activeTab === 'products'
                    ? 'bg-gold-primary text-dark-bg'
                    : 'bg-dark-surface text-text-light hover:bg-gold-primary hover:text-dark-bg border-2 border-dark-border'
                  }`}
              >
                Produtos
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-4 sm:px-6 py-2 rounded-lg transition font-semibold text-xs sm:text-sm whitespace-nowrap ${activeTab === 'reviews'
                    ? 'bg-gold-primary text-dark-bg'
                    : 'bg-dark-surface text-text-light hover:bg-gold-primary hover:text-dark-bg border-2 border-dark-border'
                  }`}
              >
                Avaliações
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-4 sm:px-6 py-2 rounded-lg transition font-semibold text-xs sm:text-sm whitespace-nowrap ${activeTab === 'orders'
                    ? 'bg-gold-primary text-dark-bg'
                    : 'bg-dark-surface text-text-light hover:bg-gold-primary hover:text-dark-bg border-2 border-dark-border'
                  }`}
              >
                Pedidos
              </button>
              <button
                onClick={() => setActiveTab('finance')}
                className={`px-4 sm:px-6 py-2 rounded-lg transition font-semibold text-xs sm:text-sm whitespace-nowrap ${activeTab === 'finance'
                    ? 'bg-gold text-black-pure'
                    : 'bg-dark-gray text-white hover:bg-gold hover:text-black-pure border-2 border-border'
                  }`}
              >
                Financeiro
              </button>
              <button
                onClick={() => setActiveTab('tables')}
                className={`px-4 sm:px-6 py-2 rounded-lg transition font-semibold text-xs sm:text-sm whitespace-nowrap ${activeTab === 'tables'
                    ? 'bg-gold-primary text-dark-bg'
                    : 'bg-dark-surface text-text-light hover:bg-gold-primary hover:text-dark-bg border-2 border-dark-border'
                  }`}
              >
                Mesas
              </button>
              <button
                onClick={() => setActiveTab('attendant-calls')}
                className={`px-4 sm:px-6 py-2 rounded-lg transition font-semibold text-xs sm:text-sm whitespace-nowrap relative ${activeTab === 'attendant-calls'
                    ? 'bg-gold text-black-pure'
                    : 'bg-dark-gray text-white hover:bg-gold hover:text-black-pure border-2 border-border'
                  }`}
              >
                🔔 Atendente
              </button>
              <button
                onClick={() => setActiveTab('customers')}
                className={`px-4 sm:px-6 py-2 rounded-lg transition font-semibold text-xs sm:text-sm whitespace-nowrap ${activeTab === 'customers'
                    ? 'bg-blue-600 text-white'
                    : 'bg-dark-gray text-white hover:bg-gold hover:text-black-pure border-2 border-border'
                  }`}
              >
                Clientes
              </button>
            </nav>
          </div>

          {/* Conteúdo */}
          <div className="p-3 sm:p-6 overflow-x-hidden w-full max-w-full">
            {activeTab === 'categories' && (
              <CategoriesSection storeId={store.id} onUpdate={fetchStore} />
            )}

            {activeTab === 'products' && (
              <ProductsSection storeId={store.id} categories={store.categories || []} onUpdate={fetchStore} />
            )}

            {activeTab === 'reviews' && (
              <ReviewsSection storeId={store.id} />
            )}

            {activeTab === 'orders' && (
              <OrdersSection storeId={store.id} />
            )}

            {activeTab === 'finance' && (
              <FinanceSection storeId={store.id} />
            )}

            {activeTab === 'tables' && (
              <TablesSection storeId={store.id} />
            )}

            {activeTab === 'attendant-calls' && (
              <AttendantCallsSection storeId={store.id} />
            )}

            {activeTab === 'customers' && (
              <CustomersSection storeId={store.id} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente de Categorias
function CategoriesSection({ storeId, onUpdate }: { storeId: number; onUpdate: () => void }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data)
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setMessage('')

    const formData = new FormData(e.currentTarget)
    const data = {
      id: editingCategory?.id,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      orderPosition: parseInt(formData.get('order_position') as string) || 0,
      parentId: formData.get('parentId') ? parseInt(formData.get('parentId') as string) : null,
    }

    try {
      const url = '/api/categories'
      const method = editingCategory ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.error || 'Erro ao salvar categoria')
      } else {
        setMessage(editingCategory ? 'Categoria atualizada!' : 'Categoria criada!')
        setShowForm(false)
        setEditingCategory(null)
        fetchCategories()
        onUpdate()
      }
    } catch (err) {
      setError('Erro ao salvar categoria')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza? Isso também removerá todos os produtos desta categoria.')) {
      return
    }

    try {
      const res = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setMessage('Categoria removida!')
        fetchCategories()
        onUpdate()
      } else {
        const data = await res.json()
        setError(data.error || 'Erro ao remover categoria')
      }
    } catch (err) {
      setError('Erro ao remover categoria')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-text-light">Categorias</h2>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingCategory(null)
          }}
          className="bg-gold text-black-pure px-4 py-2 rounded-lg font-semibold hover:bg-gold-bright transition"
        >
          + Nova Categoria
        </button>
      </div>

      {message && (
        <div className="bg-gold bg-opacity-20 border border-gold text-gold px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-dark-red bg-opacity-20 border border-dark-red text-red-300 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-dark-gray p-4 rounded-lg border-2 border-border mb-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="id" value={editingCategory?.id} />
            <div>
              <label className="block text-text-light font-semibold mb-2">Nome</label>
              <input
                type="text"
                name="name"
                defaultValue={editingCategory?.name || ''}
                required
                className="w-full px-4 py-2 bg-black-main border-2 border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-text-light font-semibold mb-2">Descrição</label>
              <textarea
                name="description"
                rows={2}
                defaultValue={editingCategory?.description || ''}
                className="w-full px-4 py-2 bg-black-main border-2 border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-text-light font-semibold mb-2">Ordem</label>
              <input
                type="number"
                name="order_position"
                defaultValue={editingCategory?.orderPosition || 0}
                className="w-full px-4 py-2 bg-black-main border-2 border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-text-light font-semibold mb-2">Categoria Pai (Opcional)</label>
              <select
                name="parentId"
                defaultValue={editingCategory?.parentId || ''}
                className="w-full px-4 py-2 bg-black-main border-2 border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold"
              >
                <option value="">Nenhuma (Categoria Principal)</option>
                {categories
                  .filter(c => !c.parentId && c.id !== editingCategory?.id)
                  .map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
              </select>
              <p className="text-xs text-text-muted mt-1">Selecione se esta for uma subcategoria (ex: de Bebidas ou Comida).</p>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-gold text-black-pure px-4 py-2 rounded-lg font-semibold hover:bg-gold-bright transition"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingCategory(null)
                }}
                className="bg-dark-gray text-white px-4 py-2 rounded-lg font-semibold hover:bg-gold hover:text-black-pure transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-dark-gray p-4 rounded-lg border-2 border-border flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold text-white flex items-center gap-2">
                {category.parentId && <span className="text-gold text-xs">↳</span>}
                {category.name}
              </h3>
              {category.description && (
                <p className="text-sm text-text-muted">{category.description}</p>
              )}
              <div className="flex gap-2 text-xs text-text-muted">
                <span>Ordem: {category.orderPosition}</span>
                {category.parentId && (
                  <span>• Subcategoria de: {categories.find(c => c.id === category.parentId)?.name}</span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingCategory(category)
                  setShowForm(true)
                }}
                className="bg-gold text-black-pure px-3 py-1 rounded-lg text-sm font-semibold hover:bg-gold-bright transition"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(category.id)}
                className="bg-dark-red text-white px-3 py-1 rounded-lg text-sm font-semibold hover:bg-opacity-80 transition"
              >
                Remover
              </button>
            </div>
          </div>
        ))}

        {categories.length === 0 && (
          <p className="text-text-muted text-center py-8">Nenhuma categoria criada ainda.</p>
        )}
      </div>
    </div>
  )
}

// Componente de Produtos
function ProductsSection({
  storeId,
  categories,
  onUpdate,
}: {
  storeId: number
  categories: Category[]
  onUpdate: () => void
}) {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
        setFilteredProducts(data)
      }
    } catch (err) {
      console.error('Error fetching products:', err)
    }
  }

  // Filtrar produtos baseado na busca
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products)
      return
    }

    const query = searchQuery.toLowerCase().trim()
    const filtered = products.filter((product) => {
      const nameMatch = product.name.toLowerCase().includes(query)
      const descMatch = product.description?.toLowerCase().includes(query) || false
      return nameMatch || descMatch
    })
    setFilteredProducts(filtered)
  }, [searchQuery, products])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setMessage('')

    const formData = new FormData(e.currentTarget)
    const data = {
      id: editingProduct?.id,
      categoryId: parseInt(formData.get('category_id') as string),
      storeId: storeId,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      image: (formData.get('image') as string) || undefined,
      isAvailable: formData.get('is_available') === 'on',
      isHot: formData.get('is_hot') === 'on',
      preparationTime: parseInt(formData.get('preparation_time') as string) || 5,
    }

    try {
      const url = '/api/products'
      const method = editingProduct ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.error || 'Erro ao salvar produto')
      } else {
        setMessage(editingProduct ? 'Produto atualizado!' : 'Produto criado!')
        setShowForm(false)
        setEditingProduct(null)
        fetchProducts()
        onUpdate()
      }
    } catch (err) {
      setError('Erro ao salvar produto')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja remover este produto?')) {
      return
    }

    try {
      const res = await fetch(`/api/products?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setMessage('Produto removido!')
        fetchProducts()
        onUpdate()
      } else {
        const data = await res.json()
        setError(data.error || 'Erro ao remover produto')
      }
    } catch (err) {
      setError('Erro ao remover produto')
    }
  }

  const handleToggle = async (id: number) => {
    try {
      const res = await fetch('/api/products/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (res.ok) {
        fetchProducts()
        onUpdate()
      }
    } catch (err) {
      setError('Erro ao alterar status do produto')
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Produtos</h2>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingProduct(null)
          }}
          className="bg-gold text-black-pure px-4 py-2 rounded font-semibold hover:bg-gold-bright transition text-sm sm:text-base w-full sm:w-auto"
        >
          + Novo Produto
        </button>
      </div>

      {message && (
        <div className="bg-gold bg-opacity-20 border border-gold text-gold px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-dark-red bg-opacity-20 border border-dark-red text-red-300 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Campo de Busca */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 Buscar produtos por nome ou descrição..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 bg-black-main border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold text-white"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted opacity-50 hover:opacity-100"
            >
              ✕
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-sm text-text-muted mt-2">
            {filteredProducts.length} produto(s) encontrado(s)
          </p>
        )}
      </div>

      {showForm && (
        <div className="bg-dark-gray p-4 rounded border border-border mb-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="id" value={editingProduct?.id} />
            <div>
              <label className="block text-text-light font-semibold mb-2">Categoria</label>
              <select
                name="category_id"
                defaultValue={editingProduct?.categoryId || ''}
                required
                className="w-full px-4 py-2 bg-black-main border border-border rounded text-white"
              >
                <option value="">Selecione...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-text-light font-semibold mb-2">Nome</label>
              <input
                type="text"
                name="name"
                defaultValue={editingProduct?.name || ''}
                required
                className="w-full px-4 py-2 bg-black-main border border-border rounded text-white"
              />
            </div>
            <div>
              <label className="block text-text-light font-semibold mb-2">Descrição</label>
              <textarea
                name="description"
                rows={2}
                defaultValue={editingProduct?.description || ''}
                className="w-full px-4 py-2 bg-black-main border border-border rounded text-white"
              />
            </div>
            <div>
              <label className="block text-text-light font-semibold mb-2">Preço (MT)</label>
              <input
                type="number"
                name="price"
                step="1"
                min="0"
                defaultValue={editingProduct?.price || ''}
                required
                className="w-full px-4 py-2 bg-black-main border-2 border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-text-light font-semibold mb-2">Tempo de Preparo (minutos)</label>
              <input
                type="number"
                name="preparation_time"
                step="1"
                min="1"
                defaultValue={editingProduct?.preparationTime || 5}
                required
                className="w-full px-4 py-2 bg-black-main border-2 border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold"
              />
              <p className="text-xs text-text-muted mt-1">Tempo estimado para preparar este produto</p>
            </div>
            <div>
              <label className="block text-text-light font-semibold mb-2">Imagem</label>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm text-text-muted mb-1">Opção 1: Upload de arquivo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        try {
                          const formData = new FormData()
                          formData.append('file', file)
                          const res = await fetch('/api/upload', {
                            method: 'POST',
                            body: formData,
                          })
                          if (res.ok) {
                            const data = await res.json()
                            const urlInput = document.querySelector('input[name="image"]') as HTMLInputElement
                            if (urlInput) {
                              urlInput.value = data.url
                            }
                            setMessage('Imagem enviada com sucesso!')
                            setTimeout(() => setMessage(''), 3000)
                          } else {
                            const error = await res.json()
                            setError(error.error || 'Erro ao fazer upload')
                          }
                        } catch (err) {
                          setError('Erro ao fazer upload da imagem')
                        }
                      }
                    }}
                    className="w-full px-4 py-2 border-2 border-red-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-red-strong text-sm"
                  />
                </div>
                <div className="text-center text-text-muted text-xs">ou</div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">Opção 2: URL da imagem</label>
                  <input
                    type="url"
                    name="image"
                    defaultValue={editingProduct?.image || ''}
                    placeholder="https://exemplo.com/imagem.jpg"
                    className="w-full px-4 py-2 bg-black-main border-2 border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_available"
                  defaultChecked={editingProduct?.isAvailable !== false}
                  className="w-4 h-4"
                />
                <span className="text-white font-semibold">Disponível</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_hot"
                  defaultChecked={editingProduct?.isHot === true}
                  className="w-4 h-4"
                />
                <span className="text-white font-semibold">🔥 Hot/Recomendado</span>
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-red-strong text-white px-4 py-2 rounded font-semibold hover:bg-red-dark"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingProduct(null)
                }}
                className="bg-dark-gray text-white px-4 py-2 rounded font-semibold hover:bg-gold hover:text-black-pure"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4 w-full max-w-full overflow-x-hidden">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-dark-gray p-3 sm:p-4 rounded-lg border-2 border-border hover:shadow-md transition-shadow w-full max-w-full overflow-hidden">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start w-full">
              {/* Imagem do Produto */}
              {product.image && (
                <div className="flex-shrink-0 w-full sm:w-auto">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full sm:w-24 h-32 sm:h-24 object-cover rounded border border-dark-border"
                  />
                </div>
              )}

              {/* Informações do Produto */}
              <div className="flex-1 min-w-0 w-full sm:w-auto">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h3 className="font-bold text-base sm:text-lg text-white break-words flex-1 min-w-0">{product.name}</h3>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-semibold flex-shrink-0 self-start sm:self-auto ${product.isAvailable
                        ? 'bg-gold bg-opacity-20 text-gold border border-gold'
                        : 'bg-dark-red bg-opacity-20 text-red-300 border border-dark-red'
                      }`}
                  >
                    {product.isAvailable ? 'Disponível' : 'Indisponível'}
                  </span>
                </div>
                {product.description && (
                  <p className="text-sm text-text-muted mb-2 break-words">{product.description}</p>
                )}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <p className="text-sm sm:text-base font-bold text-red-strong">
                    Preço: MT {product.price.toFixed(0)}
                  </p>
                  <p className="text-xs text-text-muted">
                    Categoria: {product.category?.name}
                  </p>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => handleToggle(product.id)}
                  className="bg-gold text-black-pure px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-gold-bright transition flex-1 sm:flex-initial whitespace-nowrap"
                >
                  {product.isAvailable ? 'Desativar' : 'Ativar'}
                </button>
                <button
                  onClick={() => {
                    setEditingProduct(product)
                    setShowForm(true)
                  }}
                  className="bg-gold text-black-pure px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-gold-bright transition flex-1 sm:flex-initial whitespace-nowrap"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="bg-red-strong text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-red-dark transition flex-1 sm:flex-initial whitespace-nowrap"
                >
                  Remover
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && searchQuery && (
          <p className="text-text-muted text-center py-8">Nenhum produto encontrado com "{searchQuery}".</p>
        )}
        {filteredProducts.length === 0 && !searchQuery && (
          <p className="text-text-muted text-center py-8">Nenhum produto criado ainda.</p>
        )}
      </div>
    </div>
  )
}

interface Review {
  id: number
  productId: number
  userName: string
  rating: number
  comment: string
  createdAt: Date
  product?: {
    id: number
    name: string
  }
}

function ReviewsSection({ storeId }: { storeId: number }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/reviews')
      if (res.ok) {
        const data = await res.json()
        setReviews(data)
      }
    } catch (err) {
      console.error('Error fetching reviews:', err)
      setError('Erro ao carregar avaliações')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (reviewId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta avaliação?')) {
      return
    }

    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setMessage('Avaliação excluída com sucesso!')
        setError('')
        fetchReviews()
        setTimeout(() => setMessage(''), 3000)
      } else {
        const data = await res.json()
        setError(data.error || 'Erro ao excluir avaliação')
      }
    } catch (err) {
      console.error('Error deleting review:', err)
      setError('Erro ao excluir avaliação')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-white">Carregando avaliações...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white mb-2">Avaliações e Comentários</h2>
        <p className="text-sm text-gray-medium mb-4">
          Gerencie todas as avaliações dos seus produtos. Você pode excluir avaliações inadequadas.
        </p>
      </div>

      {message && (
        <div className="bg-gold bg-opacity-20 border border-gold text-gold px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-dark-red bg-opacity-20 border border-dark-red text-red-300 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-dark-surface rounded-lg border-2 border-dark-border">
          <p className="text-white text-lg mb-2">Nenhuma avaliação ainda</p>
          <p className="text-gray-medium text-sm">
            Quando os clientes avaliarem seus produtos, elas aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-4 w-full max-w-full overflow-x-hidden">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-dark-gray border-2 border-border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow w-full max-w-full overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4 w-full">
                <div className="flex-1 min-w-0 w-full sm:w-auto">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <h3 className="font-bold text-white text-base sm:text-lg break-words">{review.userName}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center">
                        <StarRating rating={review.rating} size="sm" />
                      </div>
                      <span className="text-xs sm:text-sm text-gray-medium">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>

                  {review.product && (
                    <p className="text-xs sm:text-sm text-red-strong font-semibold mb-2 break-words">
                      Produto: {review.product.name}
                    </p>
                  )}

                  <p className="text-sm sm:text-base text-gray-light break-words">{review.comment}</p>
                </div>

                <button
                  onClick={() => handleDelete(review.id)}
                  className="bg-red-strong text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-red-dark transition whitespace-nowrap flex-shrink-0 w-full sm:w-auto"
                  title="Excluir avaliação"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// -------------------------------
// Financeiro
// -------------------------------
type OrderPaymentMethod = 'cash' | 'mpesa' | 'emola' | 'pos'
type OrderStatus =
  | 'pending_approval'
  | 'approved'
  | 'paid'
  | 'preparing'
  | 'ready'
  | 'delivered'
  | 'cancelled'

export interface FinanceOrder {
  id: number
  orderNumber: string
  totalAmount: number
  paymentMethod: OrderPaymentMethod
  status: OrderStatus
  customerName: string
  customerPhone: string
  createdAt: string
}

function FinanceSection({ storeId }: { storeId: number }) {
  const [orders, setOrders] = useState<FinanceOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all')
  const [paymentFilter, setPaymentFilter] = useState<'all' | OrderPaymentMethod>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [filtered, setFiltered] = useState<FinanceOrder[]>([])
  const [revenueData, setRevenueData] = useState<Array<{ date: string; revenue: number; orders: number }>>([])
  const [paymentData, setPaymentData] = useState<Array<{ method: string; amount: number; count: number; percentage: number }>>([])
  const [topProducts, setTopProducts] = useState<Array<{ productId: number; productName: string; quantity: number; revenue: number }>>([])
  const [showCharts, setShowCharts] = useState(true)
  const [minValue, setMinValue] = useState('')
  const [maxValue, setMaxValue] = useState('')
  const [customerFilter, setCustomerFilter] = useState('')
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day')

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders')
        if (res.ok) {
          const data = await res.json()
          setOrders(
            data.map((o: any) => ({
              id: o.id,
              orderNumber: o.orderNumber,
              totalAmount: o.totalAmount,
              paymentMethod: o.paymentMethod,
              status: o.status,
              customerName: o.customerName,
              customerPhone: o.customerPhone,
              createdAt: o.createdAt || new Date().toISOString(),
            }))
          )
        }
      } catch (err) {
        console.error('Erro ao buscar pedidos (financeiro):', err)
        setError('Erro ao carregar pedidos')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
    // Atualizar a cada 15 segundos para manter dados atualizados
    const interval = setInterval(fetchOrders, 15000)
    return () => clearInterval(interval)
  }, [storeId])

  useEffect(() => {
    let list = [...orders]

    if (statusFilter !== 'all') {
      list = list.filter(o => o.status === statusFilter)
    }

    if (paymentFilter !== 'all') {
      list = list.filter(o => o.paymentMethod === paymentFilter)
    }

    if (startDate) {
      const start = new Date(startDate)
      list = list.filter(o => new Date(o.createdAt) >= start)
    }

    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      list = list.filter(o => new Date(o.createdAt) <= end)
    }

    // Filtro por faixa de valor
    if (minValue) {
      const min = parseFloat(minValue)
      if (!isNaN(min)) {
        list = list.filter(o => o.totalAmount >= min)
      }
    }

    if (maxValue) {
      const max = parseFloat(maxValue)
      if (!isNaN(max)) {
        list = list.filter(o => o.totalAmount <= max)
      }
    }

    // Filtro por cliente
    if (customerFilter.trim()) {
      const query = customerFilter.toLowerCase().trim()
      list = list.filter(
        o =>
          o.customerName.toLowerCase().includes(query) ||
          o.customerPhone.includes(query)
      )
    }

    // Ordenar por data desc
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    setFiltered(list)
  }, [orders, statusFilter, paymentFilter, startDate, endDate, minValue, maxValue, customerFilter])

  const totalOrders = filtered.length
  const totalRecebido = filtered
    .filter(o => ['paid', 'preparing', 'ready', 'delivered'].includes(o.status))
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0)
  const totalPendente = filtered
    .filter(o => ['pending_approval', 'approved'].includes(o.status))
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0)

  // Calcular métricas expandidas
  const ticketMedio = calculateAverageTicket(filtered)
  const pedidosPorDia = calculateOrdersPerDay(filtered)
  const taxaConversao = calculateConversionRate(filtered)

  // Calcular dados para gráficos
  useEffect(() => {
    if (filtered.length === 0) {
      setRevenueData([])
      setPaymentData([])
      setTopProducts([])
      return
    }

    // Converter para formato OrderData
    const orderData: OrderData[] = filtered.map(o => ({
      id: o.id,
      orderNumber: o.orderNumber,
      totalAmount: o.totalAmount,
      paymentMethod: o.paymentMethod,
      status: o.status,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      createdAt: o.createdAt,
    }))

    // Calcular receita agrupada
    const revenue = calculateRevenueByDay(orderData) // Por enquanto sempre por dia, pode ser expandido depois
    setRevenueData(revenue)

    // Calcular distribuição por método de pagamento
    const payment = calculatePaymentMethodDistribution(orderData)
    setPaymentData(payment)

    // Calcular produtos mais vendidos
    const fetchOrderItems = async (orderId: number) => {
      try {
        const res = await fetch(`/api/orders/${orderId}/items`)
        if (res.ok) {
          const items = await res.json()
          return items.map((item: any) => ({
            productId: item.productId,
            productName: item.product?.name,
            quantity: item.quantity,
            price: item.price,
          }))
        }
        return []
      } catch (err) {
        console.error(`Erro ao buscar itens do pedido ${orderId}:`, err)
        return []
      }
    }

    calculateTopProducts(orderData, fetchOrderItems).then(products => {
      setTopProducts(products)
    }).catch(err => {
      console.error('Erro ao calcular produtos mais vendidos:', err)
      setTopProducts([])
    })
  }, [filtered])

  const formatStatus = (status: OrderStatus) => {
    switch (status) {
      case 'pending_approval':
        return 'Aguardando aprovação'
      case 'approved':
        return 'Aprovado'
      case 'paid':
        return 'Pago'
      case 'preparing':
        return 'Preparando'
      case 'ready':
        return 'Pronto'
      case 'delivered':
        return 'Entregue'
      case 'cancelled':
        return 'Cancelado'
      default:
        return status
    }
  }

  const formatPayment = (method: OrderPaymentMethod) => {
    switch (method) {
      case 'cash':
        return 'Dinheiro'
      case 'mpesa':
        return 'M-Pesa'
      case 'emola':
        return 'Emola'
      case 'pos':
        return 'POS'
      default:
        return method
    }
  }

  const formatDateShort = (date: string) => {
    const d = new Date(date)
    return d.toLocaleString('pt-MZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12 bg-dark-surface rounded-lg border-2 border-dark-border">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-primary mx-auto mb-4"></div>
          <p className="text-text-light text-lg font-semibold">Carregando dados financeiros...</p>
          <p className="text-text-muted text-sm mt-2">Aguarde enquanto buscamos as informações</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-dark-red bg-opacity-20 border-2 border-dark-red rounded-lg p-6">
          <p className="text-red-300 text-lg font-semibold mb-2">Erro ao carregar dados financeiros</p>
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12 bg-dark-surface rounded-lg border-2 border-dark-border">
          <p className="text-text-light text-lg font-semibold mb-2">Nenhum pedido encontrado</p>
          <p className="text-text-muted text-sm">
            Quando houver pedidos, eles aparecerão aqui com todas as informações financeiras.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Alertas e Notificações */}
      <FinancialAlerts orders={filtered} />

      {/* Cards de resumo expandidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 border-2 border-gold rounded-lg bg-gold bg-opacity-10">
          <p className="text-sm text-gold font-semibold">Total Recebido</p>
          <p className="text-2xl font-bold text-gold">MT {totalRecebido.toFixed(0)}</p>
        </div>
        <div className="p-4 border-2 border-gold rounded-lg bg-gold bg-opacity-10">
          <p className="text-sm text-gold font-semibold">Total Pendente</p>
          <p className="text-2xl font-bold text-gold">MT {totalPendente.toFixed(0)}</p>
        </div>
        <div className="p-4 border-2 border-gold rounded-lg bg-gold bg-opacity-10">
          <p className="text-sm text-gold font-semibold">Pedidos no período</p>
          <p className="text-2xl font-bold text-gold">{totalOrders}</p>
        </div>
        <div className="p-4 border-2 border-gold rounded-lg bg-gold bg-opacity-10">
          <p className="text-sm text-gold font-semibold">Ticket Médio</p>
          <p className="text-2xl font-bold text-gold">MT {ticketMedio.toFixed(0)}</p>
        </div>
        <div className="p-4 border-2 border-gold rounded-lg bg-gold bg-opacity-10">
          <p className="text-sm text-gold font-semibold">Pedidos/Dia</p>
          <p className="text-2xl font-bold text-gold">{pedidosPorDia.toFixed(1)}</p>
        </div>
        <div className="p-4 border-2 border-gold rounded-lg bg-gold bg-opacity-10">
          <p className="text-sm text-gold font-semibold">Taxa Conversão</p>
          <p className="text-2xl font-bold text-gold">{taxaConversao.toFixed(1)}%</p>
        </div>
      </div>

      {/* Botões de ação */}
      <div className="flex justify-end gap-3">
        <ExportReports type="financial" startDate={startDate} endDate={endDate} />
        <button
          onClick={() => setShowCharts(!showCharts)}
          className="bg-dark-gray text-white px-4 py-2 rounded-lg font-semibold hover:bg-gold hover:text-black-pure transition text-sm border border-border"
        >
          {showCharts ? 'Ocultar Gráficos' : 'Mostrar Gráficos'}
        </button>
      </div>

      {/* Gráficos - Lazy Loading */}
      {showCharts && revenueData.length > 0 && (
        <div>
          <FinancialCharts
            revenueData={revenueData}
            paymentData={paymentData}
            topProducts={topProducts}
          />
        </div>
      )}

      {/* Filtros Avançados */}
      <div className="bg-dark-surface p-4 border-2 border-dark-border rounded-lg space-y-4">
        <h3 className="text-lg font-bold text-text-light">Filtros</h3>

        {/* Primeira linha de filtros */}
        <div className="flex flex-wrap gap-3">
          <div>
            <label className="block text-xs font-semibold text-white mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-black-main border-2 border-border rounded-lg text-white text-sm"
            >
              <option value="all">Todos</option>
              <option value="pending_approval">Aguardando aprovação</option>
              <option value="approved">Aprovado</option>
              <option value="paid">Pago</option>
              <option value="preparing">Preparando</option>
              <option value="ready">Pronto</option>
              <option value="delivered">Entregue</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-white mb-1">Método</label>
            <select
              value={paymentFilter}
              onChange={e => setPaymentFilter(e.target.value as any)}
              className="px-3 py-2 bg-black-main border-2 border-border rounded-lg text-white text-sm"
            >
              <option value="all">Todos</option>
              <option value="cash">Dinheiro</option>
              <option value="mpesa">M-Pesa</option>
              <option value="emola">Emola</option>
              <option value="pos">POS</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-white mb-1">Data inicial</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="px-3 py-2 bg-black-main border-2 border-border rounded-lg text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white mb-1">Data final</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="px-3 py-2 bg-black-main border-2 border-border rounded-lg text-white text-sm"
            />
          </div>
        </div>

        {/* Segunda linha de filtros avançados */}
        <div className="flex flex-wrap gap-3">
          <div>
            <label className="block text-xs font-semibold text-text-light mb-1">Valor Mínimo (MT)</label>
            <input
              type="number"
              value={minValue}
              onChange={e => setMinValue(e.target.value)}
              placeholder="0"
              className="px-3 py-2 bg-dark-bg border-2 border-dark-border rounded-lg text-text-light text-sm w-32 focus:outline-none focus:ring-2 focus:ring-gold-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-light mb-1">Valor Máximo (MT)</label>
            <input
              type="number"
              value={maxValue}
              onChange={e => setMaxValue(e.target.value)}
              placeholder="999999"
              className="px-3 py-2 bg-dark-bg border-2 border-dark-border rounded-lg text-text-light text-sm w-32 focus:outline-none focus:ring-2 focus:ring-gold-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-light mb-1">Buscar Cliente</label>
            <input
              type="text"
              value={customerFilter}
              onChange={e => setCustomerFilter(e.target.value)}
              placeholder="Nome ou telefone..."
              className="px-3 py-2 bg-dark-bg border-2 border-dark-border rounded-lg text-text-light text-sm w-48 focus:outline-none focus:ring-2 focus:ring-gold-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white mb-1">Agrupar por</label>
            <select
              value={groupBy}
              onChange={e => setGroupBy(e.target.value as 'day' | 'week' | 'month')}
              className="px-3 py-2 bg-black-main border-2 border-border rounded-lg text-white text-sm"
            >
              <option value="day">Dia</option>
              <option value="week">Semana</option>
              <option value="month">Mês</option>
            </select>
          </div>
        </div>

        {/* Botão para limpar filtros */}
        <div className="flex justify-end">
          <button
            onClick={() => {
              setStatusFilter('all')
              setPaymentFilter('all')
              setStartDate('')
              setEndDate('')
              setMinValue('')
              setMaxValue('')
              setCustomerFilter('')
              setGroupBy('day')
            }}
            className="bg-dark-gray text-white px-4 py-2 rounded-lg font-semibold hover:bg-gold hover:text-black-pure transition text-sm"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Lista de transações - Com paginação */}
      <div className="border-2 border-border rounded-lg overflow-hidden">
        <div className="bg-dark-gray px-4 py-3 border-b border-border font-semibold text-white flex justify-between items-center">
          <span>Transações ({filtered.length})</span>
        </div>
        <div className="divide-y divide-dark-border max-h-[480px] overflow-y-auto bg-dark-surface">
          {filtered.slice(0, 100).map(order => (
            <div key={order.id} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 hover:bg-dark-bg transition">
              <div>
                <p className="font-semibold text-text-light">{order.orderNumber}</p>
                <p className="text-xs text-text-muted">{order.customerName} • {order.customerPhone}</p>
                <p className="text-xs text-text-muted">{formatDateShort(order.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-semibold text-text-light">MT {order.totalAmount.toFixed(0)}</span>
                <span className="text-xs px-2 py-1 rounded bg-dark-gray text-text-light border border-dark-border">{formatPayment(order.paymentMethod)}</span>
                <span className="text-xs px-2 py-1 rounded bg-dark-gray text-text-light border border-dark-border">{formatStatus(order.status)}</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 bg-dark-surface">
              <p className="text-text-light text-lg font-semibold mb-2">Nenhuma transação encontrada</p>
              <p className="text-text-muted text-sm">Ajuste os filtros para ver mais resultados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// -------------------------------
// CRM Clientes
// -------------------------------
interface CustomerSummary {
  customerName: string
  customerPhone: string
  totalSpent: number
  ordersCount: number
  videoUrl?: string
}

function CustomersSection({ storeId }: { storeId: number }) {
  const [orders, setOrders] = useState<FinanceOrder[]>([])
  const [customers, setCustomers] = useState<CustomerSummary[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders')
        if (res.ok) {
          const data = await res.json()
          setOrders(
            data.map((o: any) => ({
              id: o.id,
              orderNumber: o.orderNumber,
              totalAmount: o.totalAmount,
              paymentMethod: o.paymentMethod,
              status: o.status,
              customerName: o.customerName,
              customerPhone: o.customerPhone,
              createdAt: o.createdAt || new Date().toISOString(),
            }))
          )
        }
      } catch (err) {
        console.error('Erro ao buscar pedidos (CRM):', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [storeId])

  useEffect(() => {
    const map = new Map<string, CustomerSummary>()
    orders.forEach(o => {
      if (o.status === 'cancelled') return
      const key = o.customerPhone || o.customerName || String(o.id)
      const current = map.get(key) || { customerName: o.customerName, customerPhone: o.customerPhone, totalSpent: 0, ordersCount: 0 }
      current.totalSpent += o.totalAmount || 0
      current.ordersCount += 1
      current.customerName = current.customerName || o.customerName
      current.customerPhone = current.customerPhone || o.customerPhone
      map.set(key, current)
    })
    let list = Array.from(map.values())
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        (c.customerName || '').toLowerCase().includes(q) ||
        (c.customerPhone || '').toLowerCase().includes(q)
      )
    }
    // order by totalSpent desc
    list.sort((a, b) => b.totalSpent - a.totalSpent)
    setCustomers(list)
  }, [orders, search])

  if (loading) {
    return <p className="text-white">Carregando clientes...</p>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Clientes</h3>
          <p className="text-sm text-gray-medium">Total: {customers.length}</p>
        </div>
        <div className="flex gap-3">
          <ExportReports type="customers" />
          <input
            type="text"
            placeholder="Buscar por nome ou telefone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 bg-black-main border-2 border-border rounded-lg text-white text-sm"
          />
        </div>
      </div>

      <div className="border-2 border-border rounded-lg overflow-hidden">
        <div className="bg-dark-gray px-4 py-3 border-b border-border font-semibold text-white">CRM de Clientes</div>
        <div className="divide-y divide-border max-h-[520px] overflow-y-auto">
          {customers.map((c, idx) => (
            <div
              key={idx}
              className="px-4 py-3 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center hover:bg-black-main cursor-pointer transition"
              onClick={() => setSelectedCustomer(c)}
            >
              <div>
                <p className="font-semibold text-white">{c.customerName || 'Cliente'}</p>
                <p className="text-xs text-gray-medium">{c.customerPhone || '—'}</p>
              </div>
              <div className="text-sm text-white">
                <p className="font-semibold">Total Gasto</p>
                <p className="text-gold font-bold">MT {c.totalSpent.toFixed(0)}</p>
              </div>
              <div className="text-sm text-white">
                <p className="font-semibold">Pedidos</p>
                <p>{c.ordersCount}</p>
              </div>
              <div className="text-xs text-gray-medium flex items-center gap-2">
                {c.videoUrl && (
                  <a
                    href={c.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-gold hover:text-gold-bright font-semibold flex items-center gap-1"
                    title="Ver vídeo do cliente"
                  >
                    🎥 Vídeo
                  </a>
                )}
                <button className="text-gold hover:text-gold-bright font-semibold">
                  Ver detalhes →
                </button>
              </div>
            </div>
          ))}
          {customers.length === 0 && (
            <p className="text-center py-6 text-gray-medium">Nenhum cliente encontrado.</p>
          )}
        </div>
      </div>

      {/* Modal de Detalhes do Cliente */}
      {selectedCustomer && (
        <CustomerDetailModal
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          customerPhone={selectedCustomer.customerPhone}
          customerName={selectedCustomer.customerName}
          totalSpent={selectedCustomer.totalSpent}
          ordersCount={selectedCustomer.ordersCount}
          allOrders={orders}
          videoUrl={selectedCustomer.videoUrl}
        />
      )}
    </div>
  )
}
