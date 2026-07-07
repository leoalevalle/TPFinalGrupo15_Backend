const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];

    if (!bearerHeader) {
        return res.status(401).json({ error: 'Acceso denegado. Token no suministrado.' });
    }

    try {
        const token = bearerHeader.split(' ')[1];
        const verificado = jwt.verify(token, 'PALABRA_SECRETA_TAXFEM_2026');
        req.userId = verificado.idUsuario; 
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Token inválido o expirado.' });
    }
};

module.exports = { verifyToken };