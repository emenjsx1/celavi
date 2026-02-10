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
    facebookUrl: 'https://facebook.com/celavi',
    instagramUrl: 'https://instagram.com/celavi',
    whatsappUrl: 'https://wa.me/258840000000',
    appUrl: 'https://play.google.com/store/apps/details?id=com.celavi',
  }
  stores.push(store)

  // Criar categorias conforme o cardápio
  const catHamburgueres: Category = {
    id: categoryIdCounter++,
    storeId: store.id,
    name: 'Hambúrgueres',
    description: 'Hambúrgueres deliciosos',
    orderPosition: 1,
  }
  const catFrango: Category = {
    id: categoryIdCounter++,
    storeId: store.id,
    name: 'Frango',
    description: 'Nossos deliciosos frangos',
    orderPosition: 2,
  }
  const catOutros: Category = {
    id: categoryIdCounter++,
    storeId: store.id,
    name: 'Outros pratos salgados',
    description: 'Outros pratos salgados',
    orderPosition: 3,
  }
  const catBebidas: Category = {
    id: categoryIdCounter++,
    storeId: store.id,
    name: 'Bebidas (chás e refrigerantes)',
    description: 'Bebidas geladas',
    orderPosition: 4,
  }
  const catAlcoolica: Category = {
    id: categoryIdCounter++,
    storeId: store.id,
    name: 'Bebida alcoólica',
    description: 'Bebidas alcoólicas',
    orderPosition: 5,
  }
  const catSnacks: Category = {
    id: categoryIdCounter++,
    storeId: store.id,
    name: 'Snacks',
    description: 'Snacks e petiscos',
    orderPosition: 6,
  }
  const catRecomendados: Category = {
    id: categoryIdCounter++,
    storeId: store.id,
    name: 'Recomendados',
    description: 'Produtos mais populares',
    orderPosition: 0, // Primeira posição
  }
  categories.push(catRecomendados, catHamburgueres, catFrango, catOutros, catBebidas, catAlcoolica, catSnacks)

  // Criar produtos COM IMAGENS - baseado no cardápio fornecido
  const produtos: Product[] = [
    // Hambúrgueres
    {
      id: productIdCounter++,
      categoryId: catHamburgueres.id,
      storeId: store.id,
      name: 'Hamburger completo',
      description: 'Hambúrguer completo com todos os acompanhamentos',
      price: 320,
      image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&h=600&fit=crop',
      isAvailable: true,
      isHot: true,
      preparationTime: 15,
    },
    {
      id: productIdCounter++,
      categoryId: catHamburgueres.id,
      storeId: store.id,
      name: 'Hamburger de frango',
      description: 'Hambúrguer de frango grelhado',
      price: 220,
      image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800&h=600&fit=crop',
      isAvailable: true,
    },
    {
      id: productIdCounter++,
      categoryId: catHamburgueres.id,
      storeId: store.id,
      name: 'Hamburger de orleães',
      description: 'Hambúrguer estilo orleães',
      price: 220,
      image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&h=600&fit=crop',
      isAvailable: true,
    },
    // Frango
    {
      id: productIdCounter++,
      categoryId: catFrango.id,
      storeId: store.id,
      name: 'Frango assado',
      description: 'Frango assado inteiro, suculento e temperado',
      price: 550,
      image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&h=600&fit=crop',
      isAvailable: true,
      isHot: true,
    },
    {
      id: productIdCounter++,
      categoryId: catFrango.id,
      storeId: store.id,
      name: 'Frango orleães',
      description: 'Frango estilo orleães',
      price: 650,
      image: 'https://images.unsplash.com/photo-1608039829577-7c2f5aa5d4e3?w=800&h=600&fit=crop',
      isAvailable: true,
      isHot: true,
    },
    {
      id: productIdCounter++,
      categoryId: catFrango.id,
      storeId: store.id,
      name: 'Asa de coxa',
      description: 'Asa de coxa frita, crocante por fora',
      price: 160,
      image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&h=600&fit=crop',
      isAvailable: true,
    },
    {
      id: productIdCounter++,
      categoryId: catFrango.id,
      storeId: store.id,
      name: 'Asa de orleães',
      description: 'Asa de frango estilo orleães',
      price: 150,
      image: 'https://images.unsplash.com/photo-1608039829577-7c2f5aa5d4e3?w=800&h=600&fit=crop',
      isAvailable: true,
    },
    {
      id: productIdCounter++,
      categoryId: catFrango.id,
      storeId: store.id,
      name: 'Frango de pipoca',
      description: 'Frango de pipoca crocante',
      price: 95,
      image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&h=600&fit=crop',
      isAvailable: true,
    },
    // Outros pratos salgados
    {
      id: productIdCounter++,
      categoryId: catOutros.id,
      storeId: store.id,
      name: 'Empadas de carne de vaca',
      description: 'Empadas recheadas com carne de vaca',
      price: 180,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop',
      isAvailable: true,
    },
    {
      id: productIdCounter++,
      categoryId: catOutros.id,
      storeId: store.id,
      name: 'Batata grande frita',
      description: 'Porção grande de batata frita crocante',
      price: 120,
      image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&h=600&fit=crop',
      isAvailable: true,
    },
    {
      id: productIdCounter++,
      categoryId: catOutros.id,
      storeId: store.id,
      name: 'Arroz frito',
      description: 'Arroz frito temperado',
      price: 220,
      image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop',
      isAvailable: true,
    },
    {
      id: productIdCounter++,
      categoryId: catOutros.id,
      storeId: store.id,
      name: 'Massa chinesa',
      description: 'Massa chinesa tradicional',
      price: 320,
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop',
      isAvailable: true,
    },
    {
      id: productIdCounter++,
      categoryId: catOutros.id,
      storeId: store.id,
      name: 'Dumplings',
      description: 'Dumplings tradicionais',
      price: 280,
      image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop',
      isAvailable: true,
    },
    {
      id: productIdCounter++,
      categoryId: catOutros.id,
      storeId: store.id,
      name: 'Sopas de massas e carne de vaca',
      description: 'Sopa de massas com carne de vaca',
      price: 350,
      image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=600&fit=crop',
      isAvailable: true,
    },
    // Bebidas (chás e refrigerantes)
    {
      id: productIdCounter++,
      categoryId: catBebidas.id,
      storeId: store.id,
      name: 'Chá de leite manga',
      description: 'Chá de leite com sabor de manga',
      price: 120,
      image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&h=600&fit=crop',
      isAvailable: true,
    },
    {
      id: productIdCounter++,
      categoryId: catBebidas.id,
      storeId: store.id,
      name: 'Chá de maracujá',
      description: 'Chá refrescante de maracujá',
      price: 120,
      image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&h=600&fit=crop',
      isAvailable: true,
    },
    {
      id: productIdCounter++,
      categoryId: catBebidas.id,
      storeId: store.id,
      name: 'Chá de uva',
      description: 'Chá de uva gelado',
      price: 120,
      image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&h=600&fit=crop',
      isAvailable: true,
    },
    {
      id: productIdCounter++,
      categoryId: catBebidas.id,
      storeId: store.id,
      name: 'Chá de leite e pérola',
      description: 'Chá de leite com pérolas',
      price: 150,
      image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&h=600&fit=crop',
      isAvailable: true,
    },
    {
      id: productIdCounter++,
      categoryId: catBebidas.id,
      storeId: store.id,
      name: 'Chá de ananás',
      description: 'Chá de ananás refrescante',
      price: 120,
      image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&h=600&fit=crop',
      isAvailable: true,
    },
    {
      id: productIdCounter++,
      categoryId: catBebidas.id,
      storeId: store.id,
      name: 'Chá de limão',
      description: 'Chá de limão gelado',
      price: 60,
      image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&h=600&fit=crop',
      isAvailable: true,
    },
    {
      id: productIdCounter++,
      categoryId: catBebidas.id,
      storeId: store.id,
      name: 'Coca-Cola',
      description: 'Refrigerante Coca-Cola gelado',
      price: 60,
      image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800&h=600&fit=crop',
      isAvailable: true,
    },
    {
      id: productIdCounter++,
      categoryId: catBebidas.id,
      storeId: store.id,
      name: 'Sprite',
      description: 'Refrigerante Sprite gelado',
      price: 60,
      image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800&h=600&fit=crop',
      isAvailable: true,
    },
    {
      id: productIdCounter++,
      categoryId: catBebidas.id,
      storeId: store.id,
      name: 'Fanta',
      description: 'Refrigerante Fanta gelado',
      price: 60,
      image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800&h=600&fit=crop',
      isAvailable: true,
    },
    // Bebida alcoólica
    {
      id: productIdCounter++,
      categoryId: catAlcoolica.id,
      storeId: store.id,
      name: 'Heineken',
      description: 'Cerveja Heineken gelada',
      price: 100,
      image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800&h=600&fit=crop',
      isAvailable: true,
    },
    // Snacks
    {
      id: productIdCounter++,
      categoryId: catSnacks.id,
      storeId: store.id,
      name: 'Pipoca doce',
      description: 'Pipoca doce crocante',
      price: 50,
      image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&h=600&fit=crop',
      isAvailable: true,
    },
    {
      id: productIdCounter++,
      categoryId: catSnacks.id,
      storeId: store.id,
      name: 'Amendoim frito',
      description: 'Amendoim frito temperado',
      price: 120,
      image: 'https://images.unsplash.com/photo-1606914469633-bdbf70ea4a91?w=800&h=600&fit=crop',
      isAvailable: true,
    },
  ]
  products.push(...produtos)

  // Criar algumas avaliações de exemplo
  reviews.push(
    {
      id: reviewIdCounter++,
      productId: produtos[3].id, // Frango assado
      userName: 'Maria Silva',
      rating: 5,
      comment: 'Delicioso! Frango muito crocante e suculento. Recomendo!',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: reviewIdCounter++,
      productId: produtos[3].id,
      userName: 'João Santos',
      rating: 4,
      comment: 'Muito bom, mas poderia ter mais tempero.',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: reviewIdCounter++,
      productId: produtos[0].id, // Hamburger completo
      userName: 'Ana Costa',
      rating: 5,
      comment: 'Perfeito! Sempre peço quando venho aqui.',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    }
  )

  // Criar mesas de exemplo (10 mesas)
  for (let i = 1; i <= 10; i++) {
    tables.push({
      id: tableIdCounter++,
      storeId: store.id,
      number: i,
      isActive: true,
    })
  }
}

// Funções de acesso aos dados
export const mockData = {
  users: {
    findById: (id: number) => users.find((u) => u.id === id),
    findByEmail: (email: string) => users.find((u) => u.email === email),
    create: (data: Omit<User, 'id'>) => {
      const user: User = { id: userIdCounter++, ...data }
      users.push(user)
      return user
    },
    getAll: () => users,
  },
  stores: {
    findById: (id: number) => stores.find((s) => s.id === id),
    findBySlug: (slug: string) => stores.find((s) => s.slug === slug),
    findByUserId: (userId: number) => stores.find((s) => s.userId === userId),
    create: (data: Omit<Store, 'id'>) => {
      const store: Store = { id: storeIdCounter++, ...data }
      stores.push(store)
      return store
    },
    update: (id: number, data: Partial<Store>) => {
      const index = stores.findIndex((s) => s.id === id)
      if (index !== -1) {
        stores[index] = { ...stores[index], ...data }
        return stores[index]
      }
      return null
    },
    getAll: () => stores,
  },
  categories: {
    findById: (id: number) => categories.find((c) => c.id === id),
    findByStoreId: (storeId: number) =>
      categories.filter((c) => c.storeId === storeId).sort((a, b) => a.orderPosition - b.orderPosition),
    create: (data: Omit<Category, 'id'>) => {
      const category: Category = { id: categoryIdCounter++, ...data }
      categories.push(category)
      return category
    },
    update: (id: number, data: Partial<Category>) => {
      const index = categories.findIndex((c) => c.id === id)
      if (index !== -1) {
        categories[index] = { ...categories[index], ...data }
        return categories[index]
      }
      return null
    },
    delete: (id: number) => {
      const index = categories.findIndex((c) => c.id === id)
      if (index !== -1) {
        categories.splice(index, 1)
        // Remover produtos da categoria
        products = products.filter((p) => p.categoryId !== id)
        return true
      }
      return false
    },
    getAll: () => categories,
  },
  products: {
    findById: (id: number) => products.find((p) => p.id === id),
    findByCategoryId: (categoryId: number) =>
      products.filter((p) => p.categoryId === categoryId),
    findByStoreId: (storeId: number) => products.filter((p) => p.storeId === storeId),
    create: (data: Omit<Product, 'id'>) => {
      const product: Product = { id: productIdCounter++, ...data }
      products.push(product)
      return product
    },
    update: (id: number, data: Partial<Product>) => {
      const index = products.findIndex((p) => p.id === id)
      if (index !== -1) {
        products[index] = { ...products[index], ...data }
        return products[index]
      }
      return null
    },
    delete: (id: number) => {
      const index = products.findIndex((p) => p.id === id)
      if (index !== -1) {
        products.splice(index, 1)
        return true
      }
      return false
    },
    getAll: () => products,
  },
  reviews: {
    findById: (id: number) => reviews.find((r) => r.id === id),
    findByProductId: (productId: number) =>
      reviews.filter((r) => r.productId === productId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    create: (data: Omit<Review, 'id' | 'createdAt'>) => {
      const review: Review = {
        id: reviewIdCounter++,
        ...data,
        createdAt: new Date(),
      }
      reviews.push(review)
      return review
    },
    delete: (id: number) => {
      const index = reviews.findIndex((r) => r.id === id)
      if (index !== -1) {
        reviews.splice(index, 1)
        return true
      }
      return false
    },
    getAverageRating: (productId: number) => {
      const productReviews = reviews.filter((r) => r.productId === productId)
      if (productReviews.length === 0) return 0
      const sum = productReviews.reduce((acc, r) => acc + r.rating, 0)
      return sum / productReviews.length
    },
    getCount: (productId: number) => {
      return reviews.filter((r) => r.productId === productId).length
    },
  },
  tables: {
    findById: (id: number) => tables.find((t) => t.id === id),
    findByStoreId: (storeId: number, activeOnly: boolean = false) => {
      let result = tables.filter((t) => t.storeId === storeId)
      if (activeOnly) {
        result = result.filter((t) => t.isActive)
      }
      return result.sort((a, b) => a.number - b.number)
    },
    findByNumber: (storeId: number, number: number) =>
      tables.find((t) => t.storeId === storeId && t.number === number),
    create: (data: Omit<Table, 'id'>) => {
      const table: Table = { id: tableIdCounter++, ...data }
      tables.push(table)
      return table
    },
    update: (id: number, data: Partial<Table>) => {
      const index = tables.findIndex((t) => t.id === id)
      if (index !== -1) {
        tables[index] = { ...tables[index], ...data }
        return tables[index]
      }
      return null
    },
    delete: (id: number) => {
      const index = tables.findIndex((t) => t.id === id)
      if (index !== -1) {
        tables.splice(index, 1)
        return true
      }
      return false
    },
    getAll: () => tables,
  },
}
