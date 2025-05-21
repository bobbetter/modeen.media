import { Client } from '@replit/object-storage';
import fs from 'fs';
import { promisify } from 'util';
import path from 'path';

const readFile = promisify(fs.readFile);
const mkdir = promisify(fs.mkdir);

// Create a client for Replit Object Storage
const client = new Client();

// Directory for local storage fallback
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'products');

// Ensure the upload directory exists
async function ensureUploadDirExists() {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error;
    }
  }
}

// Initialize directory
ensureUploadDirExists();

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
    
    // Create a key for the file in the bucket
    const key = `products/${filename}`;
    
    // Upload to Replit Object Storage
    const result = await client.uploadFromBytes(key, fileContent);
    
    if (!result.ok) {
      throw new Error(`Failed to upload to Object Storage: ${result.error}`);
    }
    
    console.log(`File uploaded to Replit Object Storage with key: ${key}`);
    
    // Return the path to access the file
    return `/uploads/products/${filename}`;
  } catch (error) {
    console.error('Error uploading to Object Storage:', error);
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
    // Extract the filename from the URL - assuming format like /uploads/products/filename
    const urlParts = fileUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    const key = `products/${filename}`;
    
    // Delete from Replit Object Storage
    const result = await client.delete(key);
    
    if (!result.ok) {
      console.warn(`Warning: Object Storage delete failed: ${result.error}`);
    } else {
      console.log(`Deleted file ${key} from Replit Object Storage`);
    }
  } catch (error) {
    console.error('Error deleting from Object Storage:', error);
    throw error;
  }
}