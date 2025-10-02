const jsonServer = require('json-server');
const server = jsonServer.create();
const path = require('path');
const fs = require('fs');

// Leer el archivo db.json
const dbPath = path.join(process.cwd(), 'public', 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

const router = jsonServer.router(db);
const middlewares = jsonServer.defaults();

// Middleware para CORS
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Middleware personalizado para autenticación
server.use(jsonServer.bodyParser);

// Manejar login
server.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const users = db.users || [];
  const user = users.find(u => u.email === email);
  
  if (user) {
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
});

// Manejar registro
server.post('/api/auth/register', (req, res) => {
  const { firstName, lastName, email, password, role, municipalityId } = req.body;
  
  const users = db.users || [];
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
});

// Reescribir rutas para json-server
server.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    req.url = req.url.replace('/api', '');
  }
  next();
});

server.use(middlewares);
server.use(router);

module.exports = server;

