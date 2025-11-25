export interface UploadedFile {
    file: File;
    preview: string;
    id: string;
    error?: string;
    uploadProgress?: number;
    uploadStatus?: 'pending' | 'uploading' | 'success' | 'error';
}

export interface FileCardProps {
    file: UploadedFile;
    onRemoveFile: (id: string) => void;
}