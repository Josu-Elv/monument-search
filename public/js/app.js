class MonumentSearch {
    constructor() {
        this.form = document.getElementById('searchForm');
        this.input = document.getElementById('searchInput');
        this.results = document.getElementById('results');
        this.map = new MapHandler();
        
        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSearch(e));
    }

    async handleSearch(e) {
        e.preventDefault();
        const query = this.input.value.trim();
        if (!query) return;

        try {
            this.setLoading(true);
            const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Resultados recibidos:', data);

            if (!Array.isArray(data)) {
                throw new Error('Formato de datos inválido');
            }

            this.displayResults(data);
            
            this.map.clearMarkers();
            data.forEach(monument => {
                if (monument.latitude && monument.longitude) {
                    this.map.addMarker(monument);
                }
            });
            this.map.fitMarkers();

        } catch (error) {
            console.error('Error:', error);
            this.results.innerHTML = '<div class="error">Error al buscar monumentos</div>';
        } finally {
            this.setLoading(false);
        }
    }

    displayResults(results) {
        if (!Array.isArray(results) || results.length === 0) {
            this.results.innerHTML = '<div class="no-results">No se encontraron resultados</div>';
            return;
        }

        this.results.innerHTML = results.map(item => `
            <div class="monument-item">
                <h3>${this.escapeHtml(item.title)}</h3>
                ${item.type ? `<p class="type"><strong>Tipo:</strong> ${this.escapeHtml(item.type)}</p>` : ''}
                ${item.address ? `<p class="address">${this.escapeHtml(item.address)}</p>` : ''}
                <p class="coordinates">
                    Lat: ${item.latitude.toFixed(6)}, 
                    Lon: ${item.longitude.toFixed(6)}
                </p>
            </div>
        `).join('');
    }

    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    setLoading(isLoading) {
        this.loading = isLoading;
        const button = this.form.querySelector('button');
        button.disabled = isLoading;
        button.textContent = isLoading ? 'Buscando...' : 'Buscar';
        
        if (isLoading) {
            this.results.innerHTML = '<div class="loading">Buscando monumentos...</div>';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MonumentSearch();
});