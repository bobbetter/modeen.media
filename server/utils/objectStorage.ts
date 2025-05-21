import { createObjectStorageClient } from '@replit/object-storage';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);

// Initialize Replit Object Storage with the provided bucket ID
const storage = createObjectStorageClient({
  bucketName: 'modeen-media-files',
  // You provided this bucket ID
  bucketId: 'replit-objstore-61b76130-28b4-4830-83b7-2f90d6e0e13a'
});

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
    
    // Generate a unique key for storage using the filename
    const key = `products/${filename}`;
    
    // Upload to object storage
    await storage.putObject(key, fileContent);
    
    // Return the URL to access the file
    return `https://${storage.hostName}/${key}`;
  } catch (error) {
    console.error('Error uploading file to Replit Object Storage:', error);
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
    // Extract the key from the URL
    const key = fileUrl.split('/').slice(-2).join('/'); // Get "products/filename"
    
    // Delete the object
    await storage.deleteObject(key);
  } catch (error) {
    console.error('Error deleting file from Replit Object Storage:', error);
    throw error;
  }
}