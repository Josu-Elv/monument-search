const https = require('https');
const logger = require('../config/logger');
const { Monument } = require('../models');

class OSMService {
    async searchMonuments(query) {
        logger.info(`Buscando monumentos para: ${query}`);

        const url = new URL('https://nominatim.openstreetmap.org/search');
        url.searchParams.set('q', query);
        url.searchParams.set('format', 'json');
        url.searchParams.set('addressdetails', '1');
        url.searchParams.set('category', 'historic,tourism');

        try {
            const results = await this.makeRequest(url);
            const processedResults = this.processResults(results);
            logger.info(`Encontrados ${processedResults.length} resultados`);
            return processedResults;
        } catch (error) {
            logger.error('Error en la búsqueda de OSM:', error);
            throw error;
        }
    }

    makeRequest(url) {
        return new Promise((resolve, reject) => {
            const options = {
                headers: {
                    'User-Agent': 'MonumentSearchApp/1.0',
                    'Accept-Language': 'es'
                },
                timeout: 5000
            };

            https.get(url, options, (response) => {
                let data = '';
                response.on('data', chunk => data += chunk);
                response.on('end', () => {
                    try {
                        const results = JSON.parse(data);
                        resolve(results);
                    } catch (error) {
                        logger.error('Error procesando respuesta:', error);
                        reject(error);
                    }
                });
            }).on('error', (error) => {
                logger.error('Error en la petición HTTP:', error);
                reject(error);
            });
        });
    }

    processResults(results) {
        if (!Array.isArray(results)) {
            logger.error('Los resultados no son un array');
            return [];
        }

        return results.map(item => {
            try {
                return {
                    title: item.display_name.split(',')[0].trim(),
                    address: item.display_name,
                    latitude: parseFloat(item.lat),
                    longitude: parseFloat(item.lon),
                    type: item.type || 'Monumento',
                    osmId: `${item.osm_type}/${item.osm_id}`
                };
            } catch (error) {
                logger.error('Error procesando resultado individual:', error);
                return null;
            }
        }).filter(item => 
            item !== null && 
            !isNaN(item.latitude) && 
            !isNaN(item.longitude)
        );
    }
}

module.exports = new OSMService();