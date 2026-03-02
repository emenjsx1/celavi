'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import StarRating from '@/components/StarRating'
import DripSeparator from '@/components/DripSeparator'
import Cart, { CartItem } from '@/components/Cart'
import CheckoutModal from '@/components/CheckoutModal'
import PaymentModal from '@/components/PaymentModal'
import CallAttendantButton from '@/components/CallAttendantButton'

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
  category: Category
}

interface Review {
  id: number
  productId: number
  userName: string
  rating: number
  comment: string
  createdAt: Date
}

// Emojis para categorias principais
const CATEGORY_ICONS: Record<string, string> = {
  bebidas: '🍹',
  drinks: '🍹',
  cocktails: '🍸',
  cervejas: '🍺',
  refrigerantes: '🥤',
  comida: '🍽️',
  food: '🍽️',
  entradas: '🥗',
  pratos: '🍲',
  sobremesas: '🍰',
  recomendados: '⭐',
  default_drink: '🥂',
  default_food: '🍴',
}

const getCategoryEmoji = (name: string): string => {
  const lower = name.toLowerCase()
  for (const key of Object.keys(CATEGORY_ICONS)) {
    if (lower.includes(key)) return CATEGORY_ICONS[key]
  }
  // Guess by common words
  if (lower.includes('beb') || lower.includes('drink') || lower.includes('bar')) return '🍹'
  if (lower.includes('com') || lower.includes('prat') || lower.includes('food')) return '🍽️'
  return '🍴'
}

// Helper function para formatar datas de forma consistente
const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

// Tipos de vista de navegação
type NavView = 'main-categories' | 'sub-categories' | 'products'

export default function LojaPage() {
  const params = useParams()
  const slug = params.slug as string
  const [store, setStore] = useState<Store | null>(null)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMainCategory, setSelectedMainCategory] = useState<Category | null>(null)
  const [selectedSubCategory, setSelectedSubCategory] = useState<Category | null>(null)
  const [navView, setNavView] = useState<NavView>('main-categories')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [reviewCount, setReviewCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [newReview, setNewReview] = useState({ userName: '', rating: 0, comment: '' })
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [checkoutData, setCheckoutData] = useState<{ customerName: string; customerPhone: string; tableId: number } | null>(null)
  const router = useRouter()

  // Forçar zoom fixo de 85% em mobile
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      const viewport = document.querySelector('meta[name="viewport"]')
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=0.85, maximum-scale=0.85, minimum-scale=0.85, user-scalable=no')
      }
    }
  }, [])

  useEffect(() => {
    fetchStore()
  }, [slug])

  useEffect(() => {
    if (selectedProduct) {
      fetchReviews(selectedProduct.id)
    }
  }, [selectedProduct])

  // Filtrar produtos baseado na busca e disponibilidade
  useEffect(() => {
    const available = allProducts.filter((p) => p.isAvailable)

    if (!searchQuery.trim()) {
      setFilteredProducts(available)
      return
    }

    const query = searchQuery.toLowerCase().trim()
    const filtered = available.filter((product) => {
      const nameMatch = product.name.toLowerCase().includes(query)
      const descMatch = product.description?.toLowerCase().includes(query) || false
      return nameMatch || descMatch
    })
    setFilteredProducts(filtered)
  }, [searchQuery, allProducts])

  const fetchStore = async () => {
    try {
      const res = await fetch(`/api/stores/${slug}`)
      const data = await res.json()

      if (res.ok && !data.error) {
        data.categories.sort((a: any, b: any) => a.orderPosition - b.orderPosition)
        setStore(data)
        // Começa na vista de categorias principais
        setNavView('main-categories')
      } else {
        setStore(null)
      }
    } catch (err) {
      console.error('Error fetching store:', err)
      setStore(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchProductsForCategory = async (categoryId: number, categoryName?: string) => {
    setLoadingProducts(true)
    try {
      const isRecomendados = categoryName === 'Recomendados'
      if (isRecomendados) {
        const res = await fetch(`/api/stores/${slug}/products`)
        if (res.ok) {
          const data = await res.json()
          const hotProducts = data.filter((p: Product) => p.isHot === true && p.isAvailable === true)
          setAllProducts(hotProducts)
          setFilteredProducts(hotProducts)
        }
      } else {
        const res = await fetch(`/api/stores/${slug}/products?categoria=${categoryId}`)
        if (res.ok) {
          const data = await res.json()
          setAllProducts(data)
          setFilteredProducts(data)
        }
      }
    } catch (err) {
      console.error('Error fetching products:', err)
    } finally {
      setLoadingProducts(false)
    }
  }

  const fetchReviews = async (productId: number) => {
    try {
      const res = await fetch(`/api/products/${productId}/reviews`)
      if (res.ok) {
        const data = await res.json()
        setReviews(data.reviews || [])
        setAverageRating(data.averageRating || 0)
        setReviewCount(data.reviewCount || 0)
      }
    } catch (err) {
      console.error('Error fetching reviews:', err)
    }
  }

  // --- Handlers de navegação ---

  const handleSelectMainCategory = (category: Category) => {
    setSelectedMainCategory(category)
    setSelectedSubCategory(null)
    setSearchQuery('')

    if (!store) return
    const subs = store.categories.filter(c => c.parentId === category.id)

    if (subs.length === 0) {
      // Categoria sem subcategorias → vai direto para produtos
      setNavView('products')
      fetchProductsForCategory(category.id, category.name)
    } else {
      // Tem subcategorias → mostra o segundo nível
      setNavView('sub-categories')
    }
  }

  const handleSelectSubCategory = (sub: Category) => {
    setSelectedSubCategory(sub)
    setSearchQuery('')
    setNavView('products')
    fetchProductsForCategory(sub.id, sub.name)
  }

  const handleGoBack = () => {
    setSearchQuery('')
    if (navView === 'products' && selectedSubCategory) {
      // Volta para subcategorias
      setSelectedSubCategory(null)
      setNavView('sub-categories')
    } else {
      // Volta para categorias principais
      setSelectedMainCategory(null)
      setSelectedSubCategory(null)
      setNavView('main-categories')
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct || !newReview.userName || !newReview.comment || newReview.rating === 0) {
      return
    }

    try {
      const res = await fetch(`/api/products/${selectedProduct.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview),
      })

      if (res.ok) {
        setNewReview({ userName: '', rating: 0, comment: '' })
        fetchReviews(selectedProduct.id)
      }
    } catch (err) {
      console.error('Error submitting review:', err)
    }
  }

  // --- Carrinho ---
  const addToCart = (product: Product) => {
    const existingItem = cartItems.find(item => item.productId === product.id)
    if (existingItem) {
      updateCartItem(product.id, { quantity: existingItem.quantity + 1 })
    } else {
      setCartItems([...cartItems, {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
        notes: '',
      }])
    }
    setIsCartOpen(true)
  }

  const updateCartItem = (productId: number, updates: Partial<CartItem>) => {
    setCartItems(cartItems.map(item =>
      item.productId === productId ? { ...item, ...updates } : item
    ))
  }

  const removeCartItem = (productId: number) => {
    setCartItems(cartItems.filter(item => item.productId !== productId))
  }

  const handleCheckoutContinue = (data: { customerName: string; customerPhone: string; tableId: number }) => {
    try {
      setCheckoutData(data)
      setIsCheckoutOpen(false)
      setTimeout(() => {
        setIsPaymentOpen(true)
      }, 100)
    } catch (error) {
      console.error('Erro ao continuar checkout:', error)
    }
  }

  const handlePaymentComplete = async (paymentMethod: 'cash' | 'mpesa' | 'emola' | 'pos', receiptFile?: File) => {
    if (!checkoutData || !store) return

    try {
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeSlug: store.slug,
          tableId: checkoutData.tableId,
          customerName: checkoutData.customerName,
          customerPhone: checkoutData.customerPhone,
          paymentMethod,
          items: cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            notes: item.notes,
          })),
        }),
      })

      if (!orderRes.ok) {
        const error = await orderRes.json()
        throw new Error(error.error || 'Erro ao criar pedido')
      }

      const order = await orderRes.json()

      if (receiptFile && (paymentMethod === 'mpesa' || paymentMethod === 'emola')) {
        const formData = new FormData()
        formData.append('file', receiptFile)
        formData.append('order_id', order.id.toString())
        formData.append('payment_method', paymentMethod)

        const receiptRes = await fetch('/api/payments/receipt', {
          method: 'POST',
          body: formData,
        })

        if (receiptRes.ok) {
          const receipt = await receiptRes.json()
          await fetch(`/api/orders/${order.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ receiptId: receipt.id }),
          })
        }
      }

      setCartItems([])
      setIsPaymentOpen(false)
      setIsCartOpen(false)
      router.push(`/loja/${store.slug}/pedidos?phone=${encodeURIComponent(checkoutData.customerPhone)}`)
    } catch (error: any) {
      console.error('Error completing payment:', error)
      alert(error.message || 'Erro ao processar pedido. Tente novamente.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black-main">
        <p className="text-white">Carregando...</p>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black-main">
        <p className="text-white">Loja não encontrada</p>
      </div>
    )
  }

  const mainCategories = store.categories.filter(c => !c.parentId)
  const subCategories = selectedMainCategory
    ? store.categories.filter(c => c.parentId === selectedMainCategory.id)
    : []

  return (
    <div className="min-h-screen bg-black-main">
      {/* Header */}
      <header className="bg-black-main border-b-2 border-border py-4">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-between items-center mb-3 gap-2">
            <div className="flex items-center gap-2">
              {store && (
                <CallAttendantButton
                  storeId={store.id}
                  tableId={checkoutData?.tableId || 1}
                  customerName={checkoutData?.customerName}
                  customerPhone={checkoutData?.customerPhone}
                  storeSlug={store.slug}
                  variant="inline"
                />
              )}
              <button
                onClick={() => router.push(`/loja/${store.slug}/pedidos`)}
                className="bg-gold text-black-pure px-3 py-1.5 rounded-lg font-semibold hover:bg-gold-bright transition text-xs"
              >
                Ver Histórico de Pedidos
              </button>
            </div>
            <button
              onClick={() => setIsCartOpen(true)}
              className="bg-gold text-black-pure px-3 py-1.5 rounded-lg font-semibold hover:bg-gold-bright transition text-xs relative"
            >
              🛒 Carrinho
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-dark-red text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
          <div className="text-center">
            <img
              src="/logo-cela-vi-beira.png"
              alt={store.name}
              className="h-14 w-auto mx-auto mb-2 object-contain"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
            <p className="text-lg font-semibold text-gold">NOSSO MAGNIFICO CARDÁPIO</p>
          </div>
        </div>
      </header>

      <DripSeparator topColor="bg-black-main" bottomColor="bg-dark-gray" height="h-10" />

      {/* Barra de Navegação (breadcrumb + botão voltar) */}
      {navView !== 'main-categories' && (
        <div className="bg-dark-gray sticky top-0 z-40 border-b border-border">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
            <button
              onClick={handleGoBack}
              className="flex items-center gap-1.5 text-gold hover:text-gold-bright transition-colors font-semibold text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar
            </button>
            <div className="flex items-center gap-1.5 text-sm text-gray-light overflow-x-auto scrollbar-hide whitespace-nowrap">
              <span
                className="text-gold cursor-pointer hover:underline"
                onClick={() => { setNavView('main-categories'); setSelectedMainCategory(null); setSelectedSubCategory(null) }}
              >
                Cardápio
              </span>
              {selectedMainCategory && (
                <>
                  <span className="opacity-50">/</span>
                  <span
                    className={`cursor-pointer hover:underline ${!selectedSubCategory ? 'text-white font-semibold' : 'text-gold'}`}
                    onClick={() => {
                      if (subCategories.length > 0) {
                        setSelectedSubCategory(null)
                        setNavView('sub-categories')
                      }
                    }}
                  >
                    {selectedMainCategory.name}
                  </span>
                </>
              )}
              {selectedSubCategory && (
                <>
                  <span className="opacity-50">/</span>
                  <span className="text-white font-semibold">{selectedSubCategory.name}</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-4xl mx-auto px-4 py-8">

        {/* ====== NÍVEL 1: Categorias Principais ====== */}
        {navView === 'main-categories' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 text-center">O que vai querer?</h2>
            <p className="text-gray-light text-center text-sm mb-8">Escolha uma categoria para explorar o cardápio</p>
            <div className="grid grid-cols-2 gap-4">
              {mainCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleSelectMainCategory(cat)}
                  className="group relative bg-dark-gray border-2 border-border rounded-2xl p-6 flex flex-col items-center gap-3 hover:border-gold hover:bg-dark-surface transition-all duration-200 cursor-pointer overflow-hidden"
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gold opacity-0 group-hover:opacity-5 transition-opacity duration-200 rounded-2xl" />
                  <span className="text-5xl drop-shadow-lg">{getCategoryEmoji(cat.name)}</span>
                  <span className="text-white font-bold text-base text-center group-hover:text-gold transition-colors">
                    {cat.name}
                  </span>
                  {cat.description && (
                    <span className="text-gray-light text-xs text-center line-clamp-2">{cat.description}</span>
                  )}
                  <div className="flex items-center gap-1 text-gold text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Ver opções</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ====== NÍVEL 2: Subcategorias ====== */}
        {navView === 'sub-categories' && selectedMainCategory && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {getCategoryEmoji(selectedMainCategory.name)} {selectedMainCategory.name}
            </h2>
            {selectedMainCategory.description && (
              <p className="text-gray-light text-sm mb-6">{selectedMainCategory.description}</p>
            )}
            {!selectedMainCategory.description && <div className="mb-6" />}
            <p className="text-gray-light text-sm mb-5">Selecione uma subcategoria</p>
            <div className="grid grid-cols-2 gap-4">
              {subCategories.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => handleSelectSubCategory(sub)}
                  className="group relative bg-dark-gray border-2 border-border rounded-2xl p-5 flex flex-col items-center gap-3 hover:border-gold hover:bg-dark-surface transition-all duration-200 cursor-pointer overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gold opacity-0 group-hover:opacity-5 transition-opacity duration-200 rounded-2xl" />
                  <span className="text-4xl drop-shadow-lg">{getCategoryEmoji(sub.name)}</span>
                  <span className="text-white font-bold text-sm text-center group-hover:text-gold transition-colors">
                    {sub.name}
                  </span>
                  {sub.description && (
                    <span className="text-gray-light text-xs text-center line-clamp-2">{sub.description}</span>
                  )}
                  <div className="flex items-center gap-1 text-gold text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Ver produtos</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ====== NÍVEL 3: Produtos ====== */}
        {navView === 'products' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {selectedSubCategory
                ? `${getCategoryEmoji(selectedSubCategory.name)} ${selectedSubCategory.name}`
                : selectedMainCategory
                  ? `${getCategoryEmoji(selectedMainCategory.name)} ${selectedMainCategory.name}`
                  : 'Produtos'}
            </h2>
            {(selectedSubCategory?.description || selectedMainCategory?.description) && (
              <p className="text-gray-light text-sm mb-4">
                {selectedSubCategory?.description || selectedMainCategory?.description}
              </p>
            )}
            {!(selectedSubCategory?.description || selectedMainCategory?.description) && <div className="mb-4" />}

            {/* Campo de Busca */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔍 Buscar produtos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-12 border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold bg-dark-gray text-white text-lg"
                />
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-light opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-light opacity-50 hover:opacity-100 text-xl"
                  >
                    ✕
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="text-white opacity-80 mt-2 text-sm">
                  {filteredProducts.length} produto(s) encontrado(s)
                </p>
              )}
            </div>

            {/* Loading */}
            {loadingProducts ? (
              <div className="text-center py-16">
                <div className="inline-block w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-gray-light text-sm">A carregar produtos...</p>
              </div>
            ) : filteredProducts.filter(p => p.isAvailable).length > 0 ? (
              <div className="space-y-4">
                {filteredProducts
                  .filter(p => p.isAvailable)
                  .map((product) => (
                    <div
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className="bg-dark-gray border-2 border-border rounded-xl p-4 cursor-pointer hover:border-gold hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex items-start gap-4">
                        {product.image && (
                          <div className="flex-shrink-0">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-24 h-24 object-cover rounded-lg"
                              loading="lazy"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-lg font-bold text-white">{product.name}</h3>
                            {product.isHot && (
                              <span className="text-xs bg-dark-red text-white px-2 py-0.5 rounded-full font-semibold shrink-0">
                                🔥 Hot
                              </span>
                            )}
                          </div>
                          {product.description && (
                            <p className="text-gray-light text-sm mt-1 line-clamp-2">{product.description}</p>
                          )}
                          <div className="flex items-center justify-between mt-3">
                            <p className="text-lg font-bold text-gold">
                              MT {product.price.toFixed(0)}
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                addToCart(product)
                              }}
                              className="bg-gold text-black-pure px-4 py-1.5 rounded-lg font-semibold hover:bg-gold-bright transition text-sm"
                            >
                              + Adicionar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">😔</p>
                <p className="text-white font-semibold">Nenhum produto disponível</p>
                <p className="text-gray-light text-sm mt-1">Tente outra categoria</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal de Detalhes e Avaliações */}
      {selectedProduct && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-dark-gray rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b-2 border-border bg-gold">
              <h2 className="text-xl font-bold text-white">{selectedProduct.name}</h2>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-white hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {selectedProduct.image && (
              <div className="w-full h-64 bg-gray-100">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-6">
              <div className="mb-6">
                <p className="text-2xl font-bold text-gold mb-2">
                  MT {selectedProduct.price.toFixed(0)}
                </p>
                {selectedProduct.description && (
                  <p className="text-gray-light">{selectedProduct.description}</p>
                )}
                <button
                  onClick={() => {
                    addToCart(selectedProduct)
                    setSelectedProduct(null)
                  }}
                  className="w-full mt-4 bg-gold text-black-pure py-2.5 rounded-lg font-bold hover:bg-gold-bright transition-colors text-sm"
                >
                  + Adicionar ao Carrinho
                </button>
              </div>

              <div className="border-t-2 border-border pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <StarRating rating={averageRating} size="md" />
                  <span className="text-white text-sm">
                    {averageRating > 0 ? averageRating.toFixed(1) : 'Sem avaliações'} ({reviewCount})
                  </span>
                </div>

                <div className="bg-gold bg-opacity-10 rounded-lg p-4 mb-6 border border-border">
                  <h4 className="font-semibold text-white mb-3">Deixe sua avaliação</h4>
                  <form onSubmit={handleSubmitReview} className="space-y-3">
                    <input
                      type="text"
                      placeholder="Seu nome"
                      value={newReview.userName}
                      onChange={(e) => setNewReview({ ...newReview, userName: e.target.value })}
                      className="w-full px-3 py-2 bg-black-main border-2 border-border rounded text-white focus:outline-none focus:ring-2 focus:ring-gold"
                      required
                    />
                    <div>
                      <label className="block text-sm text-white mb-1 font-semibold">Avaliação</label>
                      <StarRating
                        rating={newReview.rating}
                        interactive={true}
                        onRatingChange={(rating) => setNewReview({ ...newReview, rating })}
                      />
                    </div>
                    <textarea
                      placeholder="Seu comentário..."
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 bg-black-main border-2 border-border rounded text-white focus:outline-none focus:ring-2 focus:ring-gold"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full bg-gold text-black-pure py-2 rounded font-semibold hover:bg-gold-bright transition-colors"
                    >
                      Enviar Avaliação
                    </button>
                  </form>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-white">Avaliações ({reviewCount})</h4>
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review.id} className="border-b border-border pb-4 last:border-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-white">{review.userName}</p>
                            <StarRating rating={review.rating} size="sm" />
                          </div>
                          <span className="text-xs text-gray-medium opacity-70">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-light mt-2 text-sm">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-medium text-center py-4 text-sm">
                      Ainda não há avaliações. Seja o primeiro!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <DripSeparator topColor="bg-dark-gray" bottomColor="bg-black-main" height="h-12" />

      {/* Footer */}
      <footer className="bg-black-main text-white py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4 mb-6">
            <div className="text-center md:text-left">
              <img
                src="/logo-cela-vi-beira.png"
                alt={store.name}
                className="h-12 md:h-14 w-auto mx-auto md:mx-0 mb-2 object-contain"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            </div>
            <div className="flex flex-col items-center md:items-end gap-2">
              <div className="flex gap-2">
                {store.facebookUrl && (
                  <a href={store.facebookUrl} target="_blank" rel="noopener noreferrer"
                    className="bg-dark-gray text-gold p-2 rounded-lg hover:bg-gold hover:text-black-pure transition-colors flex items-center justify-center"
                    aria-label="Facebook">
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                )}
                {store.instagramUrl && (
                  <a href={store.instagramUrl} target="_blank" rel="noopener noreferrer"
                    className="bg-dark-gray text-gold p-2 rounded-lg hover:bg-gold hover:text-black-pure transition-colors flex items-center justify-center"
                    aria-label="Instagram">
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                )}
                {store.whatsappUrl && (
                  <a href={store.whatsappUrl} target="_blank" rel="noopener noreferrer"
                    className="bg-dark-gray text-gold p-2 rounded-lg hover:bg-gold hover:text-black-pure transition-colors flex items-center justify-center"
                    aria-label="WhatsApp">
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="text-center pt-4 border-t border-border">
            <p className="text-xs opacity-80">Cardápio Digital © 2025</p>
            <p className="text-[10px] opacity-60 mt-1">Feito por Handerson Chemane</p>
          </div>
        </div>
      </footer>

      {/* Componentes de Carrinho e Checkout */}
      <Cart
        items={cartItems}
        onUpdateItem={updateCartItem}
        onRemoveItem={removeCartItem}
        onCheckout={() => {
          setIsCartOpen(false)
          setIsCheckoutOpen(true)
        }}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        storeSlug={store.slug}
        onContinue={handleCheckoutContinue}
      />

      {checkoutData && (
        <PaymentModal
          isOpen={isPaymentOpen}
          onClose={() => {
            setIsPaymentOpen(false)
            setCheckoutData(null)
          }}
          items={cartItems}
          total={cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)}
          customerName={checkoutData.customerName}
          customerPhone={checkoutData.customerPhone}
          tableId={checkoutData.tableId}
          mpesaName={store.mpesaName}
          mpesaPhone={store.mpesaPhone}
          emolaName={store.emolaName}
          emolaPhone={store.emolaPhone}
          onPaymentComplete={handlePaymentComplete}
        />
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

    </div>
  )
}
