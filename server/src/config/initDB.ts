// src/config/db.js
import mysql, { Connection } from 'mysql2/promise';

let db: Connection;

const initDB = async (): Promise<Connection> => {
  if (!db) {
    db = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    console.log('✅ Connected to DB by initDB');
  }
  return db;
}

export default initDB;