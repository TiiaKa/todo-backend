require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Tämä tarvitaan Renderissä, muuten yhteys ei onnistu
  },
});

module.exports = pool;
