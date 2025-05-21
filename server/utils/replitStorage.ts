import { Client } from '@replit/object-storage';
import fs from 'fs';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

// Create a client for Replit Object Storage
// This automatically uses REPLIT_OBJECT_STORAGE environment variable
const client = new Client();

/**
 * Upload a file to Replit Object Storage
 * @param filePath Path to the temporary file
 * @param filename Desired filename in storage
 * @returns URL to access the uploaded file
 */
export async function uploadFileToStorage(filePath: string, filename: string): Promise<string> {
  try {
    // Read the file content
    const fileContent = await readFile(filePath);
    
    // Create a key for the file in the bucket (store in products folder)
    const key = `products/${filename}`;
    
    // Upload to Replit Object Storage
    const result = await client.put(key, fileContent);
    
    if (!result.ok) {
      throw new Error(`Failed to upload file: ${result.error}`);
    }
    
    // Get the domain from environment or use default Replit domain
    const domain = process.env.REPLIT_DOMAIN || 'replit.com';
    
    // Return a URL to access the file 
    // Format: https://{repl-name}.{username}.repl.co/uploads/products/{filename}
    return `/uploads/products/${filename}`;
  } catch (error) {
    console.error('Error uploading to storage:', error);
    throw error;
  }
}

/**
 * Delete a file from Replit Object Storage
 * @param fileUrl URL of the file to delete
 */
export async function deleteFileFromStorage(fileUrl: string): Promise<void> {
  if (!fileUrl) return;
  
  try {
    // Extract the key from the URL - assuming format like /uploads/products/filename
    const urlParts = fileUrl.split('/');
    // Get the filename (last part)
    const filename = urlParts[urlParts.length - 1]; 
    const key = `products/${filename}`;
    
    // Delete from Replit Object Storage
    const result = await client.delete(key);
    
    if (!result.ok) {
      console.warn(`Warning: Failed to delete file from storage: ${result.error}`);
    } else {
      console.log(`Deleted file ${key} from storage`);
    }
  } catch (error) {
    console.error('Error deleting from storage:', error);
    throw error;
  }
}