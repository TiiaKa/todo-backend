const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db'); // <-- db-tiedosto

const app = express();
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
  res.send('Todo-backend toimii!');
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
// tehtävien resetointi
app.post('/api/tehtavat', async (req, res) => {
  console.log('POST body:', req.body);
  const { nimi, deadline, tags, kategoria } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tehtavat (nimi, tehty, deadline, tags, kategoria) VALUES ($1, false, $2, $3, $4) RETURNING *',
      [nimi, deadline, tags, kategoria]
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
  const { nimi, tehty, deadline, tags, kategoria } = req.body;
  try {
    const result = await pool.query(
      'UPDATE tehtavat SET nimi = $1, tehty = $2, deadline = $3, tags = $4, kategoria = $5 WHERE id = $6 RETURNING *',
      [nimi, tehty, deadline, tags, kategoria, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Virhe päivittäessä tehtävää');
  }
});

app.post('/api/tehtavat/reset', async (req, res) => {
  try {
    await pool.query('DELETE FROM tehtavat');
    res.status(200).json({ message: 'Kaikki tehtävät poistettu' });
  } catch (err) {
    console.error('Virhe poistettaessa tehtäviä:', err);
    res.status(500).send('Virhe poistettaessa tehtäviä');
  }
});

app.get('/api/init-db', async (req, res) => {
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

app.get('/api/update-db', async (req, res) => {
  try {
    await pool.query(`ALTER TABLE tehtavat ADD COLUMN IF NOT EXISTS deadline DATE`);
    await pool.query(`ALTER TABLE tehtavat ADD COLUMN IF NOT EXISTS tags TEXT[]`);
    await pool.query(`ALTER TABLE tehtavat ADD COLUMN IF NOT EXISTS kategoria TEXT`);
    res.send('Taulu päivitetty: deadline, tags ja kategoria lisätty!');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Virhe taulun päivityksessä');
  }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Palvelin käynnissä portissa ${PORT}`);
});



