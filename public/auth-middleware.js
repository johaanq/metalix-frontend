// Middleware simplificado para json-server beta
const express = require('express');
const router = express.Router();

// Middleware para manejar autenticación
router.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Buscar usuario por email
  const users = require('./public/db.json').users;
  const user = users.find(u => u.email === email);
  
  if (user) {
    // Simular validación de contraseña (en producción sería hash)
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

// Middleware para manejar registro
router.post('/auth/register', (req, res) => {
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
});

module.exports = router;
