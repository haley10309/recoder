// @ts-nocheck // TODO: 추후 삭제하고 타입 맞추기

import mysql from 'mysql2';
import dotenv from "dotenv";
dotenv.config();

const createConnection = () => {
  return mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
}

let db = createConnection();

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('✅ Connected to the database');
  }
});

// 에러 발생 시 자동 재연결
db.on('error', (err) => {
  console.error('DB error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.warn('Reconnecting to the database...');
    db = createConnection();
    db.connect((err) => {
      if (err) {
        console.error('Reconnection failed:', err);
      } else {
        console.log('✅ Reconnected to the database');
      }
    });
  } else {
    throw err;
  }
});

export default db; 