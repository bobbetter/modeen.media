import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);
const copyFile = promisify(fs.copyFile);
const mkdir = promisify(fs.mkdir);

// Directory for storing uploaded files
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'products');

// Ensure the upload directory exists
async function ensureUploadDirExists() {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating upload directory:', error);
    throw error;
  }
}

// Initialize upload directory
ensureUploadDirExists();

/**
 * Store an uploaded file
 * @param filePath Path to temporary file
 * @param filename Name for the stored file
 * @returns URL to access the file
 */
export async function storeFile(filePath: string, filename: string): Promise<string> {
  try {
    const targetPath = path.join(UPLOAD_DIR, filename);
    
    // Copy the file to permanent storage
    await copyFile(filePath, targetPath);
    
    // Return a URL/path to access the file
    return `/uploads/products/${filename}`;
  } catch (error) {
    console.error('Error storing file:', error);
    throw error;
  }
}

/**
 * Delete a file 
 * @param fileUrl URL or path to the file
 */
export async function deleteFile(fileUrl: string): Promise<void> {
  if (!fileUrl) return;
  
  try {
    // Get the filename from the URL or path
    const filename = path.basename(fileUrl);
    const filePath = path.join(UPLOAD_DIR, filename);
    
    // Check if file exists before attempting deletion
    if (fs.existsSync(filePath)) {
      await unlink(filePath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}