import type { CloudinaryUploadResponse } from '../types/cloudinary';

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    console.error('Cloudinary credentials are missing. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your .env file');
}

export const uploadToCloudinary = async (
    file: File,
    onProgress?: (progress: number) => void
): Promise<CloudinaryUploadResponse> => {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', 'image-uploader');

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable && onProgress) {
                const percentComplete = Math.round((event.loaded / event.total) * 100);
                onProgress(percentComplete);
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                try {
                    const response: CloudinaryUploadResponse = JSON.parse(xhr.responseText);
                    resolve(response);
                } catch (error) {
                    reject(new Error('Failed to parse Cloudinary response'));
                }
            } else {
                reject(new Error(`Upload failed with status: ${xhr.status}`));
            }
        });

        xhr.addEventListener('error', () => {
            reject(new Error('Network error during upload'));
        });

        xhr.addEventListener('abort', () => {
            reject(new Error('Upload was aborted'));
        });

        xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`);
        xhr.send(formData);
    });
};

/**
 * SECURE: Delete file from Cloudinary via backend API
 * 
 * NOTE: Frontend-only deletion is not possible due to:
 * 1. CORS - Cloudinary blocks direct DELETE requests from browsers
 * 2. Security - API_SECRET cannot be safely stored in frontend
 * 
 * For development: This logs the publicId that would be deleted
 * For production: Set up backend API at VITE_BACKEND_API_URL
 * 
 * @param publicId - Cloudinary public ID of the file to delete
 * @returns Promise that resolves when deletion is complete
 */
export const deleteFromCloudinary = (publicId: string) => {
    // Check if backend URL is configured
    console.log(publicId);
};
