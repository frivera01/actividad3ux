document.addEventListener('DOMContentLoaded', () => {

    // --- LÓGICA DEL BUSCADOR PREDICTIVO MEJORADO ---
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    
    // Datos de ejemplo más completos para la búsqueda
    const sampleData = [
        {
            title: 'Impacto de la IA en la Educación Superior',
            authors: 'Dra. Elena Valdés, Dr. Miguel Ángel Rodríguez',
            type: 'Artículo de Investigación',
            date: 'Enero 2025'
        },
        {
            title: 'Nuevos Materiales en Ingeniería Civil',
            authors: 'Dr. Carlos Herrera, Ing. Laura Martínez',
            type: 'Artículo de Investigación',
            date: 'Diciembre 2024'
        },
        {
            title: 'Robótica Aplicada a la Medicina',
            authors: 'Dr. Ana Morales, Dr. Roberto Silva',
            type: 'Artículo de Investigación',
            date: 'Noviembre 2024'
        },
        {
            title: 'Dra. Elena Valdés',
            authors: 'Profesora de Ciencias de la Computación',
            type: 'Autor',
            date: ''
        },
        {
            title: 'Dr. Carlos Herrera',
            authors: 'Profesor de Ingeniería Civil',
            type: 'Autor',
            date: ''
        }
    ];

    let searchTimeout;

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        
        // Limpiar timeout anterior
        clearTimeout(searchTimeout);
        
        // Debounce para mejorar rendimiento
        searchTimeout = setTimeout(() => {
            searchResults.innerHTML = '';
            
            if (query.length > 2) {
                searchResults.classList.remove('search-results-hidden');
                const filteredData = sampleData.filter(item => 
                    item.title.toLowerCase().includes(query) ||
                    item.authors.toLowerCase().includes(query) ||
                    item.type.toLowerCase().includes(query)
                );
                
                if (filteredData.length > 0) {
                    filteredData.forEach(item => {
                        const resultDiv = document.createElement('div');
                        resultDiv.className = 'search-result-item';
                        resultDiv.innerHTML = `
                            <div class="search-result-title">${item.title}</div>
                            <div class="search-result-meta">${item.authors} • ${item.type}</div>
                        `;
                        resultDiv.addEventListener('click', () => {
                            searchInput.value = item.title;
                            searchResults.classList.add('search-results-hidden');
                            // Aquí podrías navegar al artículo o mostrar más detalles
                        });
                        searchResults.appendChild(resultDiv);
                    });
                } else {
                    const noResultsDiv = document.createElement('div');
                    noResultsDiv.className = 'no-results';
                    noResultsDiv.textContent = 'No se encontraron resultados';
                    searchResults.appendChild(noResultsDiv);
                }
            } else {
                searchResults.classList.add('search-results-hidden');
            }
        }, 300);
    });

    // Cerrar resultados de búsqueda al hacer clic fuera
    document.addEventListener('click', (event) => {
        if (!searchInput.contains(event.target) && !searchResults.contains(event.target)) {
            searchResults.classList.add('search-results-hidden');
        }
    });

    // --- LÓGICA DE LA VENTANA MODAL DE CITACIÓN MEJORADA ---
    const modal = document.getElementById('citation-modal');
    const closeButton = document.querySelector('.close-button');
    const citeButtons = document.querySelectorAll('.cite-button');
    const copyButton = document.querySelector('.copy-button');
    const secondaryButton = document.querySelector('.secondary-button');

    // Función para abrir la modal
    const openModal = (event) => {
        const button = event.currentTarget;
        const articleCard = button.closest('.article-card');
        const articleTitle = articleCard.querySelector('h3').textContent;
        const articleAuthors = articleCard.querySelector('p strong').nextSibling.textContent.trim();
        
        // Actualizar contenido de la modal con datos del artículo
        const modalTitle = modal.querySelector('#modal-title');
        const citationText = modal.querySelector('.citation-format p');
        
        modalTitle.textContent = `Citar: ${articleTitle}`;
        citationText.innerHTML = `${articleAuthors} (2025). ${articleTitle}. <em>UNIR Investiga Journal</em>, <em>8</em>(1), 1-15.`;
        
        modal.classList.remove('modal-hidden');
        modal.classList.add('modal');
        modal.setAttribute('aria-hidden', 'false');
        
        // Enfocar el primer botón de la modal
        setTimeout(() => {
            copyButton.focus();
        }, 100);
    };

    // Función para cerrar la modal
    const closeModal = () => {
        modal.classList.add('modal-hidden');
        modal.classList.remove('modal');
        modal.setAttribute('aria-hidden', 'true');
        searchInput.focus(); // Volver el foco al buscador
    };

    // Asignar evento a todos los botones de "Citar"
    citeButtons.forEach(button => {
        button.addEventListener('click', openModal);
    });

    // Asignar evento al botón de cerrar
    closeButton.addEventListener('click', closeModal);

    // Cerrar la modal si se hace clic fuera del contenido
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Cerrar modal con Escape
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !modal.classList.contains('modal-hidden')) {
            closeModal();
        }
    });

    // --- FUNCIÓN DE COPIAR AL PORTAPAPELES ---
    copyButton.addEventListener('click', async () => {
        const citationText = modal.querySelector('.citation-format p').textContent;
        
        try {
            await navigator.clipboard.writeText(citationText);
            
            // Feedback visual
            const originalText = copyButton.innerHTML;
            copyButton.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20,6 9,17 4,12"/>
                </svg>
                ¡Copiado!
            `;
            copyButton.style.backgroundColor = 'var(--success)';
            
            setTimeout(() => {
                copyButton.innerHTML = originalText;
                copyButton.style.backgroundColor = '';
            }, 2000);
        } catch (err) {
            console.error('Error al copiar: ', err);
            // Fallback para navegadores que no soportan clipboard API
            const textArea = document.createElement('textarea');
            textArea.value = citationText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    });

    // --- FUNCIÓN DE DESCARGAR BIBTEX ---
    secondaryButton.addEventListener('click', () => {
        const articleTitle = modal.querySelector('#modal-title').textContent.replace('Citar: ', '');
        const citationText = modal.querySelector('.citation-format p').textContent;
        
        const bibtexEntry = `@article{${articleTitle.toLowerCase().replace(/\s+/g, '_')},
  title={${articleTitle}},
  author={${citationText.split('(')[0].trim()}},
  journal={UNIR Investiga Journal},
  volume={8},
  number={1},
  pages={1--15},
  year={2025}
}`;
        
        const blob = new Blob([bibtexEntry], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${articleTitle.toLowerCase().replace(/\s+/g, '_')}.bib`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // --- MEJORAS DE ACCESIBILIDAD Y UX ---
    
    // Navegación por teclado en resultados de búsqueda
    searchInput.addEventListener('keydown', (event) => {
        const results = searchResults.querySelectorAll('.search-result-item');
        const currentIndex = Array.from(results).findIndex(item => item === document.activeElement);
        
        switch(event.key) {
            case 'ArrowDown':
                event.preventDefault();
                if (currentIndex < results.length - 1) {
                    results[currentIndex + 1].focus();
                } else if (results.length > 0) {
                    results[0].focus();
                }
                break;
            case 'ArrowUp':
                event.preventDefault();
                if (currentIndex > 0) {
                    results[currentIndex - 1].focus();
                } else if (results.length > 0) {
                    results[results.length - 1].focus();
                }
                break;
            case 'Enter':
                if (document.activeElement.classList.contains('search-result-item')) {
                    event.preventDefault();
                    document.activeElement.click();
                }
                break;
        }
    });

    // Hacer los resultados de búsqueda focusables
    searchResults.addEventListener('DOMNodeInserted', (event) => {
        if (event.target.classList && event.target.classList.contains('search-result-item')) {
            event.target.setAttribute('tabindex', '0');
        }
    });

    // --- ANIMACIONES SUAVES PARA TARJETAS ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observar las tarjetas de artículos
    document.querySelectorAll('.article-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(card);
    });

    // --- MEJORAS DE RENDIMIENTO ---
    
    // Lazy loading para imágenes (si se añaden en el futuro)
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // --- ESTADOS DE CARGA ---
    const showLoading = (element) => {
        element.classList.add('loading');
    };

    const hideLoading = (element) => {
        element.classList.remove('loading');
    };

    // --- MANEJO DE ERRORES ---
    window.addEventListener('error', (event) => {
        console.error('Error en la aplicación:', event.error);
        // Aquí podrías mostrar una notificación al usuario
    });

    // --- INICIALIZACIÓN COMPLETA ---
    console.log('UNIR Investiga - Aplicación inicializada correctamente');
});