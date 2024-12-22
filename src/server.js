const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const url = require('url');
const osmService = require('./services/osmService');
const logger = require('./config/logger');
const rateLimit = require('./middleware/rateLimit');
const security = require('./middleware/security');
const db = require('./models');
const { Monument } = db;

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
    logger.info(`${req.method} ${req.url}`);

    security.applySecurityHeaders(res);
    
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    const clientIP = req.socket.remoteAddress;
    if (!rateLimit.checkLimit(clientIP)) {
        logger.warn(`Rate limit excedido para IP: ${clientIP}`);
        res.writeHead(429, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Demasiadas peticiones' }));
        return;
    }

    try {
        if (pathname === '/api/search') {
            await handleSearch(req, res, parsedUrl.query);
            return;
        }

        await handleStaticFiles(req, res, pathname);
    } catch (error) {
        logger.error('Error en el servidor:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error interno del servidor' }));
    }
});

async function handleSearch(req, res, query) {
    if (!query.query) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Parámetro de búsqueda requerido' }));
        return;
    }

    try {
        const results = await osmService.searchMonuments(query.query);
        
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify(results));
    } catch (error) {
        logger.error('Error en búsqueda:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error en la búsqueda' }));
    }
}

async function handleStaticFiles(req, res, pathname) {
    try {
        let filePath;
        if (pathname === '/') {
            filePath = path.join(__dirname, '../public/index.html');
        } else {
            filePath = path.join(__dirname, '../public', pathname);
        }

        const content = await fs.readFile(filePath);
        const ext = path.extname(filePath);
        const contentType = getContentType(ext);

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    } catch (error) {
        if (error.code === 'ENOENT') {
            logger.warn(`Archivo no encontrado: ${pathname}`);
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
        } else {
            throw error;
        }
    }
}

function getContentType(ext) {
    const contentTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.ico': 'image/x-icon'
    };
    return contentTypes[ext] || 'text/plain';
}

async function initializeServer() {
    try {
        await db.sequelize.sync();
        logger.info('Base de datos sincronizada');

        server.listen(PORT, () => {
            logger.info(`Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        logger.error('Error inicializando el servidor:', error);
        process.exit(1);
    }
}

initializeServer();