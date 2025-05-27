# Large File Upload API

This API provides endpoints for uploading very large files (100MB - 10GB) using S3 multipart uploads with signed URLs.

## Environment Variables Required

```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
S3_BUCKET_NAME=your-upload-bucket-name
```

## API Endpoints

### 1. Initiate Upload

**POST** `/api/upload/initiate`

Initiates a multipart upload and returns signed URLs for all parts.

**Request Body:**
```json
{
  "fileName": "large-video.mp4",
  "fileSize": 1073741824,
  "contentType": "video/mp4",
  "partSize": 10485760
}
```

**Response:**
```json
{
  "uploadId": "upload-id-from-s3",
  "key": "uploads/user123/1234567890-abc123-large-video.mp4",
  "bucket": "your-bucket-name",
  "totalParts": 100,
  "partSize": 10485760,
  "signedUrls": [
    {
      "partNumber": 1,
      "signedUrl": "https://s3.amazonaws.com/..."
    },
    {
      "partNumber": 2,
      "signedUrl": "https://s3.amazonaws.com/..."
    }
  ],
  "expiresIn": 3600
}
```

### 2. Complete Upload

**POST** `/api/upload/complete`

Completes the multipart upload after all parts have been uploaded.

**Request Body:**
```json
{
  "uploadId": "upload-id-from-s3",
  "key": "uploads/user123/1234567890-abc123-large-video.mp4",
  "parts": [
    {
      "ETag": "\"etag-from-part-1\"",
      "PartNumber": 1
    },
    {
      "ETag": "\"etag-from-part-2\"",
      "PartNumber": 2
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "location": "https://s3.amazonaws.com/bucket/key",
  "key": "uploads/user123/1234567890-abc123-large-video.mp4",
  "uploadId": "upload-id-from-s3",
  "message": "Upload completed successfully"
}
```

### 3. Abort Upload

**POST** `/api/upload/abort`

Aborts a multipart upload and cleans up any uploaded parts.

**Request Body:**
```json
{
  "uploadId": "upload-id-from-s3",
  "key": "uploads/user123/1234567890-abc123-large-video.mp4"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Upload aborted successfully",
  "uploadId": "upload-id-from-s3",
  "key": "uploads/user123/1234567890-abc123-large-video.mp4"
}
```

### 4. Get Upload Status

**GET** `/api/upload/status/:uploadId/:key`

Gets the current status of a multipart upload.

**Response:**
```json
{
  "uploadId": "upload-id-from-s3",
  "key": "uploads/user123/1234567890-abc123-large-video.mp4",
  "uploadedParts": 50,
  "parts": [
    {
      "ETag": "\"etag-from-part-1\"",
      "PartNumber": 1
    }
  ]
}
```

### 5. Regenerate Signed URLs

**POST** `/api/upload/regenerate-urls`

Regenerates signed URLs for specific parts (useful when URLs expire).

**Request Body:**
```json
{
  "uploadId": "upload-id-from-s3",
  "key": "uploads/user123/1234567890-abc123-large-video.mp4",
  "partNumbers": [1, 2, 3]
}
```

**Response:**
```json
{
  "signedUrls": [
    {
      "partNumber": 1,
      "signedUrl": "https://s3.amazonaws.com/..."
    },
    {
      "partNumber": 2,
      "signedUrl": "https://s3.amazonaws.com/..."
    }
  ],
  "expiresIn": 3600
}
```

## Usage Flow

1. **Initiate Upload**: Call `/api/upload/initiate` with file details
2. **Upload Parts**: Use the signed URLs to upload file parts directly to S3
3. **Complete Upload**: Call `/api/upload/complete` with ETags from all parts
4. **Handle Errors**: Use `/api/upload/abort` if needed

## File Size Constraints

- Minimum file size: 100MB
- Maximum file size: 10GB
- Part size range: 5MB - 100MB
- Default part size: 10MB
- Maximum parts: 10,000 (S3 limit)

## Error Handling

All endpoints return appropriate HTTP status codes:
- `400`: Validation errors or invalid requests
- `500`: Server errors or S3 operation failures

Error responses include detailed error messages and validation details when applicable. 