import { cloudinary } from '../config/cloudinary';
import { env } from '../config/env';
import { Readable } from 'stream';

export class UploadService {
  private upload(buffer: Buffer, folder: string, resourceType: 'image' | 'raw' = 'image'): Promise<string> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `${env.CLOUDINARY_FOLDER}/${folder}`,
          resource_type: resourceType,
          quality: 'auto',
          fetch_format: 'auto',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result!.secure_url);
        },
      );
      Readable.from(buffer).pipe(stream);
    });
  }

  async uploadImage(buffer: Buffer, folder = 'misc'): Promise<string> {
    return this.upload(buffer, folder);
  }

  async uploadMultiple(buffers: Buffer[], folder = 'misc'): Promise<string[]> {
    return Promise.all(buffers.map((b) => this.upload(b, folder)));
  }

  async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}

export const uploadService = new UploadService();
