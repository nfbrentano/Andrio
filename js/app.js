const produtos = [
    { id: 1, nome: "Sofá Premium Bauhaus", preco: "R$ 2.499,90", categoria: "sofa", img: "assets/pana_06.png" },
    { id: 2, nome: "Poltrona Design Confort", preco: "R$ 1.199,90", categoria: "poltrona", img: "assets/pana_07.png" },
    { id: 3, nome: "Mesa de Centro Rústica", preco: "R$ 799,90", categoria: "mesa", img: "assets/02.jpg" }
];

const catalogo = document.getElementById('catalogo');
const filterBtns = document.querySelectorAll('.filter-btn');

function renderizarProdutos(categoria = 'all') {
    catalogo.innerHTML = ''; 
    
    const produtosFiltrados = categoria === 'all' 
        ? produtos 
        : produtos.filter(p => p.categoria === categoria);

    if (produtosFiltrados.length === 0) {
        catalogo.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--cor-texto-secundario);">Nenhum produto encontrado nesta categoria.</p>';
        return;
    }

    produtosFiltrados.forEach((produto, index) => {
        const card = document.createElement('div');
        card.className = 'ag-card';
        // Add staggered animation delay
        card.style.animationDelay = `${index * 0.1}s`;
        card.innerHTML = `
            <div class="img-container">
                <img src="${produto.img}" alt="${produto.nome}" loading="lazy">
            </div>
            <h3>${produto.nome}</h3>
            <p class="price">${produto.preco}</p>
            <button class="ag-btn-primary">Ver Detalhes</button>
        `;
        catalogo.appendChild(card);
    });
}

filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        renderizarProdutos(e.target.dataset.category);
    });
});

// Renderização inicial
document.addEventListener('DOMContentLoaded', () => {
    renderizarProdutos();
});
