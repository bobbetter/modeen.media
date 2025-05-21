import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import { promisify } from "util";

const readFile = promisify(fs.readFile);

// Get S3 configuration from environment variables
const S3_BUCKET = process.env.S3_BUCKET || "";
const S3_REGION = process.env.S3_REGION || "us-east-1";
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || "";
const S3_SECRET_KEY = process.env.S3_SECRET_KEY || "";

// Create S3 client
const s3Client = new S3Client({
  region: S3_REGION,
  credentials: {
    accessKeyId: S3_ACCESS_KEY,
    secretAccessKey: S3_SECRET_KEY,
  },
});

/**
 * Upload a file to S3
 * @param filePath Local file path
 * @param key S3 key (path in bucket)
 * @returns URL of the uploaded file
 */
export async function uploadFileToS3(filePath: string, key: string): Promise<string> {
  const fileContent = await readFile(filePath);
  
  // Specify the correct type for ACL
  const uploadParams = {
    Bucket: S3_BUCKET,
    Key: key,
    Body: fileContent
  };

  await s3Client.send(new PutObjectCommand(uploadParams));
  
  // Return the public URL
  return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;
}

/**
 * Delete a file from S3
 * @param key S3 key (path in bucket)
 */
export async function deleteFileFromS3(key: string): Promise<void> {
  if (!key) return;
  
  try {
    const deleteParams = {
      Bucket: S3_BUCKET,
      Key: key
    };
    
    await s3Client.send(new DeleteObjectCommand(deleteParams));
  } catch (error) {
    console.error("Error deleting file from S3:", error);
    throw error;
  }
}

/**
 * Extract S3 key from a full S3 URL
 * @param url Full S3 URL
 * @returns S3 key
 */
export function getKeyFromUrl(url: string): string | null {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    // The pathname includes a leading slash, we need to remove it
    return urlObj.pathname.substring(1);
  } catch (error) {
    return null;
  }
}