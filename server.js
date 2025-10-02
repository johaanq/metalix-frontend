const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('public/db.json');
const middlewares = jsonServer.defaults();

// Middleware para CORS
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Middleware de autenticación
server.use((req, res, next) => {
  // Manejar login
  if (req.method === 'POST' && req.path === '/auth/login') {
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
  
  // Manejar registro
  if (req.method === 'POST' && req.path === '/auth/register') {
    const { firstName, lastName, email, password, role, municipalityId } = req.body;
    
    // Generar nuevo ID
    const users = require('./public/db.json').users;
    const newId = (users.length + 1).toString();
    
    const newUser = {
      id: newId,
      email: email,
      firstName: firstName,
      lastName: lastName,
      role: role,
      municipalityId: municipalityId || null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rfidCard: role === 'CITIZEN' ? `RFID${newId.padStart(3, '0')}` : null,
      totalPoints: role === 'CITIZEN' ? 0 : null
    };
    
    res.json(newUser);
    return;
  }
  
  next();
});

server.use(middlewares);
server.use(router);

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Metalix API Server running on http://localhost:${PORT}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   - Users: http://localhost:${PORT}/users`);
  console.log(`   - Login: http://localhost:${PORT}/auth/login`);
  console.log(`   - Register: http://localhost:${PORT}/auth/register`);
  console.log(`   - All other endpoints from db.json`);
});