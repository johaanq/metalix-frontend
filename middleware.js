// Middleware simplificado para json-server
module.exports = (req, res, next) => {
  console.log('Middleware ejecutado:', req.method, req.path);
  
  // Manejar login
  if (req.method === 'POST' && req.path === '/auth/login') {
    console.log('Procesando login...');
    const { email, password } = req.body;
    
    // Buscar usuario por email
    const users = require('./public/db.json').users;
    const user = users.find(u => u.email === email);
    
    if (user) {
      // Simular validación de contraseña
      if (password === 'password123' || password === 'admin123') {
        const token = `token_${user.id}_${Date.now()}`;
        res.json({
          user: user,
          token: token
        });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } else {
      res.status(401).json({ error: 'User not found' });
    }
    return;
  }
  
  // Continuar con el comportamiento normal de json-server
  next();
};