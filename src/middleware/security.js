const logger = require('../config/logger');

class SecurityMiddleware {
    static applySecurityHeaders(res) {
        const headers = {
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Content-Security-Policy': this.getCSP(),
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': '*'
        };

        Object.entries(headers).forEach(([key, value]) => {
            res.setHeader(key, value);
        });

        logger.debug('Headers de seguridad aplicados');
    }

    static getCSP() {
        return [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://unpkg.com",
            "style-src 'self' 'unsafe-inline' https://unpkg.com",
            "img-src 'self' data: https://*.tile.openstreetmap.org https://unpkg.com",
            "connect-src 'self' https://nominatim.openstreetmap.org",
            "font-src 'self'"
        ].join('; ');
    }
}

module.exports = SecurityMiddleware;