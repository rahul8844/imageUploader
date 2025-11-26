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
    onRemoveFile: (id: string) => void;
    onRetryUpload?: (id: string) => void;
}


export interface IDropZoneProps {
    hasFiles: boolean;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFileDropped: (files: FileList) => void;
}