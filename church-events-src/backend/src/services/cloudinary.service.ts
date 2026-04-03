import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure cloudinary with our credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const uploadImage = async (fileBuffer: Buffer, folder: string): Promise<string> => {
  // Wrap in Promise because cloudinary uses callbacks not async/await natively
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: `church-events/${folder}`,
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 600, crop: 'fit' }, // fit without cropping
          { quality: 'auto' },                        // auto optimize file size
          { fetch_format: 'auto' }                    // auto choose best format (webp etc)
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!.secure_url); // return the https URL
      }
    ).end(fileBuffer); // send the file buffer
  });
};

export const deleteImage = async (imageUrl: string): Promise<void> => {
  // Extract public_id from URL to delete it
  // URL looks like: https://res.cloudinary.com/cloud/image/upload/v123/church-events/events/abc123.jpg
  const parts = imageUrl.split('/');
  const filename = parts[parts.length - 1].split('.')[0];
  const folder = parts[parts.length - 2];
  const publicId = `${folder}/${filename}`;

  await cloudinary.uploader.destroy(publicId);
};