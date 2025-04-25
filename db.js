require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Tämä tarvitaan Renderissä, muuten yhteys ei onnistu
  },
});

pool.query('SELECT NOW()') //testataan saako pool yhteyden tietokantaan
  .then(res => console.log('DB yhteys OK:', res.rows[0]))
  .catch(err => console.error('DB YHTEYS VIRHE:', err));

module.exports = pool;
