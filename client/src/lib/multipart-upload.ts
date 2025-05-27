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
    
    this.abortController = new AbortController();

    try {
      // Step 1: Initiate multipart upload
      const initiateResponse = await this.initiateUpload(file, partSize);
      this.uploadId = initiateResponse.uploadId;
      this.key = initiateResponse.key;

      // Step 2: Upload parts
      const completedParts = await this.uploadParts(
        file,
        initiateResponse,
        onProgress
      );

      // Step 3: Complete upload
      const result = await this.completeUpload(
        initiateResponse.uploadId,
        initiateResponse.key,
        completedParts
      );

      if (onComplete) {
        onComplete(result);
      }

      return result;
    } catch (error) {
      if (onError) {
        onError(error as Error);
      }
      
      // Attempt to abort the upload if it was initiated
      if (this.uploadId && this.key) {
        await this.abortUpload().catch(console.error);
      }
      
      throw error;
    } finally {
      this.cleanup();
    }
  }

  private async initiateUpload(file: File, partSize?: number): Promise<InitiateUploadResponse> {
    const response = await fetch('/api/upload/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type,
        partSize,
      }),
      credentials: 'include',
      signal: this.abortController?.signal,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to initiate upload');
    }

    return response.json();
  }

  private async uploadParts(
    file: File,
    uploadInfo: InitiateUploadResponse,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<CompletedPart[]> {
    const { totalParts, partSize, signedUrls } = uploadInfo;
    const completedParts: CompletedPart[] = [];
    let uploadedBytes = 0;

    // Upload parts sequentially (could be parallelized for better performance)
    for (let i = 0; i < totalParts; i++) {
      const start = i * partSize;
      const end = Math.min(start + partSize, file.size);
      const blob = file.slice(start, end);
      
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
        throw new Error(`Failed to upload part ${i + 1}`);
      }

      // Get ETag from response headers
      const etag = response.headers.get('ETag');
      if (!etag) {
        throw new Error(`No ETag returned for part ${i + 1}`);
      }

      completedParts.push({
        ETag: etag.replace(/"/g, ''), // Remove quotes from ETag
        PartNumber: i + 1,
      });

      uploadedBytes += blob.size;

      if (onProgress) {
        onProgress({
          uploadedBytes,
          totalBytes: file.size,
          percentage: Math.round((uploadedBytes / file.size) * 100),
          uploadedParts: i + 1,
          totalParts,
        });
      }
    }

    return completedParts;
  }

  private async completeUpload(
    uploadId: string,
    key: string,
    parts: CompletedPart[]
  ): Promise<{ key: string; location: string }> {
    const response = await fetch('/api/upload/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uploadId,
        key,
        parts,
      }),
      credentials: 'include',
      signal: this.abortController?.signal,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to complete upload');
    }

    const result = await response.json();
    return {
      key: result.key,
      location: result.location,
    };
  }

  async abort(): Promise<void> {
    if (this.abortController) {
      this.abortController.abort();
    }

    if (this.uploadId && this.key) {
      await this.abortUpload();
    }
  }

  private async abortUpload(): Promise<void> {
    if (!this.uploadId || !this.key) return;

    try {
      await fetch('/api/upload/abort', {
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
    } catch (error) {
      console.error('Failed to abort upload:', error);
    }
  }

  private cleanup(): void {
    this.abortController = null;
    this.uploadId = null;
    this.key = null;
  }
} 