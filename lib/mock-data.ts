import bcrypt from 'bcryptjs'

export interface User {
  id: number
  name: string
  email: string
  password: string
}

export interface Store {
  id: number
  userId: number
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
}

export interface Category {
  id: number
  storeId: number
  name: string
  description?: string
  orderPosition: number
  parentId?: number | null
}

export interface Product {
  id: number
  categoryId: number
  storeId: number
  name: string
  description?: string
  price: number
  image?: string
  isAvailable: boolean
  isHot?: boolean
  preparationTime?: number
}

export interface Review {
  id: number
  productId: number
  userName: string
  rating: number
  comment: string
  createdAt: Date
}

export interface Table {
  id: number
  storeId: number
  number: number
  isActive: boolean
}

// Dados em memória
let users: User[] = []
let stores: Store[] = []
let categories: Category[] = []
let products: Product[] = []
let reviews: Review[] = []
let tables: Table[] = []

// IDs sequenciais
let userIdCounter = 1
let storeIdCounter = 1
let categoryIdCounter = 1
let productIdCounter = 1
let reviewIdCounter = 1
let tableIdCounter = 1

// Flag para garantir inicialização única
let initialized = false

// Inicializar dados fictícios
export async function initializeMockData() {
  if (initialized) return // Já inicializado

  initialized = true

  // Limpar arrays para evitar duplicatas em hot-reload
  users = []
  stores = []
  categories = []
  products = []
  reviews = []
  tables = []

  // Criar usuário admin
  const hashedPassword = await bcrypt.hash('Celavi123@', 10)
  const admin: User = {
    id: userIdCounter++,
    name: 'Admin CELA VI',
    email: 'celavi@celavi.restaurant',
    password: hashedPassword,
  }
  users.push(admin)

  // Criar loja
  const store: Store = {
    id: storeIdCounter++,
    userId: admin.id,
    name: 'CELA VI',
    slug: 'celavi',
    description: 'Sistema de cardápio digital CELA VI',
    address: 'Quelimane. Av xxx',
    phone: '258 xxx',
    email: 'admin@celavi.com',
    mpesaName: 'CELA VI',
    mpesaPhone: '840000000',
  }
  stores.push(store)

  // --- ESTRUTURA HIERÁRQUICA ---

  // 1. Categorias de Nível 1 (Root)
  const catRecomendados: Category = {
    id: categoryIdCounter++,
    storeId: store.id,
    name: 'Recomendados',
    description: 'Nossas sugestões especiais',
    orderPosition: 0,
    parentId: null
  }
  const catBebidas: Category = {
    id: categoryIdCounter++,
    storeId: store.id,
    name: 'Bebidas',
    description: 'Drinks, refrigerantes e mais',
    orderPosition: 1,
    parentId: null
  }
  const catComida: Category = {
    id: categoryIdCounter++,
    storeId: store.id,
    name: 'Comida',
    description: 'Pratos principais e lanches',
    orderPosition: 2,
    parentId: null
  }

  // 2. Subcategorias de Bebidas (Nível 2)
  const catWhisky: Category = {
    id: categoryIdCounter++,
    storeId: store.id,
    name: 'Whisky',
    orderPosition: 0,
    parentId: catBebidas.id
  }
  const catCocktails: Category = {
    id: categoryIdCounter++,
    storeId: store.id,
    name: 'Cocktails',
    orderPosition: 1,
    parentId: catBebidas.id
  }
  const catCervejas: Category = {
    id: categoryIdCounter++,
    storeId: store.id,
    name: 'Cervejas',
    orderPosition: 2,
    parentId: catBebidas.id
  }

  // 3. Subcategorias de Comida (Nível 2)
  const catSushi: Category = {
    id: categoryIdCounter++,
    storeId: store.id,
    name: 'Sushi',
    orderPosition: 0,
    parentId: catComida.id
  }
  const catHamburgueres: Category = {
    id: categoryIdCounter++,
    storeId: store.id,
    name: 'Hambúrgueres',
    orderPosition: 1,
    parentId: catComida.id
  }
  const catPratoDia: Category = {
    id: categoryIdCounter++,
    storeId: store.id,
    name: 'Prato do Dia',
    orderPosition: 2,
    parentId: catComida.id
  }

  // 4. Subcategorias de Sushi (Nível 3)
  const catMaki: Category = {
    id: categoryIdCounter++,
    storeId: store.id,
    name: 'Maki / Rolos Maki',
    orderPosition: 0,
    parentId: catSushi.id
  }
  const catSashimi: Category = {
    id: categoryIdCounter++,
    storeId: store.id,
    name: 'Sashimi',
    orderPosition: 1,
    parentId: catSushi.id
  }

  categories.push(
    catRecomendados, catBebidas, catComida,
    catWhisky, catCocktails, catCervejas,
    catSushi, catHamburgueres, catPratoDia,
    catMaki, catSashimi
  )

  // Criar produtos
  const produtos: Product[] = [
    // Sushi -> Maki
    {
      id: productIdCounter++,
      categoryId: catMaki.id,
      storeId: store.id,
      name: 'Maki Especial',
      description: 'Rolo de maki com salmão e cream cheese',
      price: 450,
      image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&fit=crop',
      isAvailable: true,
      isHot: false
    },
    // Sushi -> Sashimi
    {
      id: productIdCounter++,
      categoryId: catSashimi.id,
      storeId: store.id,
      name: 'Sashimi Salmão (8pcs)',
      description: 'Fatias frescas de salmão',
      price: 600,
      image: 'https://images.unsplash.com/photo-1534482421-0d45a48d8dbb?w=800&fit=crop',
      isAvailable: true,
      isHot: false
    },
    // Hambúrgueres
    {
      id: productIdCounter++,
      categoryId: catHamburgueres.id,
      storeId: store.id,
      name: 'Hamburger Completo',
      description: 'Carne suculenta, queijo, alface e tomate',
      price: 350,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&fit=crop',
      isAvailable: true,
      isHot: true
    },
    // Bebidas -> Whisky
    {
      id: productIdCounter++,
      categoryId: catWhisky.id,
      storeId: store.id,
      name: 'Black Label',
      description: 'Dose 50ml',
      price: 300,
      image: 'https://images.unsplash.com/photo-1527281473222-793895e41aa9?w=800&fit=crop',
      isAvailable: true,
      isHot: false
    }
  ]

  products.push(...produtos)

  // Reviews base
  reviews.push({
    id: reviewIdCounter++,
    productId: produtos[0].id,
    userName: 'Carlos',
    rating: 5,
    comment: 'Melhor maki da cidade!',
    createdAt: new Date()
  })

  // Mesas
  for (let i = 1; i <= 10; i++) {
    tables.push({
      id: tableIdCounter++,
      storeId: store.id,
      number: i,
      isActive: true
    })
  }
}

// Exportar funções de busca simplificadas para o mockup
export const mockData = {
  users: {
    findByEmail: (email: string) => users.find(u => u.email === email),
    findById: (id: number) => users.find(u => u.id === id),
  },
  stores: {
    findBySlug: (slug: string) => stores.find(s => s.slug === slug),
    findById: (id: number) => stores.find(s => s.id === id),
  },
  categories: {
    findByStoreId: (storeId: number) => categories.filter(c => c.storeId === storeId),
    findById: (id: number) => categories.find(c => c.id === id),
  },
  products: {
    findByStoreId: (storeId: number) => products.filter(p => p.storeId === storeId),
    findByCategoryId: (categoryId: number) => products.filter(p => p.categoryId === categoryId),
    findById: (id: number) => products.find(p => p.id === id),
  },
  reviews: {
    findByProductId: (productId: number) => reviews.filter(r => r.productId === productId),
  },
  tables: {
    findByStoreId: (storeId: number) => tables.filter(t => t.storeId === storeId),
  }
}
