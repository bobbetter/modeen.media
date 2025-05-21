import { Client } from '@replit/object-storage';
import fs from 'fs';
import { promisify } from 'util';
import path from 'path';

const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);

// Create a client for Replit Object Storage
const storageClient = new Client();

// Your bucket ID
const BUCKET_ID = 'replit-objstore-bf7ec12e-6e09-4fdd-8155-f15c6f7589c4';

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

    // Upload the file to Replit Object Storage
    await storageClient.putObject(key, fileContent);

    // Return the URL that can be used to access the file
    return `https://${BUCKET_ID}.prod.roplat.com/${key}`;
  } catch (error) {
    console.error('Error uploading to Replit Object Storage:', error);
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
    // Extract the key from the URL - assuming format like https://{bucket-id}.prod.roplat.com/products/filename
    const urlParts = fileUrl.split('/');
    const key = urlParts.slice(-2).join('/'); // This should give us "products/filename"

    // Delete the file from Replit Object Storage
    await storageClient.deleteObject(key);
    console.log(`Deleted file ${key} from Replit Object Storage`);
  } catch (error) {
    console.error('Error deleting from Replit Object Storage:', error);
    throw error;
  }
}