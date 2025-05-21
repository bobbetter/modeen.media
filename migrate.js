import { pool, db } from './server/db.js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

// Simple migration script to sync schema with database
async function main() {
  try {
    console.log('Pushing schema to database...');
    await migrate(db, { migrationsFolder: 'drizzle' });
    console.log('Schema pushed successfully!');
  } catch (error) {
    console.error('Error pushing schema:', error);
  } finally {
    await pool.end();
  }
}

main();