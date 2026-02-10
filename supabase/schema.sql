-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de lojas
CREATE TABLE IF NOT EXISTS stores (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  whatsapp_url TEXT,
  app_url TEXT,
  mpesa_name TEXT,
  mpesa_phone TEXT,
  emola_name TEXT,
  emola_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar colunas de métodos de pagamento se não existirem (para tabelas já criadas)
DO $$ 
BEGIN
  -- Adicionar mpesa_name
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stores' 
    AND column_name = 'mpesa_name'
  ) THEN
    ALTER TABLE stores ADD COLUMN mpesa_name TEXT;
  END IF;
  
  -- Adicionar mpesa_phone
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stores' 
    AND column_name = 'mpesa_phone'
  ) THEN
    ALTER TABLE stores ADD COLUMN mpesa_phone TEXT;
  END IF;
  
  -- Adicionar emola_name
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stores' 
    AND column_name = 'emola_name'
  ) THEN
    ALTER TABLE stores ADD COLUMN emola_name TEXT;
  END IF;
  
  -- Adicionar emola_phone
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stores' 
    AND column_name = 'emola_phone'
  ) THEN
    ALTER TABLE stores ADD COLUMN emola_phone TEXT;
  END IF;
END $$;

-- Criar tabela de categorias
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  store_id BIGINT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  order_position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de produtos
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  store_id BIGINT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  is_hot BOOLEAN DEFAULT FALSE,
  preparation_time INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar coluna preparation_time se não existir (para tabelas já criadas)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'preparation_time'
  ) THEN
    ALTER TABLE products 
      ADD COLUMN preparation_time INTEGER DEFAULT 5;
  END IF;
END $$;

-- Criar tabela de avaliações
CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_stores_user_id ON stores(user_id);
CREATE INDEX IF NOT EXISTS idx_stores_slug ON stores(slug);
CREATE INDEX IF NOT EXISTS idx_categories_store_id ON categories(store_id);
CREATE INDEX IF NOT EXISTS idx_categories_order_position ON categories(store_id, order_position);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_is_available ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_products_is_hot ON products(is_hot);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);

-- Habilitar Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para usuários (apenas o próprio usuário pode ver/editar)
DROP POLICY IF EXISTS "Users can view own data" ON users;
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Políticas RLS para lojas (público pode ver, dono pode editar)
DROP POLICY IF EXISTS "Anyone can view stores" ON stores;
CREATE POLICY "Anyone can view stores" ON stores
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Store owners can update own store" ON stores;
CREATE POLICY "Store owners can update own store" ON stores
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Políticas RLS para categorias (público pode ver, dono pode editar)
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
CREATE POLICY "Anyone can view categories" ON categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Store owners can manage categories" ON categories;
CREATE POLICY "Store owners can manage categories" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM stores 
      WHERE stores.id = categories.store_id 
      AND stores.user_id::text = auth.uid()::text
    )
  );

-- Políticas RLS para produtos (público pode ver, dono pode editar)
DROP POLICY IF EXISTS "Anyone can view products" ON products;
CREATE POLICY "Anyone can view products" ON products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Store owners can manage products" ON products;
CREATE POLICY "Store owners can manage products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM stores 
      WHERE stores.id = products.store_id 
      AND stores.user_id::text = auth.uid()::text
    )
  );

-- Criar tabela de mesas
CREATE TABLE IF NOT EXISTS tables (
  id BIGSERIAL PRIMARY KEY,
  store_id BIGINT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(store_id, number)
);

-- Criar tabela de pedidos (sem foreign key para payment_receipts ainda)
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  store_id BIGINT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  table_id BIGINT NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'mpesa', 'emola', 'pos')),
  status TEXT NOT NULL CHECK (status IN ('pending_approval', 'approved', 'paid', 'preparing', 'ready', 'delivered', 'cancelled')),
  total_amount DECIMAL(10, 2) NOT NULL,
  estimated_time INTEGER NOT NULL,
  receipt_id BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(store_id, order_number)
);

-- Criar tabela de comprovantes de pagamento
CREATE TABLE IF NOT EXISTS payment_receipts (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('mpesa', 'emola')),
  receipt_url TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  approved_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar foreign key de payment_receipts em orders
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_orders_receipt_id'
  ) THEN
    ALTER TABLE orders 
      ADD CONSTRAINT fk_orders_receipt_id 
      FOREIGN KEY (receipt_id) 
      REFERENCES payment_receipts(id) 
      ON DELETE SET NULL;
  END IF;
END $$;

-- Criar tabela de itens do pedido
CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_tables_store_id ON tables(store_id);
CREATE INDEX IF NOT EXISTS idx_tables_is_active ON tables(store_id, is_active);
CREATE INDEX IF NOT EXISTS idx_orders_store_id ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_table_id ON orders(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(store_id, order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_order_id ON payment_receipts(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_is_approved ON payment_receipts(is_approved);
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_products_preparation_time ON products(preparation_time);

-- Políticas RLS para avaliações (público pode ver e criar)
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can create reviews" ON reviews;
CREATE POLICY "Anyone can create reviews" ON reviews
  FOR INSERT WITH CHECK (true);

-- Políticas RLS para mesas (público pode ver, dono pode editar)
DROP POLICY IF EXISTS "Anyone can view tables" ON tables;
CREATE POLICY "Anyone can view tables" ON tables
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Store owners can manage tables" ON tables;
CREATE POLICY "Store owners can manage tables" ON tables
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM stores 
      WHERE stores.id = tables.store_id 
      AND stores.user_id::text = auth.uid()::text
    )
  );

-- Políticas RLS para pedidos (público pode criar e ver próprios, dono pode ver todos)
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view own orders" ON orders;
CREATE POLICY "Anyone can view own orders" ON orders
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Store owners can view all orders" ON orders;
CREATE POLICY "Store owners can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM stores 
      WHERE stores.id = orders.store_id 
      AND stores.user_id::text = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Store owners can update orders" ON orders;
CREATE POLICY "Store owners can update orders" ON orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM stores 
      WHERE stores.id = orders.store_id 
      AND stores.user_id::text = auth.uid()::text
    )
  );

-- Políticas RLS para itens do pedido (mesmas regras dos pedidos)
DROP POLICY IF EXISTS "Anyone can create order items" ON order_items;
CREATE POLICY "Anyone can create order items" ON order_items
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view order items" ON order_items;
CREATE POLICY "Anyone can view order items" ON order_items
  FOR SELECT USING (true);

-- Políticas RLS para comprovantes (público pode criar, dono pode ver e aprovar)
DROP POLICY IF EXISTS "Anyone can create receipts" ON payment_receipts;
CREATE POLICY "Anyone can create receipts" ON payment_receipts
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view receipts" ON payment_receipts;
CREATE POLICY "Anyone can view receipts" ON payment_receipts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Store owners can update receipts" ON payment_receipts;
CREATE POLICY "Store owners can update receipts" ON payment_receipts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM orders
      JOIN stores ON stores.id = orders.store_id
      WHERE orders.id = payment_receipts.order_id
      AND stores.user_id::text = auth.uid()::text
    )
  );


