const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db'); // <-- db-tiedosto

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Todo-backend toimii! 🚀');
});

// GET
app.get('/api/tehtavat', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tehtavat ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Virhe tietokannassa');
  }
});

// POST
app.post('/api/tehtavat', async (req, res) => {
  const { nimi } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tehtavat (nimi, tehty) VALUES ($1, false) RETURNING *',
      [nimi]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Virhe lisätessä tehtävää');
  }
});

// DELETE
app.delete('/api/tehtavat/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM tehtavat WHERE id = $1', [id]);
    res.status(204).end();
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Virhe poistaessa tehtävää');
  }
});

// PUT
app.put('/api/tehtavat/:id', async (req, res) => {
  const { id } = req.params;
  const { nimi, tehty } = req.body;
  try {
    const result = await pool.query(
      'UPDATE tehtavat SET nimi = $1, tehty = $2 WHERE id = $3 RETURNING *',
      [nimi, tehty, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Virhe päivittäessä tehtävää');
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Palvelin käynnissä portissa ${PORT}`);
});

app.post('/api/init-db', async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tehtavat (
        id SERIAL PRIMARY KEY,
        nimi TEXT NOT NULL,
        tehty BOOLEAN NOT NULL DEFAULT false
      );
    `);
    res.send('Taulu luotu!');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Virhe taulun luonnissa');
  }
});
