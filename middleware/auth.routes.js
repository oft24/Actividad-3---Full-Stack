const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/constants'); // Asegúrate de definir JWT_SECRET en constants.js

function authenticateToken(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Acceso denegado' });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Token no válido' });
  }
}

module.exports = { authenticateToken };
