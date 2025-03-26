require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon
  }
});

// Optional: Log connection status
pool.on('connect', () => console.log('PostgreSQL connected.'));
pool.on('error', (err) => console.error('Database error:', err));

module.exports = pool;