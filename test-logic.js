
const categories = [
    { id: 1, name: 'Bebidas', parentId: null },
    { id: 2, name: 'Comida', parentId: null },
    { id: 3, name: 'Sushi', parentId: 2 },
    { id: 4, name: 'Maki', parentId: 3 },
    { id: 5, name: 'Sashimi', parentId: 3 },
    { id: 6, name: 'Cervejas', parentId: 1 },
];

const products = [
    { id: 101, name: 'Maki Especial', categoryId: 4 },
    { id: 102, name: 'Sashimi Salmão', categoryId: 5 },
    { id: 103, name: 'Draft Beer', categoryId: 6 },
];

function getVisibleCategories(navPath) {
    const currentLevelId = navPath.length > 0 ? navPath[navPath.length - 1].id : null;
    return categories.filter(c => (currentLevelId === null ? !c.parentId : c.parentId === currentLevelId));
}

console.log('--- TESTE DE NAVEGAÇÃO ---');

let path = [];
console.log('Nível 0 (Raiz):', getVisibleCategories(path).map(c => c.name));

path.push(categories.find(c => c.name === 'Comida'));
console.log('Nível 1 (Comida):', getVisibleCategories(path).map(c => c.name));

path.push(categories.find(c => c.name === 'Sushi'));
console.log('Nível 2 (Sushi):', getVisibleCategories(path).map(c => c.name));

path.push(categories.find(c => c.name === 'Maki'));
const visible = getVisibleCategories(path);
console.log('Nível 3 (Maki):', visible.map(c => c.name));
if (visible.length === 0) {
    console.log('>> MOSTRANDO PRODUTOS DA CATEGORIA MAKI');
}

console.log('--- FIM DO TESTE ---');
