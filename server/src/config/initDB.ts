// @ts-nocheck // TODO: 추후 삭제하고 타입 맞추기

// src/config/db.js
import mysql from 'mysql2/promise';

let db;

const initDB = async () => {
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

export default initDB;