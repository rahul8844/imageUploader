export interface UploadTask {
    id: string;
    file: File;
    status: 'queued' | 'uploading' | 'success' | 'error';
    progress: number;
    cloudinaryUrl?: string;
    cloudinaryPublicId?: string;
    error?: string;
}

export interface UploadSchedulerConfig {
    maxConcurrent?: number;
    onProgress?: (taskId: string, progress: number) => void;
    onSuccess?: (taskId: string, url: string, publicId: string) => void;
    onError?: (taskId: string, error: string) => void;
    onQueueUpdate?: (queueLength: number, activeCount: number) => void;
}
