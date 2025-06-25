const jwt = require('jsonwebtoken');

// PUBLIC_INTERFACE
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Authorization header missing' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token missing' });
  jwt.verify(token, process.env.JWT_SECRET, (err, userData) => {
    if (err) return res.status(401).json({ message: 'Invalid/expired token' });
    req.user = userData;
    next();
  });
}

module.exports = { authenticateToken };
