import { storage } from "../storage";
import { create_jwt_token, make_download_url } from "./jwt";
import { insertDownloadLinkSchema } from "@shared/schema";

export interface CreateDownloadLinkData {
  product_id: number;
  max_download_count?: number;
  expire_after_seconds?: number;
  created_by: any;
}

export async function createDownloadLink(data: CreateDownloadLinkData) {
  // Prepare the data with defaults
  const linkData = {
    ...data,
    download_link: "empty", // Will be updated after creation
    max_download_count: data.max_download_count || 0,
    expire_after_seconds: data.expire_after_seconds || 0,
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

  // Create the download link
  const downloadLink = await storage.createDownloadLink(validation.data);
  
  // Generate JWT token and download URL
  const jwt_token = create_jwt_token(data.product_id, downloadLink.id);
  const download_url = make_download_url(jwt_token);

  // Update the download link with the actual URL
  const updatedDownloadLink = await storage.updateDownloadLink(
    downloadLink.id,
    download_url,
  );

  if (!updatedDownloadLink) {
    throw new Error("Failed to update download link with URL");
  }

  return {
    downloadLink: updatedDownloadLink,
    product,
  };
} 