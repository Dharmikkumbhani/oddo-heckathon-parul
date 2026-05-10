const { Pool } = require('pg');
require('dotenv').config({ path: '../frontend/.env' }); // Load from frontend directory

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
