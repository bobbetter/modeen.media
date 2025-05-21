import { exec } from 'child_process';

// Run the drizzle-kit push:pg command
exec('npx drizzle-kit push:pg --schema=./shared/schema.ts', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  console.log(`Schema pushed successfully:\n${stdout}`);
});