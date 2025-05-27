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
  fileSize: z.number().min(1, "File size must be at least 1 byte").max(10 * 1024 * 1024 * 1024, "File must be less than 10GB"),
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
  console.log("[Upload] Initiate upload request received:", {
    body: req.body,
    userId: req.session?.userId
  });

  try {
    const validatedData = initiateUploadSchema.parse(req.body);
    const { fileName, fileSize, contentType, partSize = DEFAULT_PART_SIZE } = validatedData;

    console.log("[Upload] Validated data:", {
      fileName,
      fileSize,
      fileSizeInMB: (fileSize / (1024 * 1024)).toFixed(2) + " MB",
      contentType,
      partSize,
      partSizeInMB: (partSize / (1024 * 1024)).toFixed(2) + " MB"
    });

    // Generate unique S3 key
    const key = generateS3Key(fileName, req.session?.userId?.toString());
    console.log("[Upload] Generated S3 key:", key);

    // Calculate number of parts
    const totalParts = calculateParts(fileSize, partSize);
    console.log("[Upload] Calculated parts:", {
      totalParts,
      fileSize,
      partSize,
      lastPartSize: fileSize - (totalParts - 1) * partSize
    });

    // Validate part count (S3 limit is 10,000 parts)
    if (totalParts > 10000) {
      console.error("[Upload] Too many parts:", totalParts);
      res.status(400).json({
        error: "File too large for current part size. Please use a larger part size.",
        maxParts: 10000,
        suggestedPartSize: Math.ceil(fileSize / 10000),
      });
      return;
    }

    // Initiate multipart upload
    console.log("[Upload] Initiating multipart upload in S3");
    const uploadInfo = await initiateMultipartUpload(S3_BUCKET, key, contentType);
    console.log("[Upload] Multipart upload initiated:", uploadInfo);

    // Generate signed URLs for all parts
    console.log("[Upload] Generating signed URLs for", totalParts, "parts");
    const signedUrls = await generateSignedUrlsForParts(
      S3_BUCKET,
      key,
      uploadInfo.uploadId,
      totalParts,
      SIGNED_URL_EXPIRY
    );
    console.log("[Upload] Generated", signedUrls.length, "signed URLs");

    const response = {
      uploadId: uploadInfo.uploadId,
      key: uploadInfo.key,
      bucket: uploadInfo.bucket,
      totalParts,
      partSize,
      signedUrls,
      expiresIn: SIGNED_URL_EXPIRY,
    };

    console.log("[Upload] Sending initiate response:", {
      uploadId: response.uploadId,
      key: response.key,
      totalParts: response.totalParts,
      signedUrlsCount: response.signedUrls.length
    });

    res.json(response);
  } catch (error) {
    console.error("[Upload] Error initiating upload:", error);
    
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
  console.log("[Upload] Complete upload request received:", {
    uploadId: req.body.uploadId,
    key: req.body.key,
    partsCount: req.body.parts?.length
  });

  try {
    const validatedData = completeUploadSchema.parse(req.body);
    const { uploadId, key, parts } = validatedData;

    console.log("[Upload] Completing multipart upload:", {
      uploadId,
      key,
      partsCount: parts.length,
      parts: parts.map(p => ({ PartNumber: p.PartNumber, ETag: p.ETag }))
    });

    // Complete the multipart upload
    const location = await completeMultipartUpload(S3_BUCKET, key, uploadId, parts);
    console.log("[Upload] Upload completed successfully:", {
      location,
      key,
      uploadId
    });

    res.json({
      success: true,
      location,
      key,
      uploadId,
      message: "Upload completed successfully",
    });
  } catch (error) {
    console.error("[Upload] Error completing upload:", error);
    
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
  console.log("[Upload] Abort upload request received:", {
    uploadId: req.body.uploadId,
    key: req.body.key
  });

  try {
    const validatedData = abortUploadSchema.parse(req.body);
    const { uploadId, key } = validatedData;

    console.log("[Upload] Aborting multipart upload:", {
      uploadId,
      key
    });

    // Abort the multipart upload
    await abortMultipartUpload(S3_BUCKET, key, uploadId);
    console.log("[Upload] Upload aborted successfully");

    res.json({
      success: true,
      message: "Upload aborted successfully",
      uploadId,
      key,
    });
  } catch (error) {
    console.error("[Upload] Error aborting upload:", error);
    
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
  console.log("[Upload] Get upload status request:", {
    uploadId: req.params.uploadId,
    key: req.params.key
  });

  try {
    const { uploadId, key } = req.params;

    if (!uploadId || !key) {
      res.status(400).json({
        error: "Upload ID and key are required",
      });
      return;
    }

    // List uploaded parts
    console.log("[Upload] Listing uploaded parts");
    const uploadedParts = await listUploadParts(S3_BUCKET, decodeURIComponent(key), uploadId);
    console.log("[Upload] Found", uploadedParts.length, "uploaded parts");

    res.json({
      uploadId,
      key: decodeURIComponent(key),
      uploadedParts: uploadedParts.length,
      parts: uploadedParts,
    });
  } catch (error) {
    console.error("[Upload] Error getting upload status:", error);
    
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
  console.log("[Upload] Regenerate signed URLs request:", {
    uploadId: req.body.uploadId,
    key: req.body.key,
    partNumbers: req.body.partNumbers
  });

  try {
    const { uploadId, key, partNumbers } = req.body;

    if (!uploadId || !key || !Array.isArray(partNumbers)) {
      res.status(400).json({
        error: "Upload ID, key, and part numbers array are required",
      });
      return;
    }

    console.log("[Upload] Regenerating signed URLs for", partNumbers.length, "parts");
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

    console.log("[Upload] Regenerated", signedUrls.length, "signed URLs");

    res.json({
      signedUrls,
      expiresIn: SIGNED_URL_EXPIRY,
    });
  } catch (error) {
    console.error("[Upload] Error regenerating signed URLs:", error);
    
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
  console.log("[Upload] Registering upload routes");
  app.post("/api/upload/initiate", initiateUpload);
  app.post("/api/upload/complete", completeUpload);
  app.post("/api/upload/abort", abortUpload);
  app.get("/api/upload/status/:uploadId/:key", getUploadStatus);
  app.post("/api/upload/regenerate-urls", regenerateSignedUrls);
}
