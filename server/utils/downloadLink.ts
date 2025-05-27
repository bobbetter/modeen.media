import { storage } from "../storage";
import { create_jwt_token, make_download_url } from "./jwt";
import { insertDownloadLinkSchema } from "@shared/schema";
import { generateDownloadSignedUrl } from "./s3ObjectStorage";

export interface CreateDownloadLinkData {
  product_id: number;
  session_id?: string;
  max_download_count?: number;
  expire_after_seconds?: number;
  created_by: any;
}

export async function createOrGetDownloadLink(data: CreateDownloadLinkData) {
  // Prepare the data with defaults
  const linkData = {
    ...data,
    download_link: "empty", // Will be updated after creation
    max_download_count: data.max_download_count || 0,
    expire_after_seconds: data.expire_after_seconds || 0,
    session_id: data.session_id || null, // Include session_id if provided
  };

  // Validate the data
  const validation = insertDownloadLinkSchema.safeParse(linkData);
  if (!validation.success) {
    throw new Error(`Invalid download link data: ${JSON.stringify(validation.error.format())}`);
  }

  // Verify that the product exists
  const product = await storage.getProduct(validation.data.product_id);
  if (!product) {
    throw new Error("Product not found");
  }

    // Check if a download link already exists for this session_id and product_id
  if (validation.data.session_id) {
      const existingDownloadLink = await storage.getDownloadLinkBySession(
        validation.data.session_id
      );
      
      if (existingDownloadLink) {
        // Return the existing download link
        return {
          downloadLink: existingDownloadLink,
          product,
        };
      }
    }

  // Generate signed URL for the S3 file
  const s3Bucket = process.env.S3_BUCKET_NAME
  ;
  if (!s3Bucket) {
    throw new Error("S3_BUCKET_NAME environment variable not set");
  }

  // Extract the S3 key from the fileUrl
  const s3Key = product.fileUrl;
  if (!s3Key) {
    throw new Error("Product does not have a fileUrl");
  }

  // Generate signed URL with expiration based on expire_after_seconds or default to 1 hour
  const expiresIn = validation.data.expire_after_seconds || 3600;
  const signedUrl = await generateDownloadSignedUrl(
    s3Bucket,
    s3Key,
    expiresIn,
    product.name // Use product name as the download filename
  );

  // Create the download link with the signed URL
  const downloadLinkDataWithSignedUrl = {
    ...validation.data,
    signed_s3_url: signedUrl, // Use the S3 signed URL instead of JWT URL
  };
    
  const tempDownloadLinkData = await storage.createDownloadLink(downloadLinkDataWithSignedUrl);
  
  // Generate JWT token and download URL
  const jwt_token = create_jwt_token(data.product_id, tempDownloadLinkData.id);
  const external_download_url = make_download_url(jwt_token);

  // Update the download link with the actual URL
  const updatedDownloadLink = await storage.updateDownloadLink(
    tempDownloadLinkData.id,
    external_download_url,
  );

  if (!updatedDownloadLink) {
    throw new Error("Failed to update download link with URL");
  }

  return {
    downloadLink: updatedDownloadLink,
    product,
  };
} 