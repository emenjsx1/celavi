const { getStoreBySlug, getCategoriesByStoreId } = require('./lib/db-supabase')
const dotenv = require('dotenv')
dotenv.config({ path: '.env.local' })

async function test() {
    const store = await getStoreBySlug('celavi')
    console.log('Store ID:', store?.id)
    if (store) {
        const categories = await getCategoriesByStoreId(store.id)
        const roots = categories.filter(c => !c.parentId)
        console.log('Root Categories:', roots.map(c => `${c.name} (${c.id})`))
        const sushis = categories.filter(c => c.name === 'Sushi')
        console.log('Sushi category found:', sushis.length > 0)
        if (sushis.length > 0) {
            const children = categories.filter(c => c.parentId === sushis[0].id)
            console.log('Sushi children count:', children.length)
        }
    }
}

test()
