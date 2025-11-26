import type { UploadedFile } from "./files";

export interface IMobileGalleryUploader {
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface IDropZoneProps {
    hasFiles: boolean;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFileDropped: (files: FileList) => void;
}

export interface FileDropContextType {
    uploadedFiles: UploadedFile[];
    setUploadedFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
}