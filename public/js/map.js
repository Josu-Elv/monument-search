class MapHandler {
    constructor() {
        this.map = null;
        this.markers = [];
        this.initMap();
    }

    initMap() {
        this.map = L.map('map').setView([40.4165, -3.7026], 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        this.defaultIcon = L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
    }

    clearMarkers() {
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];
    }

    addMarker(monument) {
        if (!monument || !monument.latitude || !monument.longitude) {
            console.warn('Datos de monumento inválidos:', monument);
            return;
        }

        const marker = L.marker([monument.latitude, monument.longitude], {
            icon: this.defaultIcon
        });
        
        const popupContent = `
            <div class="marker-popup">
                <h4>${monument.title}</h4>
                ${monument.type ? `<p><strong>Tipo:</strong> ${monument.type}</p>` : ''}
                ${monument.address ? `<p>${monument.address}</p>` : ''}
            </div>
        `;
        
        marker.bindPopup(popupContent);
        marker.addTo(this.map);
        this.markers.push(marker);
    }

    fitMarkers() {
        if (this.markers.length > 0) {
            const group = L.featureGroup(this.markers);
            this.map.fitBounds(group.getBounds(), {
                padding: [50, 50]
            });
        }
    }
}