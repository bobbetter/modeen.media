import { Express, Request, Response } from "express";
import { z } from "zod";
import {
  initiateMultipartUpload,
  generateSignedUrlsForParts,
  completeMultipartUpload,
  abortMultipartUpload,
  listUploadParts,
  MultipartUploadInfo,
  SignedUrlPart,
  CompletedPart,
  s3Client,
} from "../utils/s3ObjectStorage";
import { UploadPartCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Validation schemas
const initiateUploadSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  fileSize: z.number().min(100 * 1024 * 1024, "File must be at least 100MB").max(10 * 1024 * 1024 * 1024, "File must be less than 10GB"),
  contentType: z.string().optional(),
  partSize: z.number().min(5 * 1024 * 1024).max(100 * 1024 * 1024).optional(), // 5MB to 100MB per part
});

const completeUploadSchema = z.object({
  uploadId: z.string().min(1, "Upload ID is required"),
  key: z.string().min(1, "Key is required"),
  parts: z.array(z.object({
    ETag: z.string().min(1, "ETag is required"),
    PartNumber: z.number().min(1, "Part number must be at least 1"),
  })).min(1, "At least one part is required"),
});

const abortUploadSchema = z.object({
  uploadId: z.string().min(1, "Upload ID is required"),
  key: z.string().min(1, "Key is required"),
});

// Constants
const DEFAULT_PART_SIZE = 10 * 1024 * 1024; // 10MB
const S3_BUCKET = process.env.S3_BUCKET_NAME || "your-default-bucket";
const SIGNED_URL_EXPIRY = 3600; // 1 hour

/**
 * Generate a unique S3 key for the file
 */
function generateS3Key(fileName: string, userId?: string): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  const prefix = userId ? `uploads/${userId}` : 'uploads/anonymous';
  return `${prefix}/${timestamp}-${randomId}-${sanitizedFileName}`;
}

/**
 * Calculate the number of parts needed for multipart upload
 */
function calculateParts(fileSize: number, partSize: number): number {
  return Math.ceil(fileSize / partSize);
}

/**
 * POST /api/upload/initiate
 * Initiates a multipart upload and returns signed URLs for all parts
 */
async function initiateUpload(req: Request, res: Response): Promise<void> {
  try {
    const validatedData = initiateUploadSchema.parse(req.body);
    const { fileName, fileSize, contentType, partSize = DEFAULT_PART_SIZE } = validatedData;

    // Generate unique S3 key
    const key = generateS3Key(fileName, req.session?.userId?.toString());

    // Calculate number of parts
    const totalParts = calculateParts(fileSize, partSize);

    // Validate part count (S3 limit is 10,000 parts)
    if (totalParts > 10000) {
      res.status(400).json({
        error: "File too large for current part size. Please use a larger part size.",
        maxParts: 10000,
        suggestedPartSize: Math.ceil(fileSize / 10000),
      });
      return;
    }

    // Initiate multipart upload
    const uploadInfo = await initiateMultipartUpload(S3_BUCKET, key, contentType);

    // Generate signed URLs for all parts
    const signedUrls = await generateSignedUrlsForParts(
      S3_BUCKET,
      key,
      uploadInfo.uploadId,
      totalParts,
      SIGNED_URL_EXPIRY
    );

    res.json({
      uploadId: uploadInfo.uploadId,
      key: uploadInfo.key,
      bucket: uploadInfo.bucket,
      totalParts,
      partSize,
      signedUrls,
      expiresIn: SIGNED_URL_EXPIRY,
    });
  } catch (error) {
    console.error("Error initiating upload:", error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
      return;
    }

    res.status(500).json({
      error: "Failed to initiate upload",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * POST /api/upload/complete
 * Completes a multipart upload
 */
async function completeUpload(req: Request, res: Response): Promise<void> {
  try {
    const validatedData = completeUploadSchema.parse(req.body);
    const { uploadId, key, parts } = validatedData;

    // Complete the multipart upload
    const location = await completeMultipartUpload(S3_BUCKET, key, uploadId, parts);

    res.json({
      success: true,
      location,
      key,
      uploadId,
      message: "Upload completed successfully",
    });
  } catch (error) {
    console.error("Error completing upload:", error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
      return;
    }

    res.status(500).json({
      error: "Failed to complete upload",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * POST /api/upload/abort
 * Aborts a multipart upload
 */
async function abortUpload(req: Request, res: Response): Promise<void> {
  try {
    const validatedData = abortUploadSchema.parse(req.body);
    const { uploadId, key } = validatedData;

    // Abort the multipart upload
    await abortMultipartUpload(S3_BUCKET, key, uploadId);

    res.json({
      success: true,
      message: "Upload aborted successfully",
      uploadId,
      key,
    });
  } catch (error) {
    console.error("Error aborting upload:", error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
      return;
    }

    res.status(500).json({
      error: "Failed to abort upload",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * GET /api/upload/status/:uploadId/:key
 * Gets the status of a multipart upload
 */
async function getUploadStatus(req: Request, res: Response): Promise<void> {
  try {
    const { uploadId, key } = req.params;

    if (!uploadId || !key) {
      res.status(400).json({
        error: "Upload ID and key are required",
      });
      return;
    }

    // List uploaded parts
    const uploadedParts = await listUploadParts(S3_BUCKET, decodeURIComponent(key), uploadId);

    res.json({
      uploadId,
      key: decodeURIComponent(key),
      uploadedParts: uploadedParts.length,
      parts: uploadedParts,
    });
  } catch (error) {
    console.error("Error getting upload status:", error);
    
    res.status(500).json({
      error: "Failed to get upload status",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * POST /api/upload/regenerate-urls
 * Regenerates signed URLs for remaining parts (in case of expiry)
 */
async function regenerateSignedUrls(req: Request, res: Response): Promise<void> {
  try {
    const { uploadId, key, partNumbers } = req.body;

    if (!uploadId || !key || !Array.isArray(partNumbers)) {
      res.status(400).json({
        error: "Upload ID, key, and part numbers array are required",
      });
      return;
    }

    const signedUrls: SignedUrlPart[] = [];

    // Generate signed URLs for specific parts
    for (const partNumber of partNumbers) {
      if (typeof partNumber !== 'number' || partNumber < 1) {
        continue;
      }

      // Generate signed URL for this specific part
      const command = new UploadPartCommand({
        Bucket: S3_BUCKET,
        Key: key,
        PartNumber: partNumber,
        UploadId: uploadId,
      });

      const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: SIGNED_URL_EXPIRY,
      });

      signedUrls.push({
        partNumber,
        signedUrl,
      });
    }

    res.json({
      signedUrls,
      expiresIn: SIGNED_URL_EXPIRY,
    });
  } catch (error) {
    console.error("Error regenerating signed URLs:", error);
    
    res.status(500).json({
      error: "Failed to regenerate signed URLs",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Register upload routes
 */
export function registerUploadRoutes(app: Express): void {
  app.post("/api/upload/initiate", initiateUpload);
  app.post("/api/upload/complete", completeUpload);
  app.post("/api/upload/abort", abortUpload);
  app.get("/api/upload/status/:uploadId/:key", getUploadStatus);
  app.post("/api/upload/regenerate-urls", regenerateSignedUrls);
}
