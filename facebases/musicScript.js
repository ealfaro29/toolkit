document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos del DOM
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const resultsContainer = document.getElementById('resultsContainer');

    let allMusicCodes =; // Almacenará todos los códigos cargados

    // Cargar los datos del archivo JSON
    fetch('music-codes.json')
       .then(response => response.json())
       .then(data => {
            allMusicCodes = data;
            populateCategories(allMusicCodes);
            renderCodes(allMusicCodes);
        })
       .catch(error => console.error('Error al cargar los códigos de música:', error));

    // Poblar el filtro de categorías dinámicamente
    function populateCategories(codes) {
        const categories =;
        categories.sort().forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    // Renderizar los códigos en el contenedor de resultados
    function renderCodes(codes) {
        resultsContainer.innerHTML = ''; // Limpiar resultados anteriores
        codes.forEach(code => {
            const card = document.createElement('div');
            card.className = 'code-card';
            card.innerHTML = `
                <div>
                    <h3>${code.title}</h3>
                    <p>${code.artist}</p>
                </div>
                <div class="code-id-container">
                    <span class="code-id">${code.id}</span>
                    <button class="copy-btn" data-id="${code.id}">Copiar</button>
                </div>
            `;
            resultsContainer.appendChild(card);
        });
    }

    // Función para filtrar y buscar
    function filterAndSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = categoryFilter.value;

        const filteredCodes = allMusicCodes.filter(code => {
            const matchesCategory = selectedCategory === 'all' |

| code.category === selectedCategory;
            const matchesSearch = code.title.toLowerCase().includes(searchTerm) |

| code.artist.toLowerCase().includes(searchTerm);
            return matchesCategory && matchesSearch;
        });

        renderCodes(filteredCodes);
    }

    // Event listeners para los controles
    searchInput.addEventListener('input', filterAndSearch);
    categoryFilter.addEventListener('change', filterAndSearch);

    // Lógica para copiar al portapapeles (delegación de eventos)
    resultsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('copy-btn')) {
            const idToCopy = event.target.dataset.id;
            navigator.clipboard.writeText(idToCopy).then(() => {
                // Feedback visual para el usuario
                const originalText = event.target.textContent;
                event.target.textContent = '¡Copiado!';
                event.target.classList.add('copied');
                setTimeout(() => {
                    event.target.textContent = originalText;
                    event.target.classList.remove('copied');
                }, 1500);
            }).catch(err => {
                console.error('Error al copiar el ID:', err);
            });
        }
    });
});