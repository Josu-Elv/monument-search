const logger = require('../config/logger');

class RateLimiter {
    constructor() {
        this.requests = new Map();
        this.windowMs = 15 * 60 * 1000; // 15 minutos
        this.maxRequests = 100; // máximo de solicitudes por ventana
        
        // Limpiar periódicamente las solicitudes antiguas
        setInterval(() => this.cleanup(), this.windowMs);
    }

    checkLimit(clientIP) {
        const now = Date.now();
        const windowStart = now - this.windowMs;
        const requestTimestamps = this.requests.get(clientIP) || [];
        const validRequests = requestTimestamps.filter(timestamp => timestamp > windowStart);

        if (validRequests.length >= this.maxRequests) {
            logger.warn(`Rate limit excedido para IP: ${clientIP}`);
            return false;
        }

        validRequests.push(now);
        this.requests.set(clientIP, validRequests);
        return true;
    }

    cleanup() {
        const now = Date.now();
        const windowStart = now - this.windowMs;
        
        for (const [ip, timestamps] of this.requests.entries()) {
            const validTimestamps = timestamps.filter(ts => ts > windowStart);
            if (validTimestamps.length === 0) {
                this.requests.delete(ip);
            } else {
                this.requests.set(ip, validTimestamps);
            }
        }
    }
}

module.exports = new RateLimiter();