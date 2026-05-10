import { Pool } from 'pg';

// Using a standard pool connection for PostgreSQL.
// Ensure your DATABASE_URL is set in your environment variables.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
export default pool;
