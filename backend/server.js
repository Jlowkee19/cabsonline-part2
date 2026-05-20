// server.js
// Student: xvq7775
// Description: Node.js/Express backend for CabsOnline
// Handles booking and admin requests, connects to PostgreSQL on Neon

const express = require('express');
const cors    = require('cors');
const multer  = require('multer');
const { Pool } = require('pg');

const app    = express();
const upload = multer();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- Database connection ----
const db = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_PrMpIYH9ks7O@ep-summer-tree-a71fvg0j.ap-southeast-2.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

// ---- GET / (health check) ----
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'CabsOnline backend is running!' });
});

// ---- POST /booking ----
app.post('/booking', upload.none(), async (req, res) => {
  const { cname, phone, unumber, snumber, stname, sbname, dsbname, date, time } = req.body;

  if (!cname || !phone || !snumber || !stname || !date || !time) {
    return res.json({ status: 'error', message: 'Required fields are missing.' });
  }

  try {
    const result = await db.query(
      `INSERT INTO bookings (cname, phone, unumber, snumber, stname, sbname, dsbname, pdate, ptime, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'unassigned') RETURNING id`,
      [cname, phone, unumber || '', snumber, stname, sbname || '', dsbname || '', date, time]
    );

    const newId = result.rows[0].id;
    const brn   = 'BRN' + String(newId).padStart(5, '0');

    await db.query('UPDATE bookings SET brn = $1 WHERE id = $2', [brn, newId]);

    res.json({ status: 'success', brn, pdate: date, ptime: time });
  } catch (err) {
    res.json({ status: 'error', message: err.message });
  }
});

// ---- POST /admin/search ----
app.post('/admin/search', upload.none(), async (req, res) => {
  const bsearch = req.body.bsearch ? req.body.bsearch.trim() : '';

  try {
    let result;
    if (bsearch !== '') {
      result = await db.query(
        `SELECT brn, cname, phone, sbname, dsbname, pdate, ptime, status 
         FROM bookings WHERE brn = $1`,
        [bsearch]
      );
    } else {
      result = await db.query(
        `SELECT brn, cname, phone, sbname, dsbname, pdate, ptime, status 
         FROM bookings
         WHERE status = 'unassigned'
         AND TO_TIMESTAMP(pdate || ' ' || ptime, 'DD/MM/YYYY HH24:MI')
         BETWEEN NOW() AND NOW() + INTERVAL '2 hours'`
      );
    }
    res.json({ status: 'success', records: result.rows });
  } catch (err) {
    res.json({ status: 'error', message: err.message });
  }
});

// ---- POST /admin/assign ----
app.post('/admin/assign', upload.none(), async (req, res) => {
  const brn = req.body.brn ? req.body.brn.trim() : '';
  if (!brn) return res.json({ status: 'error', message: 'BRN is required.' });

  try {
    await db.query("UPDATE bookings SET status = 'assigned' WHERE brn = $1", [brn]);
    res.json({ status: 'success', message: `Booking ${brn} has been assigned!` });
  } catch (err) {
    res.json({ status: 'error', message: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));