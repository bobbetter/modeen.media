import { Client } from '@replit/object-storage';
import fs from 'fs';
import { promisify } from 'util';
import path from 'path';
import { Readable } from 'stream';

const readFile = promisify(fs.readFile);

// Access the Replit Object Storage service
// This will automatically use the REPLIT_OBJECT_STORAGE environment variable
const storageClient = new Client();

/**
 * Upload a file to Replit Object Storage
 * @param filePath Path to the temporary file
 * @param filename Desired filename in storage
 * @returns URL to access the uploaded file
 */
export async function uploadToObjectStorage(filePath: string, filename: string): Promise<string> {
  try {
    // Read the file content
    const fileContent = await readFile(filePath);
    
    // Create a key for the file in the bucket (store in products folder)
    const key = `products/${filename}`;
    
    // Upload the file to Replit Object Storage
    const result = await storageClient.uploadFromBytes(key, fileContent);
    
    if (!result.ok) {
      throw new Error(`Failed to upload to Object Storage: ${result.error}`);
    }
    
    // Return the URL that can be used to access the file
    return key;
  } catch (error) {
    console.error('Error uploading to Replit Object Storage:', error);
    throw error;
  }
}

/**
 * Get a file from Replit Object Storage
 * @param fileUrl URL of the file to retrieve
 * @returns File content as Buffer, filename, and content type
 */
export async function getFileFromObjectStorage(fileUrl: string): Promise<{ buffer: any, filename: string, contentType: string }> {
  try {
    // Normalize the fileUrl to get the proper object storage key
    let key = fileUrl;
    
    // If the URL doesn't start with 'products/', prepend it
    if (!key.startsWith('products/')) {
      // Extract the filename from the URL path
      const filename = path.basename(key);
      key = `products/${filename}`;
    }
    
    console.log(`Getting file from Object Storage with key: ${key}`);

    // No need to check if file exists, just try to download it
    // Get the file as bytes (buffer)
    const result = await storageClient.downloadAsBytes(key);
    
    if (!result.ok) {
      throw new Error(`Failed to get file from Object Storage: ${result.error?.message || 'Unknown error'}`);
    }
    
    // Extract the filename from the key
    const filename = path.basename(key);
    
    // Determine content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream'; // default content type
    
    // Map common extensions to content types
    const contentTypeMap: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.zip': 'application/zip',
      '.rar': 'application/x-rar-compressed',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.mp4': 'video/mp4',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.txt': 'text/plain',
    };
    
    if (contentTypeMap[ext]) {
      contentType = contentTypeMap[ext];
    }
    
    // The result.value contains the buffer data
    const buffer = Buffer.from(result.value);
    console.log(`Downloaded file ${key} - Size: ${buffer.length} bytes`);
    
    return {
      buffer: buffer,
      filename,
      contentType
    };
  } catch (error) {
    console.error('Error getting file from Object Storage:', error);
    throw error;
  }
}

/**
 * Delete a file from Replit Object Storage
 * @param fileUrl URL of the file to delete
 */
export async function deleteFromObjectStorage(fileUrl: string): Promise<void> {
  if (!fileUrl) return;
  
  try {
    // Extract the key from the URL - assuming format like /uploads/products/filename
    const urlParts = fileUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    const key = `products/${filename}`;
    
    // Delete the file from Replit Object Storage using delete
    const result = await storageClient.delete(key);
    
    if (!result.ok) {
      console.warn(`Warning: Object Storage delete failed: ${result.error}`);
    } else {
      console.log(`Deleted file ${key} from Replit Object Storage`);
    }
  } catch (error) {
    console.error('Error deleting from Replit Object Storage:', error);
    throw error;
  }
}