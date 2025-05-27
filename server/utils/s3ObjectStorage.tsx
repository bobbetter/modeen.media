import { 
  S3Client, 
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  ListPartsCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export interface MultipartUploadInfo {
  uploadId: string;
  key: string;
  bucket: string;
}

export interface SignedUrlPart {
  partNumber: number;
  signedUrl: string;
}

export interface CompletedPart {
  ETag: string;
  PartNumber: number;
}

/**
 * Initiates a multipart upload and returns upload information
 */
export async function initiateMultipartUpload(
  bucket: string,
  key: string,
  contentType?: string
): Promise<MultipartUploadInfo> {
  const command = new CreateMultipartUploadCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
    Metadata: {
      uploadedAt: new Date().toISOString(),
    },
  });

  const response = await s3Client.send(command);
  
  if (!response.UploadId) {
    throw new Error("Failed to initiate multipart upload");
  }

  return {
    uploadId: response.UploadId,
    key,
    bucket,
  };
}

/**
 * Generates signed URLs for all parts of a multipart upload
 */
export async function generateSignedUrlsForParts(
  bucket: string,
  key: string,
  uploadId: string,
  totalParts: number,
  expiresIn: number = 3600 // 1 hour default
): Promise<SignedUrlPart[]> {
  const signedUrls: SignedUrlPart[] = [];

  for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
    const command = new UploadPartCommand({
      Bucket: bucket,
      Key: key,
      PartNumber: partNumber,
      UploadId: uploadId,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn,
    });

    signedUrls.push({
      partNumber,
      signedUrl,
    });
  }

  return signedUrls;
}

/**
 * Completes a multipart upload
 */
export async function completeMultipartUpload(
  bucket: string,
  key: string,
  uploadId: string,
  parts: CompletedPart[]
): Promise<string> {
  const command = new CompleteMultipartUploadCommand({
    Bucket: bucket,
    Key: key,
    UploadId: uploadId,
    MultipartUpload: {
      Parts: parts.sort((a, b) => a.PartNumber - b.PartNumber),
    },
  });

  const response = await s3Client.send(command);
  
  if (!response.Location) {
    throw new Error("Failed to complete multipart upload");
  }

  return response.Location;
}

/**
 * Aborts a multipart upload
 */
export async function abortMultipartUpload(
  bucket: string,
  key: string,
  uploadId: string
): Promise<void> {
  const command = new AbortMultipartUploadCommand({
    Bucket: bucket,
    Key: key,
    UploadId: uploadId,
  });

  await s3Client.send(command);
}

/**
 * Lists parts of a multipart upload
 */
export async function listUploadParts(
  bucket: string,
  key: string,
  uploadId: string
): Promise<CompletedPart[]> {
  const command = new ListPartsCommand({
    Bucket: bucket,
    Key: key,
    UploadId: uploadId,
  });

  const response = await s3Client.send(command);
  
  return (response.Parts || []).map(part => ({
    ETag: part.ETag!,
    PartNumber: part.PartNumber!,
  }));
}

export { s3Client };