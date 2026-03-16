import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || '62.77.156.58',
  user: process.env.DB_USER || 'mtc_user',
  password: process.env.DB_PASSWORD || 'ALKHAL3297',
  database: process.env.DB_NAME || 'mtc_db',
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
