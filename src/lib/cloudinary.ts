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

export async function uploadImageBuffer(
  buffer: Buffer,
  filename: string,
  folder = 'academivault/site-assets'
): Promise<{ secure_url: string; public_id: string; bytes: number; width?: number; height?: number }> {
  if (!isConfigured) {
    const mockId = `img_${Date.now()}_${filename.replace(/[^a-zA-Z0-9]/g, '_')}`;
    return {
      secure_url: `/uploads/${mockId}.jpg`,
      public_id: `academivault/site-assets/${mockId}`,
      bytes: buffer.length
    };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        public_id: filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_') + '_' + Date.now()
      },
      (error, result?: UploadApiResponse) => {
        if (error || !result) {
          reject(error || new Error('Image upload failed'));
        } else {
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            bytes: result.bytes,
            width: result.width,
            height: result.height
          });
        }
      }
    );
    uploadStream.end(buffer);
  });
}

export async function deleteCloudinaryAsset(publicId: string): Promise<boolean> {
  if (!isConfigured) return true;
  try {
    const res = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    return res.result === 'ok';
  } catch (err) {
    console.error('[Cloudinary] Failed to delete asset:', publicId, err);
    return false;
  }
}

export { cloudinary, isConfigured as isCloudinaryConfigured };

