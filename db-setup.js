import pkg from '@neondatabase/serverless';
const { Pool, neonConfig } = pkg;
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

// Get database connection string from environment
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ connectionString });

// SQL statements to create tables based on our schema
const createTableQueries = [
  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE
  )`,
  `CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC NOT NULL,
    created_at TEXT NOT NULL
  )`
];

async function setupDatabase() {
  try {
    console.log('Setting up database tables...');
    
    // Execute each create table query
    for (const query of createTableQueries) {
      await pool.query(query);
      console.log('Table created successfully');
    }
    
    // Check if admin user exists
    const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', ['admin']);
    
    // Create admin user if not exists
    if (rows.length === 0) {
      await pool.query(
        'INSERT INTO users (username, password, is_admin) VALUES ($1, $2, $3)',
        ['admin', 'admin123', true]
      );
      console.log('Default admin user created');
    }
    
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await pool.end();
  }
}

setupDatabase();