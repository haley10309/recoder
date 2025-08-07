// src/config/db.js
const mysql = require('mysql2/promise');

let db;

async function initDB() {
  if (!db) {
    db = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    console.log('✅ Connected to DB by initDB');
  }
  return db;
}

module.exports = initDB;
