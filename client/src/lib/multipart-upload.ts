export interface UploadProgress {
  uploadedBytes: number;
  totalBytes: number;
  percentage: number;
  uploadedParts: number;
  totalParts: number;
}

export interface MultipartUploadOptions {
  file: File;
  onProgress?: (progress: UploadProgress) => void;
  onError?: (error: Error) => void;
  onComplete?: (result: { key: string; location: string }) => void;
  partSize?: number;
}

interface InitiateUploadResponse {
  uploadId: string;
  key: string;
  bucket: string;
  totalParts: number;
  partSize: number;
  signedUrls: Array<{
    partNumber: number;
    signedUrl: string;
  }>;
  expiresIn: number;
}

interface CompletedPart {
  ETag: string;
  PartNumber: number;
}

export class MultipartUploader {
  private abortController: AbortController | null = null;
  private uploadId: string | null = null;
  private key: string | null = null;

  async upload(options: MultipartUploadOptions): Promise<{ key: string; location: string }> {
    const { file, onProgress, onError, onComplete, partSize } = options;
    
    console.log("[MultipartUploader] Starting upload:", {
      fileName: file.name,
      fileSize: file.size,
      fileSizeInMB: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      requestedPartSize: partSize
    });
    
    this.abortController = new AbortController();

    try {
      // Step 1: Initiate multipart upload
      console.log("[MultipartUploader] Step 1: Initiating multipart upload");
      const initiateResponse = await this.initiateUpload(file, partSize);
      this.uploadId = initiateResponse.uploadId;
      this.key = initiateResponse.key;

      console.log("[MultipartUploader] Upload initiated:", {
        uploadId: initiateResponse.uploadId,
        key: initiateResponse.key,
        totalParts: initiateResponse.totalParts,
        partSize: initiateResponse.partSize,
        partSizeInMB: (initiateResponse.partSize / (1024 * 1024)).toFixed(2) + " MB"
      });

      // Step 2: Upload parts
      console.log("[MultipartUploader] Step 2: Starting to upload parts");
      const completedParts = await this.uploadParts(
        file,
        initiateResponse,
        onProgress
      );

      console.log("[MultipartUploader] All parts uploaded successfully:", {
        totalParts: completedParts.length,
        parts: completedParts
      });

      // Step 3: Complete upload
      console.log("[MultipartUploader] Step 3: Completing multipart upload");
      const result = await this.completeUpload(
        initiateResponse.uploadId,
        initiateResponse.key,
        completedParts
      );

      console.log("[MultipartUploader] Upload completed successfully:", result);

      if (onComplete) {
        onComplete(result);
      }

      return result;
    } catch (error) {
      console.error("[MultipartUploader] Upload failed:", error);
      if (onError) {
        onError(error as Error);
      }
      
      // Attempt to abort the upload if it was initiated
      if (this.uploadId && this.key) {
        console.log("[MultipartUploader] Attempting to abort failed upload");
        await this.abortUpload().catch(console.error);
      }
      
      throw error;
    } finally {
      this.cleanup();
    }
  }

  private async initiateUpload(file: File, partSize?: number): Promise<InitiateUploadResponse> {
    const requestBody = {
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type,
      partSize,
    };

    console.log("[MultipartUploader] Initiating upload with request:", requestBody);

    const response = await fetch('/api/upload/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      credentials: 'include',
      signal: this.abortController?.signal,
    });

    console.log("[MultipartUploader] Initiate response status:", response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error("[MultipartUploader] Failed to initiate upload:", error);
      throw new Error(error.error || 'Failed to initiate upload');
    }

    const data = await response.json();
    console.log("[MultipartUploader] Initiate response data:", {
      uploadId: data.uploadId,
      totalParts: data.totalParts,
      signedUrlsCount: data.signedUrls.length
    });

    return data;
  }

  private async uploadParts(
    file: File,
    uploadInfo: InitiateUploadResponse,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<CompletedPart[]> {
    const { totalParts, partSize, signedUrls } = uploadInfo;
    const completedParts: CompletedPart[] = [];
    let uploadedBytes = 0;

    console.log("[MultipartUploader] Starting to upload", totalParts, "parts");

    // Upload parts sequentially (could be parallelized for better performance)
    for (let i = 0; i < totalParts; i++) {
      const start = i * partSize;
      const end = Math.min(start + partSize, file.size);
      const blob = file.slice(start, end);
      
      console.log(`[MultipartUploader] Uploading part ${i + 1}/${totalParts}:`, {
        start,
        end,
        size: blob.size,
        sizeInMB: (blob.size / (1024 * 1024)).toFixed(2) + " MB"
      });
      
      const signedUrl = signedUrls.find(url => url.partNumber === i + 1)?.signedUrl;
      if (!signedUrl) {
        throw new Error(`No signed URL found for part ${i + 1}`);
      }

      // Upload the part
      const response = await fetch(signedUrl, {
        method: 'PUT',
        body: blob,
        signal: this.abortController?.signal,
      });

      if (!response.ok) {
        console.error(`[MultipartUploader] Failed to upload part ${i + 1}:`, {
          status: response.status,
          statusText: response.statusText
        });
        throw new Error(`Failed to upload part ${i + 1}`);
      }

      // Get ETag from response headers
      const etag = response.headers.get('ETag');
      if (!etag) {
        console.error(`[MultipartUploader] No ETag returned for part ${i + 1}`);
        throw new Error(`No ETag returned for part ${i + 1}`);
      }

      console.log(`[MultipartUploader] Part ${i + 1} uploaded successfully:`, {
        etag: etag.replace(/"/g, '')
      });

      completedParts.push({
        ETag: etag.replace(/"/g, ''), // Remove quotes from ETag
        PartNumber: i + 1,
      });

      uploadedBytes += blob.size;

      if (onProgress) {
        const progress = {
          uploadedBytes,
          totalBytes: file.size,
          percentage: Math.round((uploadedBytes / file.size) * 100),
          uploadedParts: i + 1,
          totalParts,
        };
        onProgress(progress);
      }
    }

    return completedParts;
  }

  private async completeUpload(
    uploadId: string,
    key: string,
    parts: CompletedPart[]
  ): Promise<{ key: string; location: string }> {
    const requestBody = {
      uploadId,
      key,
      parts,
    };

    console.log("[MultipartUploader] Completing upload with request:", {
      uploadId,
      key,
      partsCount: parts.length
    });

    const response = await fetch('/api/upload/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      credentials: 'include',
      signal: this.abortController?.signal,
    });

    console.log("[MultipartUploader] Complete response status:", response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error("[MultipartUploader] Failed to complete upload:", error);
      throw new Error(error.error || 'Failed to complete upload');
    }

    const result = await response.json();
    console.log("[MultipartUploader] Complete response data:", result);
    
    return {
      key: result.key,
      location: result.location,
    };
  }

  async abort(): Promise<void> {
    console.log("[MultipartUploader] Abort requested");
    
    if (this.abortController) {
      this.abortController.abort();
    }

    if (this.uploadId && this.key) {
      await this.abortUpload();
    }
  }

  private async abortUpload(): Promise<void> {
    if (!this.uploadId || !this.key) return;

    console.log("[MultipartUploader] Aborting upload:", {
      uploadId: this.uploadId,
      key: this.key
    });

    try {
      const response = await fetch('/api/upload/abort', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uploadId: this.uploadId,
          key: this.key,
        }),
        credentials: 'include',
      });

      console.log("[MultipartUploader] Abort response status:", response.status);
    } catch (error) {
      console.error('[MultipartUploader] Failed to abort upload:', error);
    }
  }

  private cleanup(): void {
    console.log("[MultipartUploader] Cleaning up");
    this.abortController = null;
    this.uploadId = null;
    this.key = null;
  }
} 