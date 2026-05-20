// server.js
// Student: xvq7775
// Description: Node.js/Express backend for CabsOnline
// Handles booking and admin requests, connects to MySQL

const express = require('express');
const cors    = require('cors');
const mysql   = require('mysql2');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- Database connection ----
const db = mysql.createConnection({
  host:     process.env.DB_HOST     || 'webdev.aut.ac.nz',
  user:     process.env.DB_USER     || 'xvq7775',
  password: process.env.DB_PASSWORD || 'wbxuqfzreaddtgentetybtjyruubfqlsa',
  database: process.env.DB_NAME     || 'xvq7775'
});

db.connect(err => {
  if (err) {
    console.error('DB connection failed:', err);
  } else {
    console.log('Connected to MySQL!');
  }
});

// ---- POST /booking ----
app.post('/booking', (req, res) => {
  const { cname, phone, unumber, snumber, stname, sbname, dsbname, date, time } = req.body;

  if (!cname || !phone || !snumber || !stname || !date || !time) {
    return res.json({ status: 'error', message: 'Required fields are missing.' });
  }

  const sql = `INSERT INTO bookings 
    (cname, phone, unumber, snumber, stname, sbname, dsbname, pdate, ptime, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'unassigned')`;

  db.query(sql, [cname, phone, unumber, snumber, stname, sbname, dsbname, date, time], (err, result) => {
    if (err) return res.json({ status: 'error', message: err.message });

    const newId = result.insertId;
    const brn   = 'BRN' + String(newId).padStart(5, '0');

    db.query('UPDATE bookings SET brn = ? WHERE id = ?', [brn, newId], (err2) => {
      if (err2) return res.json({ status: 'error', message: err2.message });
      res.json({ status: 'success', brn, pdate: date, ptime: time });
    });
  });
});

// ---- POST /admin/search ----
app.post('/admin/search', (req, res) => {
  const { bsearch } = req.body;
  let sql;

  if (bsearch && bsearch.trim() !== '') {
    sql = `SELECT brn, cname, phone, sbname, dsbname, pdate, ptime, status 
           FROM bookings WHERE brn = ?`;
    db.query(sql, [bsearch.trim()], (err, results) => {
      if (err) return res.json({ status: 'error', message: err.message });
      res.json({ status: 'success', records: results });
    });
  } else {
    sql = `SELECT brn, cname, phone, sbname, dsbname, pdate, ptime, status 
           FROM bookings
           WHERE status = 'unassigned'
           AND STR_TO_DATE(CONCAT(pdate, ' ', ptime), '%d/%m/%Y %H:%i')
           BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 2 HOUR)`;
    db.query(sql, (err, results) => {
      if (err) return res.json({ status: 'error', message: err.message });
      res.json({ status: 'success', records: results });
    });
  }
});

// ---- POST /admin/assign ----
app.post('/admin/assign', (req, res) => {
  const { brn } = req.body;
  if (!brn) return res.json({ status: 'error', message: 'BRN is required.' });

  db.query("UPDATE bookings SET status = 'assigned' WHERE brn = ?", [brn], (err) => {
    if (err) return res.json({ status: 'error', message: err.message });
    res.json({ status: 'success', message: `Booking ${brn} has been assigned!` });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));