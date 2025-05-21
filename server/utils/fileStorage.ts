import fs from "fs";
import path from "path";
import { promisify } from "util";

const copyFile = promisify(fs.copyFile);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);

// Base directory for file storage
const fileStorageDir = path.join(process.cwd(), "file-storage");

// Make sure the storage directory exists
async function ensureStorageDirectoryExists() {
  try {
    await mkdir(fileStorageDir, { recursive: true });
    // Create products subdirectory
    await mkdir(path.join(fileStorageDir, "products"), { recursive: true });
  } catch (error) {
    console.error("Error creating storage directories:", error);
    throw error;
  }
}

// Initialize storage
ensureStorageDirectoryExists();

/**
 * Store a file in the file storage system
 * @param sourcePath Path to the temporary file
 * @param filename Target filename
 * @returns URL or path to access the file
 */
export async function storeFile(sourcePath: string, filename: string): Promise<string> {
  const productStoragePath = path.join(fileStorageDir, "products");
  const targetPath = path.join(productStoragePath, filename);
  
  await copyFile(sourcePath, targetPath);
  
  // Return a URL/path that can be used to retrieve the file
  return `/file-storage/products/${filename}`;
}

/**
 * Delete a file from storage
 * @param filePath Path or URL to the file
 */
export async function deleteFile(filePath: string): Promise<void> {
  if (!filePath) return;
  
  try {
    // Extract the filename from the URL/path
    const filename = path.basename(filePath);
    const fullPath = path.join(fileStorageDir, "products", filename);
    
    if (fs.existsSync(fullPath)) {
      await unlink(fullPath);
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}

/**
 * Get the full file path from a storage URL or path
 * @param filePath Storage URL or path
 * @returns Absolute file path
 */
export function getStoragePath(filePath: string): string | null {
  if (!filePath) return null;
  
  try {
    // Extract the filename from the URL/path
    const filename = path.basename(filePath);
    return path.join(fileStorageDir, "products", filename);
  } catch (error) {
    return null;
  }
}