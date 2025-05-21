import { Client } from '@replit/object-storage';
import fs from 'fs';
import { promisify } from 'util';
import path from 'path';

const readFile = promisify(fs.readFile);
const mkdir = promisify(fs.mkdir);
const copyFile = promisify(fs.copyFile);

// Create a client for Replit Object Storage
// This automatically uses REPLIT_OBJECT_STORAGE environment variable if available
const client = new Client();

// Directory for storing uploaded files
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

/**
 * Upload a file to storage (Replit Object Storage when available, fallback to local filesystem)
 * @param filePath Path to the temporary file
 * @param filename Desired filename in storage
 * @returns URL to access the uploaded file
 */
export async function uploadFileToStorage(filePath: string, filename: string): Promise<string> {
  try {
    // First try to upload to Replit Object Storage
    try {
      // Read the file content
      const fileContent = await readFile(filePath);
      
      // Create a key for the file in the bucket
      const key = `products/${filename}`;
      
      // Try to upload to Replit Object Storage
      const result = await client.uploadFromBytes(key, fileContent);
      
      // If successful, return a URL to access the file
      if (result.ok) {
        console.log(`File uploaded to Replit Object Storage with key: ${key}`);
        
        // Return the path to access the file
        // Format: /uploads/products/{filename}
        return `/uploads/products/${filename}`;
      } else {
        console.warn(`Warning: Replit Object Storage upload failed: ${result.error}`);
        // Continue to local storage fallback
      }
    } catch (objectStoreError) {
      // Log the error but continue to local storage fallback
      console.warn('Warning: Replit Object Storage not available or error occurred:', objectStoreError);
    }

    // Fallback to local file storage
    console.log('Falling back to local file storage...');
    
    // Ensure upload directory exists
    await ensureUploadDirExists();
    
    // Generate destination path
    const destPath = path.join(UPLOAD_DIR, filename);
    
    // Copy the file to the destination
    await copyFile(filePath, destPath);
    
    console.log(`File stored locally at: ${destPath}`);
    
    // Return URL for accessing the file
    return `/uploads/products/${filename}`;
  } catch (error) {
    console.error('Error uploading to storage:', error);
    throw error;
  }
}

/**
 * Delete a file from storage
 * @param fileUrl URL of the file to delete
 */
export async function deleteFileFromStorage(fileUrl: string): Promise<void> {
  if (!fileUrl) return;
  
  try {
    // Extract the filename from the URL - assuming format like /uploads/products/filename
    const urlParts = fileUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    const key = `products/${filename}`;
    
    // Try to delete from Replit Object Storage
    try {
      const result = await client.delete(key);
      if (result.ok) {
        console.log(`Deleted file ${key} from Replit Object Storage`);
        return;
      } else {
        console.warn(`Warning: Replit Object Storage delete failed: ${result.error}`);
        // Continue to local storage fallback
      }
    } catch (objectStoreError) {
      // Log the error but continue to local storage fallback
      console.warn('Warning: Replit Object Storage not available or error occurred:', objectStoreError);
    }
    
    // Fallback to local file deletion
    const localPath = path.join(UPLOAD_DIR, filename);
    
    // Check if file exists locally
    if (fs.existsSync(localPath)) {
      await promisify(fs.unlink)(localPath);
      console.log(`Deleted local file: ${localPath}`);
    } else {
      console.warn(`Local file not found for deletion: ${localPath}`);
    }
  } catch (error) {
    console.error('Error deleting from storage:', error);
    throw error;
  }
}