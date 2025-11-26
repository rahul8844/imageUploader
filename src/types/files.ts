export interface UploadedFile {
    file: File;
    preview: string;
    id: string;
    error?: string;
    uploadProgress?: number;
    uploadStatus?: 'pending' | 'uploading' | 'success' | 'error';
    cloudinaryUrl?: string;
    cloudinaryPublicId?: string;
}

export interface FileCardProps {
    file: UploadedFile;
    onReUpload?: (file: UploadedFile) => void;
}