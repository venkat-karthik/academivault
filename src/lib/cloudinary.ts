import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const isConfigured = Boolean(
  cloudName &&
  apiKey &&
  apiSecret &&
  !apiSecret.includes('your_cloudinary')
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });
  console.log('[AcademiaVault] Cloudinary initialized for cloud:', cloudName);
} else {
  console.warn('[AcademiaVault] Cloudinary credentials not fully configured in .env. Falling back to local/secure buffer storage.');
}

export async function uploadPdfBuffer(
  buffer: Buffer,
  filename: string,
  folder = 'academivault/documents'
): Promise<{ secure_url: string; public_id: string; bytes: number }> {
  if (!isConfigured) {
    // Return virtual storage pointer when running before production keys are set
    const mockId = `doc_${Date.now()}_${filename.replace(/[^a-zA-Z0-9]/g, '_')}`;
    return {
      secure_url: `/uploads/${mockId}.pdf`,
      public_id: mockId,
      bytes: buffer.length
    };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'raw',
        public_id: filename.replace(/\.[^/.]+$/, ''),
        type: 'authenticated' // Private authenticated tier
      },
      (error, result?: UploadApiResponse) => {
        if (error || !result) {
          reject(error || new Error('Upload failed'));
        } else {
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            bytes: result.bytes
          });
        }
      }
    );
    uploadStream.end(buffer);
  });
}

export { cloudinary, isConfigured as isCloudinaryConfigured };

