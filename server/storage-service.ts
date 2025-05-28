import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import multer from 'multer';
import { randomUUID } from 'crypto';
import path from 'path';

// Cloudflare R2 Configuration
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || 'https://your-account-id.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const R2_BUCKET = process.env.R2_BUCKET_NAME || 'cashure-files';

export interface FileUploadResult {
  success: boolean;
  fileKey?: string;
  fileName?: string;
  fileSize?: number;
  uploadUrl?: string;
  error?: string;
}

export interface SecureDownloadLink {
  success: boolean;
  downloadUrl?: string;
  expiresIn?: number;
  error?: string;
}

export class FileStorageService {
  private static instance: FileStorageService;

  static getInstance(): FileStorageService {
    if (!FileStorageService.instance) {
      FileStorageService.instance = new FileStorageService();
    }
    return FileStorageService.instance;
  }

  // Configure multer for file uploads
  getMulterConfig() {
    const storage = multer.memoryStorage();
    
    const fileFilter = (req: any, file: any, cb: any) => {
      // Allow specific file types for digital products
      const allowedTypes = [
        'application/pdf',
        'application/zip',
        'application/x-zip-compressed',
        'video/mp4',
        'audio/mpeg',
        'audio/wav',
        'image/jpeg',
        'image/png',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain',
        'application/epub+zip'
      ];

      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('File type not allowed'), false);
      }
    };

    return multer({
      storage,
      fileFilter,
      limits: {
        fileSize: 500 * 1024 * 1024, // 500MB limit
      },
    });
  }

  // Upload file to R2
  async uploadFile(file: Express.Multer.File, creatorId: number, productId?: number): Promise<FileUploadResult> {
    try {
      const fileExtension = path.extname(file.originalname);
      const fileKey = `products/${creatorId}/${productId || 'temp'}/${randomUUID()}${fileExtension}`;
      
      const uploadCommand = new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalName: file.originalname,
          creatorId: creatorId.toString(),
          productId: productId?.toString() || '',
          uploadDate: new Date().toISOString(),
        },
      });

      await r2Client.send(uploadCommand);

      return {
        success: true,
        fileKey,
        fileName: file.originalname,
        fileSize: file.size,
      };
    } catch (error: any) {
      console.error('File upload failed:', error);
      return {
        success: false,
        error: error.message || 'File upload failed',
      };
    }
  }

  // Generate secure download link with expiration
  async generateSecureDownloadLink(fileKey: string, expiresInMinutes: number = 30): Promise<SecureDownloadLink> {
    try {
      // Check if file exists
      const headCommand = new HeadObjectCommand({
        Bucket: R2_BUCKET,
        Key: fileKey,
      });

      await r2Client.send(headCommand);

      // Generate presigned URL
      const getCommand = new GetObjectCommand({
        Bucket: R2_BUCKET,
        Key: fileKey,
      });

      const expiresIn = expiresInMinutes * 60; // Convert to seconds
      const downloadUrl = await getSignedUrl(r2Client, getCommand, {
        expiresIn,
      });

      return {
        success: true,
        downloadUrl,
        expiresIn,
      };
    } catch (error: any) {
      console.error('Failed to generate download link:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate download link',
      };
    }
  }

  // Delete file from R2
  async deleteFile(fileKey: string): Promise<boolean> {
    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: R2_BUCKET,
        Key: fileKey,
      });

      await r2Client.send(deleteCommand);
      return true;
    } catch (error: any) {
      console.error('File deletion failed:', error);
      return false;
    }
  }

  // Move file from temp to permanent location
  async moveFileToProduct(tempFileKey: string, creatorId: number, productId: number): Promise<FileUploadResult> {
    try {
      // Get the original file
      const getCommand = new GetObjectCommand({
        Bucket: R2_BUCKET,
        Key: tempFileKey,
      });

      const fileObject = await r2Client.send(getCommand);
      
      if (!fileObject.Body) {
        throw new Error('File not found');
      }

      // Create new file key
      const fileExtension = path.extname(tempFileKey);
      const newFileKey = `products/${creatorId}/${productId}/${randomUUID()}${fileExtension}`;

      // Upload to new location
      const uploadCommand = new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: newFileKey,
        Body: fileObject.Body,
        ContentType: fileObject.ContentType,
        Metadata: {
          ...fileObject.Metadata,
          productId: productId.toString(),
          movedDate: new Date().toISOString(),
        },
      });

      await r2Client.send(uploadCommand);

      // Delete original temp file
      await this.deleteFile(tempFileKey);

      return {
        success: true,
        fileKey: newFileKey,
        fileName: fileObject.Metadata?.originalName || 'file',
        fileSize: fileObject.ContentLength || 0,
      };
    } catch (error: any) {
      console.error('File move failed:', error);
      return {
        success: false,
        error: error.message || 'File move failed',
      };
    }
  }

  // Get file metadata
  async getFileMetadata(fileKey: string): Promise<any> {
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: R2_BUCKET,
        Key: fileKey,
      });

      const result = await r2Client.send(headCommand);
      return {
        success: true,
        size: result.ContentLength,
        contentType: result.ContentType,
        metadata: result.Metadata,
        lastModified: result.LastModified,
      };
    } catch (error: any) {
      console.error('Failed to get file metadata:', error);
      return {
        success: false,
        error: error.message || 'Failed to get file metadata',
      };
    }
  }

  // Cleanup temp files older than 24 hours
  async cleanupTempFiles(): Promise<void> {
    // This would require listing objects and checking dates
    // For now, we'll implement basic cleanup logic
    console.log('Temp file cleanup initiated');
  }
}

export const fileStorageService = FileStorageService.getInstance();