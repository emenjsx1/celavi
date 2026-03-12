
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Erro: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const storeSlug = 'celavi'

const dataToAdd = [
    {
        category: "Whisky calce",
        products: [
            { name: "Jameson Original", price: 500 },
            { name: "Jameson Black Barrel", price: 800 },
            { name: "Jack Daniels Gentlemen", price: 550 },
            { name: "Red Label", price: 350 }
        ]
    },
    {
        category: "Gin garrafa",
        products: [
            { name: "Gordon", price: 1250 },
            { name: "Bombay", price: 4000 },
            { name: "Hendrick", price: 4500 },
            { name: "Inveroche Dry", price: 4000 },
            { name: "Inveroche Verdante", price: 4000 }
        ]
    },
    {
        category: "Garrafas",
        products: [
            { name: "Tanqueray", price: 5500 },
            { name: "Beefeater Pink", price: 3500 },
            { name: "Inveroche Amber", price: 4500 }
        ]
    },
    {
        category: "Charuto",
        products: [
            { name: "Charuto 1750", price: 1750 },
            { name: "Charuto 1500", price: 1500 }
        ]
    },
    {
        category: "Vinhos europeus",
        products: [
            { name: "Esporão Reserva", price: 8000 },
            { name: "Dona Ermelinda", price: 2000 },
            { name: "Casa da Insura Colheita", price: 3500 },
            { name: "Ferreira Porto", price: 3500 },
            { name: "Gazela", price: 2500 },
            { name: "The Chocolate Block", price: 4000 }
        ]
    },
    {
        category: "Vinhos brancos souts",
        products: [
            { name: "Spier", price: 1800 },
            { name: "Constantia", price: 3000 }
        ]
    },
    {
        category: "Shots",
        products: [
            { name: "B52", price: 350 },
            { name: "Blow Job", price: 250 }
        ]
    },
    {
        category: "Espumante",
        products: [
            { name: "Tost Pink", price: 3000 },
            { name: "JC Le Roux", price: 1850 },
            { name: "Monkey", price: 3500 },
            { name: "Gordon Rose", price: 3500 }
        ]
    },
    {
        category: "Licores",
        products: [
            { name: "Martine Tinto Calce", price: 250 },
            { name: "Licor Beirão", price: 250 },
            { name: "Tanqueray", price: 600 }
        ]
    },
    {
        category: "Bebidas",
        products: [
            { name: "Agua das Pedras", price: 200 },
            { name: "Coca Zero", price: 100 },
            { name: "Creme Soda", price: 100 },
            { name: "Sparleta Morango", price: 100 }
        ]
    },
    {
        category: "Vinho tinto south",
        products: [
            { name: "Lanzenac", price: 500 },
            { name: "Noble Hill Reserva", price: 4500 }
        ]
    },
    {
        category: "Caipirinha",
        products: [
            { name: "Caipirinha Morango", price: 450 },
            { name: "Caipirinha Limão", price: 450 },
            { name: "Caipirinha Ananas", price: 450 }
        ]
    },
    {
        category: "Mariscos",
        products: [
            { name: "Lulas grelhadas com coco fumado", price: 1500 },
            { name: "Polvo assado gourmet", price: 1500 }
        ]
    },
    {
        category: "Pasta e risoto",
        products: [
            { name: "Rigatone a lla puttanesca", price: 1300 }
        ]
    },
    {
        category: "Entrada",
        products: [
            { name: "Cesto folhado de camarão", price: 620 }
        ]
    }
]

async function addProducts() {
    const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('id')
        .eq('slug', storeSlug)
        .single()

    if (storeError) {
        console.error('❌ Erro ao buscar loja:', storeError)
        return
    }

    const storeId = store.id

    for (const item of dataToAdd) {
        // Buscar ou criar categoria
        let { data: category, error: catError } = await supabase
            .from('categories')
            .select('id')
            .eq('store_id', storeId)
            .eq('name', item.category)
            .single()

        if (catError && catError.code !== 'PGRST116') {
            console.error(`❌ Erro ao buscar categoria ${item.category}:`, catError)
            continue
        }

        if (!category) {
            console.log(`📂 Criando categoria: ${item.category}`)
            const { data: newCat, error: createCatError } = await supabase
                .from('categories')
                .insert({
                    store_id: storeId,
                    name: item.category,
                    order_position: 100 // Posição alta para ficar no fim ou ser ajustada depois
                })
                .select()
                .single()

            if (createCatError) {
                console.error(`❌ Erro ao criar categoria ${item.category}:`, createCatError)
                continue
            }
            category = newCat
        }

        // Adicionar produtos
        for (const prod of item.products) {
            console.log(`🍔 Adicionando produto: ${prod.name} na categoria ${item.category}`)
            const { error: prodError } = await supabase
                .from('products')
                .insert({
                    store_id: storeId,
                    category_id: category.id,
                    name: prod.name,
                    price: prod.price,
                    is_available: true,
                    preparation_time: 15
                })

            if (prodError) {
                console.error(`❌ Erro ao adicionar produto ${prod.name}:`, prodError)
            }
        }
    }

    console.log('✅ Todos os produtos foram processados!')
}

addProducts()
