export interface IMobileGalleryUploader {
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface FileUploaderProps {
    onFilesSelected?: (files: File[]) => void;
    onUpload?: (file: File, onProgress: (progress: number) => void) => Promise<void>;
    maxFiles?: number;
    autoUpload?: boolean;
}