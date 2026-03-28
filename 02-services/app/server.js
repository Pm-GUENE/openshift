const express = require('express');
const mysql = require('mysql2');
const app = express();
app.use(express.json());

// Connexion MySQL via le service LAN
const db = mysql.createConnection({
  host: 'service-lan.pmguene-dev.svc.cluster.local',
  user: 'appuser',
  password: 'password123',
  database: 'appdb'
});

db.connect((err) => {
  if (err) {
    console.error('Erreur connexion MySQL:', err);
  } else {
    console.log('Connecte a MySQL!');
    db.query(`CREATE TABLE IF NOT EXISTS utilisateurs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nom VARCHAR(100),
      email VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
  }
});

// Page d'accueil
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur le serveur web - Projet fin de module' });
});

// Lister les utilisateurs
app.get('/users', (req, res) => {
  db.query('SELECT * FROM utilisateurs', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Ajouter un utilisateur
app.post('/users', (req, res) => {
  const { nom, email } = req.body;
  db.query('INSERT INTO utilisateurs (nom, email) VALUES (?, ?)', [nom, email], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId, nom, email });
  });
});

// Statut de la BD
app.get('/status', (req, res) => {
  db.query('SELECT 1', (err) => {
    if (err) return res.json({ server: 'OK', database: 'DOWN' });
    res.json({ server: 'OK', database: 'OK' });
  });
});

app.listen(3000, '0.0.0.0', () => {
  console.log('Serveur Node.js sur le port 3000');
});
